#!/usr/bin/env python3
"""Озвучка всех фрагментов из script.md через ElevenLabs.

Переменные окружения:
  ELEVENLABS_API_KEY   — ключ (обязательно)
  ELEVEN_VOICE_F       — voice_id женского голоса
  ELEVEN_VOICE_M       — voice_id мужского голоса
  (без них берутся "f"/"m" из voices.json; там же список кандидатов)

Запуск:
  python3 gen_elevenlabs.py --list            # показать доступные голоса
  python3 gen_elevenlabs.py --samples         # короткий образец каждого кандидата из voices.json
  python3 gen_elevenlabs.py f                 # женский → f/<ключ>.mp3
  python3 gen_elevenlabs.py m cocoon breath   # только выбранные ключи

Пишет f/manifest.json (m/manifest.json) со списком готовых ключей.
Уже готовые файлы пропускает (флаг --force перезаписывает).
"""
import json, os, re, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
API = 'https://api.elevenlabs.io/v1'
KEY = os.environ.get('ELEVENLABS_API_KEY', '')
MODEL = os.environ.get('ELEVEN_MODEL', 'eleven_multilingual_v2')
# Медленно, ровно, без «дикторской» подачи.
SETTINGS = {'stability': 0.62, 'similarity_boost': 0.8, 'style': 0.12,
            'use_speaker_boost': True, 'speed': 0.88}
PAUSE = '<break time="1.4s" />'


def req(path, body=None):
    r = urllib.request.Request(API + path, headers={'xi-api-key': KEY, 'Content-Type': 'application/json'},
                               data=json.dumps(body).encode() if body else None)
    return urllib.request.urlopen(r, timeout=120)


def fragments():
    out, key = {}, None
    for line in open(os.path.join(HERE, 'script.md'), encoding='utf-8'):
        m = re.match(r'^##\s+(\S+)', line)
        if m:
            key = m.group(1); out[key] = []
        elif key and line.strip():
            out[key].append(line.strip())
    return out


def main():
    if not KEY:
        sys.exit('Нет ELEVENLABS_API_KEY')
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--list' in sys.argv:
        for v in json.load(req('/voices'))['voices']:
            print(v['voice_id'], v['name'], v.get('labels', {}))
        return
    if '--samples' in sys.argv:  # a short sample of every candidate from voices.json, to choose by ear
        cfg = json.load(open(os.path.join(HERE, 'voices.json'))); d = os.path.join(HERE, 'samples'); os.makedirs(d, exist_ok=True)
        text = 'Сядьте удобно. Сделайте медленный вдох. И длинный, спокойный выдох. ' + PAUSE + ' Посмотрите на золотую сферу. Вы внутри неё.'
        for vid in cfg['candidates']:
            info = json.load(req('/voices/' + vid)); print(vid, info.get('name'), info.get('labels', {}))
            r = req('/text-to-speech/' + vid + '?output_format=mp3_44100_128', {'text': text, 'model_id': MODEL, 'voice_settings': SETTINGS})
            open(os.path.join(d, vid + '.mp3'), 'wb').write(r.read())
        return
    g = args[0] if args else 'f'
    voice = os.environ.get('ELEVEN_VOICE_F' if g == 'f' else 'ELEVEN_VOICE_M') or json.load(open(os.path.join(HERE, 'voices.json'))).get(g)
    if not voice:
        sys.exit('Нет voice_id: задайте ELEVEN_VOICE_F / ELEVEN_VOICE_M (см. --list)')
    frags = fragments()
    keys = args[1:] or list(frags)
    d = os.path.join(HERE, g); os.makedirs(d, exist_ok=True)
    for k in keys:
        f = os.path.join(d, k + '.mp3')
        if os.path.exists(f) and '--force' not in sys.argv:
            continue
        text = f' {PAUSE} '.join(frags[k])
        for attempt in range(4):
            try:
                audio = req(f'/text-to-speech/{voice}?output_format=mp3_44100_128',
                            {'text': text, 'model_id': MODEL, 'voice_settings': SETTINGS}).read()
                open(f, 'wb').write(audio); print('ok', g, k, len(audio)); break
            except urllib.error.HTTPError as e:
                print('err', k, e.code, e.read()[:200]); time.sleep(2 ** (attempt + 1))
    done = sorted(os.path.splitext(n)[0] for n in os.listdir(d) if n.endswith('.mp3'))
    json.dump(done, open(os.path.join(d, 'manifest.json'), 'w'))
    print('manifest:', len(done), 'из', len(frags))


if __name__ == '__main__':
    main()
