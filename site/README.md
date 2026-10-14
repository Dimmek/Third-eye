# Сайт «Дорога к себе» (рабочее название)

`index.html` — весь сайт: главная, 17 кабинетов (в т.ч. `#room-blinders`, `#room-breathe`, `#room-event`, `#room-release`, `#room-selflove`, `#room-relations`, `#room-food`, `#room-habits`, `#room-cleanse`, `#room-energy`, `#room-health`, `#room-abundance`, `#room-luck`, `#room-purpose`, `#room-silence`, `#room-ajna`, `#room-chakras`), плеер.

Каждая сессия: **Кокон (1:40) → Дыхание (2:00) → практика кабинета → Возвращение (1:00)**.

## Видео на заставке: женщина в красном

Слот: `HERO_VIDEO = 'media/hero.mp4'` в `index.html`. Видео встраивается с режимом наложения «screen»: чёрный фон исчезает, остаётся фигура, чакры летают за ней и перед ней.

Требования к ролику:
- **Абсолютно чёрный фон** (#000), без звёзд и пола: космос рисует сайт.
- Вертикаль 9:16 или 4:5, 1080×1920, 6–10 с, бесшовный цикл.
- MP4 (H.264), до 12 МБ.

Промпт для видео (Kling 2.x / Runway Gen-4 / Veo / Sora):

> A beautiful woman in her early 30s standing still on a pure black background, wearing a long flowing deep-red silk gown that ripples and billows gently in a slow wind, large over-ear headphones, eyes closed, serene face, arms relaxed, soft warm rim light from behind in gold and violet, the dress fabric catching light, cinematic, ultra-detailed, 4K, shallow depth of field, full body, centered, seamless loop, slow motion, no background elements, pure black void

Сначала сделать кадр (Midjourney / ChatGPT image) с тем же описанием, потом «оживить» его в видео (image-to-video) — так лицо и платье получаются стабильнее.

Если это реальный человек или похожесть на реального человека — нужно его согласие.

## Живой женский голос

Тексты всех фрагментов: `voice/script.md` (ключ = имя файла).

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
