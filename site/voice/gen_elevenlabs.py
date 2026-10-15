#!/usr/bin/env python3
"""Озвучка всех фрагментов через ElevenLabs.

Тексты: script.md (ru), script.en.md (en). Голоса и темп: voices.json.

Запуск:
  python3 gen_elevenlabs.py ru f                # русский женский → ru/f/<ключ>.mp3
  python3 gen_elevenlabs.py en m cocoon breath  # только выбранные ключи
  python3 gen_elevenlabs.py ru f --force        # перезаписать готовые
  python3 gen_elevenlabs.py --sample            # образец «Золотой сферы» всеми голосами → samples/

Пишет <язык>/<голос>/manifest.json со списком готовых ключей.

Как получается медитативная подача:
  - каждое предложение синтезируется отдельно (с соседними фразами как контекстом интонации)
    и склеивается с точной паузой: после команды («Сядьте удобно.») 3 с — чтобы успеть её выполнить,
    между фразами 1,8 с, между предложениями одной фразы 1 с;
  - паузы внутри предложения (запятая, тире) выравниваются (INNER), поэтому у обоих голосов один ритм;
  - ударение в слове «чакра» задано явно (ча́кра).
"""
import json, os, re, subprocess, sys, time, urllib.request, urllib.error

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
API = 'https://api.elevenlabs.io/v1'
KEY = os.environ.get('ELEVENLABS_API_KEY', '')
MODEL = os.environ.get('ELEVEN_MODEL', 'eleven_multilingual_v2')
CFG = json.load(open(os.path.join(HERE, 'voices.json'), encoding='utf-8'))
SCRIPTS = {'ru': 'script.md', 'en': 'script.en.md'}
SR = 44100
ACT_PAUSE, LINE_PAUSE, SENT_PAUSE = 3.0, 1.8, 1.0   # an instruction gets time to be done: «Сядьте удобно.» … 3 s
INNER = [(0.5, 0.8), (0.3, 0.5)]   # pauses inside one sentence (dash, comma): (longer than, becomes)
EN_ACT = r'(?:Sit|Close|Open|Take|Breathe|Feel|Imagine|Picture|Focus|Notice|Remember|Bring|Let|Look|Relax|Place|Rest|Stay|Think|Find|Ask|Say|Thank|Choose|Read|Lie|Count|Repeat|Keep|Allow|Listen|Smile|Direct|Release)'


def is_action(sentence, lang):
    w = sentence.split()[0] if sentence.split() else ''
    return bool(re.match(r'[А-ЯЁ][а-яё]+(?:те|тесь)[,.]?$', w)) or w in ('Вдох.', 'Выдох.') if lang == 'ru' \
        else bool(re.match(EN_ACT + r'\b', sentence))


def units(lines, lang):
    """Sentences to synthesize one by one, each with the exact pause that follows it."""
    out = []
    for i, l in enumerate(lines):
        if lang == 'ru':
            l = re.sub(r'([Чч])акр', lambda m: m.group(1) + 'а\u0301кр', l)
            l = re.sub(r'^(На (?:вдохе|выдохе))\s+', r'\1, ', l)
        parts = re.split(r'(?<=[.!?…])\s+(?=\S)', l)
        for j, p in enumerate(parts):
            last = j == len(parts) - 1
            out.append([p, ACT_PAUSE if is_action(p, lang) else (LINE_PAUSE if last else SENT_PAUSE)])
    if out:
        out[-1][1] = 0
    return out


def req(path, body=None):
    r = urllib.request.Request(API + path, headers={'xi-api-key': KEY, 'Content-Type': 'application/json'},
                               data=json.dumps(body).encode() if body else None)
    return urllib.request.urlopen(r, timeout=120)


def fragments(lang):
    out, key = {}, None
    for line in open(os.path.join(HERE, SCRIPTS[lang]), encoding='utf-8'):
        m = re.match(r'^##\s+(\S+)', line)
        if m:
            key = m.group(1); out[key] = []
        elif key and line.strip():
            out[key].append(line.strip())
    return out


