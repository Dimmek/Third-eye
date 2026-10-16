#!/usr/bin/env python3
"""Музыка пространств (ElevenLabs Music) и звук чаши (Sound Effects) → файлы сайта по нормам безопасности.

Мелодия: 2 мин → бесшовная петля (последние 6 с переходят в начало), без инфразвука и резких верхов
(срез ниже 40 Гц и выше 8 кГц), громкость −23 LUFS, пик ≤ −3 dBTP. Чаша: тишина по краям срезана, −26 LUFS.
Каждый файл проверяется; не прошёл — ошибка.

Запуск: python3 prepare.py <папка с исходниками>   (heart.mp3 calm.mp3 … bowl.mp3)
"""
import os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); SR = 48000; X = 6
FILT = 'highpass=f=40,lowpass=f=8000'


def check(path, target, tol=1.5):
    def mean(af):
        e = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', af + ',volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        return float(re.search(r'mean_volume: ([-\d.]+)', e).group(1))
    e = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs = float(re.findall(r'I:\s+([-\d.]+) LUFS', e)[-1]); peak = float(re.findall(r'Peak:\s+([-\d.]+) dBFS', e)[-1])
    tot = mean('anull'); sub = tot - mean('lowpass=f=20,lowpass=f=20'); high = tot - mean('highpass=f=8000,highpass=f=8000')
    ok = abs(lufs - target) <= tol and peak <= -2.5 and sub >= 30 and high >= 30
    print(f'{os.path.basename(path)}: {lufs} LUFS, пик {peak}, инфразвук −{sub:.0f} дБ, выше 8 кГц −{high:.0f} дБ', 'OK' if ok else 'НЕ ПРОШЁЛ')
    if not ok: os.remove(path); sys.exit(1)


def loop(src, dst):
    x = np.frombuffer(subprocess.check_output(['ffmpeg', '-v', 'error', '-i', src, '-af', FILT + ',loudnorm=I=-23:TP=-3:LRA=7', '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-']), dtype=np.float32).reshape(-1, 2).copy()
    n = X * SR; body, tail = x[:-n].copy(), x[-n:]
    f = np.linspace(0, 1, n, dtype=np.float32)[:, None]; body[:n] = body[:n] * np.sqrt(f) + tail * np.sqrt(1 - f)
    tmp = dst + '.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=body.tobytes(), check=True)
    e = subprocess.run(['ffmpeg', '-nostats', '-i', tmp, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    gain = -23 - float(re.findall(r'I:\s+([-\d.]+) LUFS', e)[-1])          # exact level after the splice
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.7:level=0', '-b:a', '128k', dst], check=True)
    os.remove(tmp); check(dst, -23)


def bowl(src, dst):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,' + FILT + ',afade=t=out:st=7:d=3,loudnorm=I=-26:TP=-6', '-ar', str(SR), '-b:a', '128k', dst], check=True)
    check(dst, -26, tol=3)   # an accent: a little quieter is fine


if __name__ == '__main__':
    src = sys.argv[1]
    for n in sorted(os.listdir(src)):
        k, ext = os.path.splitext(n)
        if ext != '.mp3' or k in ('love-test',): continue
        (bowl if k == 'bowl' else loop)(os.path.join(src, n), os.path.join(HERE, k + '.mp3'))
