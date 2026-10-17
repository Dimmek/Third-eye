#!/usr/bin/env python3
"""Генерация 6 музыкальных треков пространств через ElevenLabs Music (2 мин, без ритма). Затем: ровная середина 84–90 с → prepare.py (петля, −23 LUFS, проверки)."""
import json,os,urllib.request,concurrent.futures as cf
key=os.environ['ELEVENLABS_API_KEY']
BASE=("Deep, slow ambient meditation music for a quiet meditation space. No drums, no beat, no rhythm, no percussion, no vocals, no melody hooks. "
"Consistent low, soft dynamics, no build-ups, no sudden changes, nothing sharp or bright. Beatless, spacious, immersive, warm, gently evolving. ")
P={
'heart':"Warm, tender and loving: soft warm string-like pads, very sparse gentle felt-piano notes with long reverb, a low soft drone. Key of C major.",
'calm':"Very calm and grounding, like slow breathing: soft airy pads, gentle low drone, occasional distant soft chime, ocean-like slow swells. Key of D major.",
'cleanse':"Light, clear and flowing like clean water and soft light: shimmering soft pads, gentle slow harp-like glints far in the distance, airy texture. Key of A major.",
'power':"Quietly uplifting and hopeful, sunrise warmth: rich warm pads slowly opening, sparse soft piano, gentle sense of space and clarity, still beatless and soft. Key of E major.",
'body':"Soft, soothing and nurturing: velvety low pads, gentle cello-like long tones, very sparse soft piano, cozy and safe. Key of F major.",
'spirit':"Deep, cosmic and contemplative: vast dark-blue pads, very low soft drone, distant crystalline shimmer, feeling of stars and stillness. Key of G major.",
}
def one(k):
    body=json.dumps({"prompt":BASE+P[k],"music_length_ms":120000,"model_id":"music_v1","force_instrumental":True}).encode()
    for a in range(3):
        try:
            r=urllib.request.Request('https://api.elevenlabs.io/v1/music',data=body,headers={'xi-api-key':key,'Content-Type':'application/json'})
            d=urllib.request.urlopen(r,timeout=400).read(); open(f'gen/{k}.mp3','wb').write(d); return k,'ok',len(d)
        except Exception as e: err=str(e)
    return k,'fail',err
with cf.ThreadPoolExecutor(2) as ex:
    for res in ex.map(one,P): print(*res, flush=True)
