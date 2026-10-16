#!/usr/bin/env python3
"""Проверка произношения: каждую запись распознаёт ElevenLabs Speech-to-Text и сравнивает со script.md
слово в слово. Печатает фрагменты, где услышано не то, что написано (ударение распознавание не видит,
но искажённые и пропущенные слова — видит).

Запуск: python3 check_stt.py ru f [ключ …]   → отчёт в stt-ru-f.txt
"""
import concurrent.futures as cf, difflib, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_elevenlabs import HERE, KEY, fragments


def words(t):
    t = t.lower().replace('ё', 'е').replace('́', '')
    return re.findall(r'[а-яa-z0-9]+', t)


def stt(path, lang):
    out = subprocess.run(['curl', '-s', '-X', 'POST', '-H', 'xi-api-key: ' + KEY, '-F', 'model_id=scribe_v1', '-F', 'language_code=' + {'ru': 'rus', 'en': 'eng'}[lang],
                          '-F', 'file=@' + path, 'https://api.elevenlabs.io/v1/speech-to-text'], capture_output=True, text=True).stdout
    d = json.loads(out); return d.get('text') if 'text' in d else None


def main():
    lang, g = sys.argv[1:3]; frags = fragments(lang); keys = sys.argv[3:] or [k for k in frags if not k.startswith('aff-')]
    def one(k):
        heard = stt(os.path.join(HERE, lang, g, k + '.mp3'), lang)
        if heard is None: return k, None
        a, b = words(' '.join(frags[k])), words(heard)
        diff = [(a[i1:i2], b[j1:j2]) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes() if op != 'equal']
        return k, diff
    bad, fails = [], []
    with cf.ThreadPoolExecutor(2) as ex:
        for k, diff in ex.map(one, keys):
            if diff is None: fails.append(k)
            elif diff: bad.append((k, diff))
    rep = [f'{lang}/{g}: проверено {len(keys)}, расхождений {len(bad)}, ошибок запроса {len(fails)}']
    for k, diff in bad:
        rep.append(k + ': ' + '; '.join(f"«{' '.join(x)}» → «{' '.join(y)}»" for x, y in diff))
    if fails: rep.append('не распознаны: ' + ', '.join(fails))
    open(os.path.join(HERE, f'stt-{lang}-{g}.txt'), 'w', encoding='utf-8').write('\n'.join(rep) + '\n'); print('\n'.join(rep))


if __name__ == '__main__':
    main()
