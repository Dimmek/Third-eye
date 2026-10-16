#!/usr/bin/env python3
"""Фоновые звуки частот сольфеджио по рецепту живых записей (174–528 Гц):
основной тон + октава ниже + мягкий бас 55–110 Гц, «плавающая» расстройка (хорус, ~1 Гц
между копиями и между ушами), медленная волна громкости раз в ~3 с (0,35 Гц).

Петля 180 с бесшовна математически: все частоты кратны 1/180 Гц.

Безопасность (проверяется для каждого файла, иначе ошибка):
  громкость −23 LUFS, пик ≤ −3 dBTP; энергия ниже 20 Гц и выше 8 кГц — на 30 дБ тише общей;
  высокие частоты (> 600 Гц) тише и мягче — ухо к ним чувствительнее.

Запуск: python3 make_beds.py 639 741 ...   (без аргументов — все недостающие)
"""
import os, re, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR, T = 48000, 180
ALL = [111, 222, 333, 432, 444, 555, 639, 741, 777, 852, 888, 963, 999, 1111]
q = lambda f: round(f * T) / T          # snap to the loop grid, so the loop has no seam


def partial(t, f, amp, detunes, phase):
    return amp * sum(np.sin(2 * np.pi * (q(f) + d) * t + p) for d, p in zip(detunes, phase)) / len(detunes)


def bed(f, seed):
    rng = np.random.default_rng(seed); t = np.arange(SR * T) / SR
    bass = f
    while bass >= 110: bass /= 2                           # a soft bass between 55 and 110 Hz
    hi = 0.55 if f > 600 else 1.0                          # high tones quieter: the ear is more sensitive there
    parts = [(f, 0.55 * hi), (f / 2, 0.45), (bass, 0.5), (f * 2, 0.04 * hi)]
    out = []
    for side in (0, 1):                                    # left and right get their own slow detune: width, not a hard beat
        dets = [0, (5 + 2 * side) / T * 36, -(4 + side) / T * 36]     # ≈ ±0.8–1.4 Hz
        sig = sum(partial(t, pf, a, dets, rng.uniform(0, 2 * np.pi, 3)) for pf, a in parts)
        out.append(sig)
    swell = 1 - 0.3 * (0.5 + 0.5 * np.sin(2 * np.pi * q(0.35) * t))   # a slow wave, like breathing
    x = np.stack(out, 1) * swell[:, None]
    return (x / np.abs(x).max() * 0.5).astype(np.float32)


def measure(path):
    def mean(af):
        e = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', af + ',volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
        return float(re.search(r'mean_volume: ([-\d.]+)', e).group(1))
    e = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs = float(re.findall(r'I:\s+([-\d.]+) LUFS', e)[-1]); peak = float(re.findall(r'Peak:\s+([-\d.]+) dBFS', e)[-1])
    tot = mean('anull')
    return lufs, peak, tot - mean('lowpass=f=20,lowpass=f=20'), tot - mean('highpass=f=8000,highpass=f=8000')


def main():
    for f in [int(a) for a in sys.argv[1:]] or ALL:
        dst = os.path.join(HERE, f'{f}.mp3')
        x = bed(f, f)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-',
                        '-af', 'loudnorm=I=-23:TP=-3:LRA=7', '-ar', str(SR), '-b:a', '96k', dst], input=x.tobytes(), check=True)
        lufs, peak, sub, high = measure(dst)
        ok = -24.5 <= lufs <= -21.5 and peak <= -2.5 and sub >= 30 and high >= 30
        print(f'{f} Гц: {lufs} LUFS, пик {peak} dBFS, инфразвук −{sub:.0f} дБ, высокие −{high:.0f} дБ', 'OK' if ok else 'НЕ ПРОШЁЛ ПРОВЕРКУ')
        if not ok: os.remove(dst); sys.exit(1)


if __name__ == '__main__':
    main()
