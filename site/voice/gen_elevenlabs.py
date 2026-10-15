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
  - смысловые паузы в тексте: между предложениями, после тире и «На выдохе / На вдохе»;
  - после синтеза все паузы приводятся к одной сетке (PAUSES), поэтому у обоих голосов один ритм;
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
# pause grid after synthesis, seconds: (longer than, becomes)
PAUSES = [(1.0, 1.6), (0.45, 0.9), (0.18, 0.45)]   # between phrases, between sentences, comma


def br(s):
    return f' <break time="{s}s" /> '


def prepare(lines, lang):
    out = []
    for l in lines:
        if lang == 'ru':
            l = re.sub(r'([Чч])акр', lambda m: m.group(1) + 'а́кр', l)
            l = re.sub(r'^(На (?:вдохе|выдохе))\s+', r'\1,' + br(0.4), l)
        else:
            l = re.sub(r'^(As you (?:breathe in|breathe out|inhale|exhale)),?\s+', r'\1,' + br(0.4), l)
        l = re.sub(r'\s+—\s+', ' —' + br(0.4), l)
        l = re.sub(r'([.!?…])\s+(?=\S)', r'\1' + br(0.8), l)
        out.append(l)
    return br(1.5).join(out)


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


def even_pauses(mp3, sr=44100):
    """Rewrite every inner silence to the PAUSES grid, so both voices breathe the same."""
    x = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-']),
                      dtype=np.int16).astype(np.float32)
    hop = sr // 100; n = len(x) // hop
    loud = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) > 0.01 * 32768
    out, i = [], 0
    while i < n:
        j = i
        while j < n and loud[j] == loud[i]:
            j += 1
        seg = x[i * hop:j * hop]
        if not loud[i] and 0 < i and j < n:
            d = (j - i) / 100
            t = next((v for lim, v in PAUSES if d > lim), d)
            k = int(t * sr); h = min(len(seg), k) // 2
            seg = np.concatenate([seg[:h], np.zeros(k - 2 * h, np.float32), seg[len(seg) - h:]])
        out.append(seg); i = j
    y = np.concatenate(out + [x[n * hop:]]).astype(np.int16)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(sr), '-ac', '1', '-i', '-', '-b:a', '128k', mp3],
                   input=y.tobytes(), check=True)


def say(lang, g, lines, dst):
    v = CFG[lang][g]
    settings = dict(CFG['settings'], speed=CFG['speed'][g])
    audio = req(f'/text-to-speech/{v}?output_format=mp3_44100_128',
                {'text': prepare(lines, lang), 'model_id': MODEL, 'voice_settings': settings}).read()
    open(dst, 'wb').write(audio); even_pauses(dst)


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
