# Сайт «Аджна»

`index.html` — весь сайт: главная, 9 кабинетов (`#room-cleanse`, `#room-energy`, `#room-health`, `#room-abundance`, `#room-luck`, `#room-purpose`, `#room-silence`, `#room-ajna`, `#room-chakras`), плеер.

Каждая сессия: **Кокон (1:40) → Дыхание (2:00) → практика кабинета → Возвращение (1:00)**.

## Фото ведущей (арка на главной)

1. Сгенерировать или снять портрет 3:4, минимум 1200×1600.
2. Прислать файл — он публикуется рядом со страницей как `img/hero.jpg`, в коде `HERO_PHOTO = 'img/hero.jpg'`.

Промпт для генерации (Midjourney / ChatGPT / Krea):

> Editorial photo, a calm woman in her early 30s in a long deep-red silk dress, sitting in a dark velvet armchair, wearing large over-ear headphones, eyes closed, serene face, soft violet and gold rim light, dark cosmic background with faint glowing chakra symbols, cinematic, shallow depth of field, 85mm, luxury wellness brand aesthetic, vertical 3:4

Если используете фото реального человека — нужно его письменное согласие на использование.

## Живой женский голос

Тексты всех 41 фрагментов: `voice/script.md` (ключ = имя файла).

1. Сгенерировать каждый фрагмент → `voice/<ключ>.mp3`.
2. Положить `voice/manifest.json` со списком ключей, например `["cocoon","breath","return","cleanse-1",…,"inhale","exhale"]`.
3. В коде `VOICE_RECORDED = true`.

Где взять голос, который не звучит как синтез:

| Сервис | Плюс | Что проверить |
|---|---|---|
| ElevenLabs | Самая живая интонация, библиотека голосов с фильтром «русский, женский» | Ударения: прослушать каждый фрагмент |
| Yandex SpeechKit (marina, alena, julia, dasha, lera) | Лучшие ударения и произношение русского | Подобрать роль «good» / спокойная подача |
| Диктор (студия, фриланс) | 100% человек | Дороже, зато навсегда |

Совет: сделать один и тот же фрагмент `cocoon` во всех трёх вариантах и выбрать на слух.
