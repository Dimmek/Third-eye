#!/usr/bin/env python3
"""Склеивает фоновые аффирмации в один файл на пространство: <язык>/<голос>/aff-<набор>.mp3
и aff.json с началом и длительностью каждой фразы (секунды). Один файл вместо восьми —
меньше запросов и файлов на хостинге.

Запуск: python3 aff_sprites.py ru f   (после gen_elevenlabs.py с ключами aff-*)
"""
import json, os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); SR = 44100; GAP = 0.5


def pcm(path):
    return np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-']), dtype=np.int16)


def main():
    lang, g = sys.argv[1:3]; d = os.path.join(HERE, lang, g); sets = {}
    for n in os.listdir(d):
        m = re.match(r'aff-([a-z]+)-(\d+)\.mp3$', n)
        if m: sets.setdefault(m.group(1), []).append((int(m.group(2)), n))
    index = {}
    for k, files in sorted(sets.items()):
        parts, marks, t = [], [], 0.0
        for _, n in sorted(files):
            x = pcm(os.path.join(d, n)); parts += [x, np.zeros(int(GAP * SR), np.int16)]
            marks.append([round(t, 3), round(len(x) / SR, 3)]); t += len(x) / SR + GAP
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', '-b:a', '96k', os.path.join(d, 'aff-' + k + '.mp3')],
                       input=np.concatenate(parts).tobytes(), check=True)
        index[k] = marks
    json.dump(index, open(os.path.join(d, 'aff.json'), 'w')); print(lang, g, {k: len(v) for k, v in index.items()})


if __name__ == '__main__':
    main()
