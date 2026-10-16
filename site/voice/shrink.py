#!/usr/bin/env python3
"""Второй проход после gen_elevenlabs.py: паузы внутри фразы 0,6–1,2 с → 0,45 с (паузы между фразами 1,6 и 3 с остаются).
Запуск: python3 shrink.py ru/f/ключ.mp3 …"""

import sys,subprocess,numpy as np
SR=44100
def run(f):
  x=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',f,'-ac','1','-ar',str(SR),'-f','s16le','-']),dtype=np.int16).astype(np.float32)
  hop=SR//100;n=len(x)//hop;loud=np.sqrt((x[:n*hop].reshape(n,hop)**2).mean(1))>0.01*32768
  out=[];i=0;ch=0
  while i<n:
    j=i
    while j<n and loud[j]==loud[i]: j+=1
    seg=x[i*hop:j*hop]
    if not loud[i] and 0<i and j<n and 0.6<(j-i)/100<1.2:
      k=int(0.45*SR);h=int(0.1*SR);seg=np.concatenate([seg[:h],np.zeros(k-2*h,np.float32),seg[-h:]]);ch+=1
    out.append(seg);i=j
  if ch:
    y=np.concatenate(out+[x[n*hop:]]).astype(np.int16)
    subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-b:a','128k',f],input=y.tobytes(),check=True)
  return ch
tot=0
for f in sys.argv[1:]:
  if f.endswith('-count.mp3'): continue
  tot+=run(f)
print('shortened',tot)