def pcm(mp3_bytes):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', '-', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                                        input=mp3_bytes, capture_output=True, check=True).stdout, dtype=np.int16).astype(np.float32)


def tidy(x):
    """Trim the edges and bring pauses inside the sentence to INNER, so both voices breathe the same."""
    hop = SR // 100; n = len(x) // hop
    loud = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) > 0.01 * 32768
    if not loud.any():
        return x[:0]
    a, b = np.argmax(loud), n - np.argmax(loud[::-1])
    out, i = [], a
    while i < b:
        j = i
        while j < b and loud[j] == loud[i]:
            j += 1
        seg = x[i * hop:j * hop]
        if not loud[i]:
            d = (j - i) / 100; t = next((v for lim, v in INNER if d > lim), d)
            k = int(t * SR); h = min(len(seg), k) // 2
            seg = np.concatenate([seg[:h], np.zeros(k - 2 * h, np.float32), seg[len(seg) - h:]])
        out.append(seg); i = j
    fade = np.linspace(0, 1, SR // 50, dtype=np.float32)
    y = np.concatenate([x[max(0, a * hop - SR // 20):a * hop] * np.linspace(0, 1, min(SR // 20, a * hop), dtype=np.float32)] + out +
                       [x[b * hop:b * hop + SR // 10] * np.linspace(1, 0, len(x[b * hop:b * hop + SR // 10]), dtype=np.float32)])
    y[:len(fade)] *= fade[:len(y)]
    return y


def say(lang, g, lines, dst):
    v = CFG[lang][g]
    settings = dict(CFG['settings'], speed=CFG['speed'][g])
    us = units(lines, lang); out = []
    for i, (text, pause) in enumerate(us):
        body = {'text': text, 'model_id': MODEL, 'voice_settings': settings,
                'previous_text': ' '.join(t for t, _ in us[max(0, i - 2):i]) or None,
                'next_text': ' '.join(t for t, _ in us[i + 1:i + 3]) or None}
        out += [tidy(pcm(req(f'/text-to-speech/{v}?output_format=mp3_44100_128', body).read())), np.zeros(int(pause * SR), np.float32)]
    y = np.clip(np.concatenate(out), -32768, 32767).astype(np.int16)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-b:a', '128k', dst],
                   input=y.tobytes(), check=True)


def main():
    if not KEY:
        sys.exit('Нет ELEVENLABS_API_KEY')
    if '--sample' in sys.argv:
        d = os.path.join(HERE, 'samples'); os.makedirs(d, exist_ok=True)
        for lang in CFG['langs']:
            if not os.path.exists(os.path.join(HERE, SCRIPTS[lang])):
                continue
            for g in ('f', 'm'):
                say(lang, g, fragments(lang)['cocoon'], os.path.join(d, f'{lang}-{g}.mp3')); print('ok', lang, g)
        return
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2 or args[0] not in SCRIPTS or args[1] not in ('f', 'm'):
        sys.exit(__doc__)
    lang, g = args[:2]
    frags = fragments(lang)
    d = os.path.join(HERE, lang, g); os.makedirs(d, exist_ok=True)
    for k in args[2:] or list(frags):
        f = os.path.join(d, k + '.mp3')
        if os.path.exists(f) and '--force' not in sys.argv:
            continue
        for attempt in range(4):
            try:
                say(lang, g, frags[k], f); print('ok', lang, g, k); break
            except urllib.error.HTTPError as e:
                print('err', k, e.code, e.read()[:200]); time.sleep(2 ** (attempt + 1))
    done = sorted(os.path.splitext(n)[0] for n in os.listdir(d) if n.endswith('.mp3'))
    json.dump(done, open(os.path.join(d, 'manifest.json'), 'w'))
    print('manifest:', len(done), 'из', len(frags))


if __name__ == '__main__':
    main()
