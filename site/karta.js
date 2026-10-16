// Карта жизни: тексты, интерфейс, замки. Расчёт — karta-engine.js.
(function () {
const K = window.KARTA, $k = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const st = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

// ---------- тексты ----------
const SIGN = [
  { core: 'смелость, прямота и энергия старта: вы зажигаетесь быстро и первым идёте туда, где другим страшно', need: 'движение и право решать самому; эмоции вспыхивают и быстро гаснут', look: 'решительного человека действия, который не ждёт разрешения', gift: 'начинать', grow: 'доводить до конца и выдерживать паузу перед ответом' },
  { core: 'устойчивость, терпение и чувство ценности: вы строите медленно, но надолго', need: 'стабильность, телесный комфорт, красоту вокруг и ощутимый результат', look: 'спокойного, надёжного человека, рядом с которым безопасно', gift: 'создавать прочное', grow: 'меняться раньше, чем жизнь заставит' },
  { core: 'любопытство, быстрый ум и лёгкость в общении', need: 'новые впечатления, разговоры и информацию; скука для вас — главный стресс', look: 'живого, остроумного, лёгкого на подъём собеседника', gift: 'связывать людей и идеи', grow: 'глубина и фокус на одном деле' },
  { core: 'забота, память и сильная связь с близкими', need: 'дом, своих людей и чувство защищённости', look: 'мягкого, тёплого и бережного человека', gift: 'чувствовать и опекать', grow: 'не прятаться в панцирь от боли и просить о поддержке прямо' },
  { core: 'щедрость, творческая сила и желание светить', need: 'признание, тепло и место, где можно проявиться', look: 'яркого, уверенного человека с естественным достоинством', gift: 'вдохновлять', grow: 'не зависеть от аплодисментов и давать сцену другим' },
  { core: 'точность, польза и умение довести дело до совершенства', need: 'порядок, понятный план и ощущение, что вы полезны', look: 'собранного, внимательного профессионала', gift: 'улучшать и налаживать', grow: 'снизить требования к себе и разрешить «достаточно хорошо»' },
  { core: 'чувство гармонии, справедливости и вкус к красоте', need: 'мир в отношениях, красоту вокруг и партнёра рядом', look: 'обаятельного, дипломатичного человека', gift: 'соединять и договариваться', grow: 'решать, даже если кто-то будет недоволен' },
  { core: 'глубина, выдержка и умение видеть скрытое', need: 'доверие, глубину и контроль над своей жизнью', look: 'сильного, закрытого и притягательного человека', gift: 'проходить кризисы и выходить сильнее', grow: 'отпускать контроль и прощать' },
  { core: 'масштаб, вера в смысл и любовь к свободе', need: 'простор, дорогу, перспективу и смысл', look: 'открытого, оптимистичного, вдохновляющего человека', gift: 'видеть большое и вести за собой', grow: 'обещать меньше, а делать больше' },
  { core: 'ответственность, дисциплина и долгий горизонт', need: 'ясную цель, уважение и результат своими руками', look: 'серьёзного, надёжного, взрослого не по годам человека', gift: 'строить системы и подниматься на вершину', grow: 'разрешить себе отдых и мягкость' },
  { core: 'независимость, новые идеи и взгляд в будущее', need: 'свободу, единомышленников и право быть другим', look: 'необычного, дружелюбного, немного отстранённого человека', gift: 'придумывать новое и собирать людей вокруг идеи', grow: 'подпускать людей ближе и доверять чувствам' },
  { core: 'чуткость, воображение и сострадание', need: 'тишину, творчество и близость без грубости', look: 'мягкого, мечтательного, тонкого человека', gift: 'чувствовать несказанное', grow: 'ставить границы и опираться на факты' }
];
const HOUSE = ['я и тело', 'деньги и ресурсы', 'общение и учёба', 'дом и корни', 'творчество, любовь, дети', 'работа, режим, здоровье', 'партнёрство и брак', 'кризисы, чужие ресурсы, глубина', 'смысл, путешествия, обучение', 'карьера и статус', 'друзья и сообщества', 'тишина и внутренний мир'];
const PTHEME = { sun: 'суть и воля', moon: 'чувства и потребности', mercury: 'ум и речь', venus: 'любовь, вкус, деньги', mars: 'энергия и действие', jupiter: 'удача и рост', saturn: 'дисциплина и время', uranus: 'свобода и новизна', neptune: 'мечта и интуиция', pluto: 'сила и трансформация', node: 'направление роста' };
const ELT = { fire: ['Огонь', 'вы загораетесь идеями и заряжаете других'], earth: ['Земля', 'практичность и умение превращать идеи в результат'], air: ['Воздух', 'мысли, общение, связи; вы видите картину целиком'], water: ['Вода', 'чувства и интуиция; вы читаете людей изнутри'] };
const LACK = { fire: 'Мало Огня: старт и азарт даются с усилием. Помогают движение, спорт и одна ясная цель на день.', earth: 'Мало Земли: рутина и детали даются тяжелее. Решение — системы, автоматизация и надёжный человек «на земле» рядом.', air: 'Мало Воздуха: мысли и чувства не всегда проговариваются. Правило «говорить прямо» для вас ключевое.', water: 'Мало Воды: чувства прячутся за делами. Тишина и тёплое отношение к себе возвращают контакт с собой.' };
const CRT = { card: ['Кардинальные', 'умение начинать', 'Сильный старт. Навык роста — терпение и доведение до конца.'], fix: ['Фиксированные', 'стержень и упорство', 'Сильный стержень. Навык роста — гибкость и умение отпускать.'], mut: ['Мутабельные', 'гибкость и много идей', 'Много идей и гибкость. Навык роста — фокус и доведение до конца.'] };
const YEAR = ['Год себя: новый цикл, тело, внешний вид, личные решения. Хорошо начинать.', 'Год денег: доходы, ресурсы, самооценка. Время навести порядок в финансах и ценностях.', 'Год связей: учёба, переговоры, поездки, близкое окружение. Много разговоров и дел.', 'Год корней: дом, семья, родители, переезд или ремонт. Время укрепить опору.', 'Год радости: творчество, любовь, дети, удовольствие. Разрешите себе играть.', 'Год режима: работа, здоровье, привычки. Хорошо менять распорядок и заботиться о теле.', 'Год партнёрств: брак, партнёры, договоры. Отношения выходят на первый план.', 'Год глубины: чужие ресурсы, инвестиции, кризисы и перемены. Время отпустить отжившее.', 'Год смысла: обучение, путешествия, мировоззрение. Расширяйте горизонт.', 'Год карьеры: статус, достижения, ответственность. Вас видно — действуйте.', 'Год сообществ: друзья, команда, планы на будущее. Ищите своих людей.', 'Год тишины: завершение цикла, уединение, внутренняя работа. Закройте старое перед новым стартом.'];
const MC = ['Дело, где нужно первым брать риск: предпринимательство, спорт, запуск проектов. Вы сильнее всего там, где можно вести и решать быстро.', 'Дело с осязаемым результатом: финансы, недвижимость, красота, еда, ремёсла, дизайн. Вас ценят за надёжность и вкус.', 'Слова, связи, обучение: медиа, продажи, преподавание, маркетинг, переговоры. Несколько направлений сразу — ваша норма.', 'Забота и дом: помогающие профессии, сервис, недвижимость, семейный бизнес. Вы строите место, где людям хорошо.', 'Сцена и лидерство: творчество, личный бренд, управление, публичность. Ваше имя — ваш капитал.', 'Мастерство и польза: аналитика, забота о здоровье, сервис, системы и качество. Вас ценят за точность.', 'Отношения и красота: дизайн, право, переговоры, консалтинг, партнёрский бизнес. Лучший результат — в паре.', 'Высокие ставки и глубина: стратегии, кризис-менеджмент, финансы, исследования, психология. Вы там, где решают.', 'Масштаб и смысл: образование, международные проекты, путешествия, наставничество, издательство.', 'Структура и вершина: управление, крупные системы, строительство, долгие проекты. Подъём медленный, но прочный.', 'Будущее и сообщества: технологии, инновации, социальные проекты, сети. Вы делаете то, чего ещё нет.', 'Тонкое и вдохновляющее: искусство, музыка, кино, помощь людям, духовные практики. Работа должна иметь смысл.'];
const MONEY = ['Деньги приходят через инициативу и скорость. Риск — импульсивные траты. Правило: пауза 24 часа перед крупной покупкой.', 'Деньги любят ваше терпение. Лучшее — копить и вкладывать в материальное: недвижимость, качество, активы.', 'Несколько источников дохода — ваша норма. Деньги идут через общение, тексты, посредничество.', 'Деньги связаны с домом и семьёй. Спокойствие приходит вместе с запасом: сначала подушка безопасности.', 'Деньги через творчество и личный бренд. Риск — траты на статус. Вкладывайте в то, что работает на ваше имя.', 'Деньги через навык и порядок. Учёт, бюджет и профессионализм дают устойчивый рост.', 'Деньги через партнёров и красоту. Совместные проекты выгоднее одиночных.', 'Деньги через чужие ресурсы, инвестиции и глубокие проекты. Сильная финансовая интуиция — и риск «всё или ничего».', 'Деньги через масштаб: международные связи, обучение, большие идеи. Не обещайте больше, чем можете.', 'Деньги через долгую стратегию и статус. С годами доход растёт сильнее, чем в молодости.', 'Деньги через технологии, сети и нестандартные решения. Доход бывает неровным — нужна подушка.', 'Деньги через творчество и помощь людям. Важно: границы, договоры письменно, не давать в долг из жалости.'];
const LOVE = ['Любите ярко и прямо: нужны страсть и инициатива.', 'Любите через заботу и надёжность: важны верность и комфорт.', 'Любите через разговор: партнёр должен быть интересным собеседником.', 'Любите заботой и домом: нужна эмоциональная безопасность.', 'Любите щедро и красиво: нужны восхищение и праздник.', 'Любите делом и вниманием к мелочам: важны надёжность и помощь.', 'Любите гармонию: партнёрство — ваша естественная среда.', 'Любите глубоко и целиком: нужны доверие и верность до конца.', 'Любите свободно: партнёр — спутник в дороге и росте.', 'Любите серьёзно и надолго: чувства показываете поступками.', 'Любите через дружбу и свободу: нужен единомышленник.', 'Любите нежно и самоотверженно: важно не растворяться в другом.'];
const BODY = ['Нужна физическая нагрузка: без движения копится раздражение.', 'Ритм, сон и хорошая еда — ваша основа; важно не заедать стресс.', 'Нервная система перегружается информацией: нужны паузы без экрана и дыхание.', 'Самочувствие идёт за эмоциями: спокойный дом и вечерние практики — лучшая поддержка.', 'Энергия от радости и творчества; силы уходят, когда вас не замечают.', 'Порядок в режиме даёт силы; тревога о мелочах — главный расход энергии.', 'Баланс работы и отдыха, красота вокруг, мир в отношениях.', 'Подавленные чувства забирают силы; помогают отпускание и глубокий отдых.', 'Нужны простор, прогулки и движение; мера в еде и обещаниях.', 'Склонность работать без отдыха: нужны плановые паузы и регулярное движение.', 'Нерегулярный режим — главный враг; помогают дыхание и сон по расписанию.', 'Чувствительность к среде и веществам: тишина, вода и сон восстанавливают.'];
const TR_P = { jupiter: 'рост и новые возможности', saturn: 'проверку на прочность', uranus: 'внезапные перемены', neptune: 'вдохновение и размытость', pluto: 'глубокую перестройку' };
const TR_N = { sun: 'цели и самоощущения', moon: 'эмоций, дома и семьи', mercury: 'мыслей, договоров и общения', venus: 'отношений, денег и удовольствия', mars: 'энергии и действий', asc: 'вашего образа и тела', mc: 'карьеры и статуса' };
const TR_A = { jupiter: ['Хорошее время просить, начинать, расширяться.', 'Не обещайте больше, чем реально сделать; следите за мерой.'], saturn: ['Укрепляйте то, что строите: результат будет прочным.', 'Возможны задержки и ограничения: план, дисциплина, без спешки.'], uranus: ['Пробуйте новое — смелым повезёт.', 'Неожиданности: держите запас по времени и деньгам.'], neptune: ['Интуиция и творчество сильнее обычного.', 'Проверяйте факты и обещания, не идеализируйте.'], pluto: ['Можно глубоко перестроить жизнь в этой сфере.', 'Давление ведёт к обновлению: отпускайте отжившее.'] };
const LINES = { jupiter: ['Юпитер', 'рост, удача, покровительство'], venus: ['Венера', 'любовь, красота, деньги через людей'], sun: ['Солнце', 'признание и уверенность'] };
const PNAME = Object.fromEntries(K.PLANETS.map(p => [p[0], p[1]])); PNAME.asc = 'Асцендент'; PNAME.mc = 'MC';
const PGL = Object.fromEntries(K.PLANETS.map(p => [p[0], p[2]])); PGL.asc = 'AC'; PGL.mc = 'MC';
const SECTION_PRICE = 990;
const PRICE = { career: ['Раздел «Призвание»', SECTION_PRICE, ''], money: ['Раздел «Деньги»', SECTION_PRICE, ''], health: ['Раздел «Самочувствие»', SECTION_PRICE, ''], family: ['Раздел «Семья»', SECTION_PRICE, ''], places: ['Раздел «Где жить»', SECTION_PRICE, ''], route: ['Раздел «Маршрут на 12 лет»', SECTION_PRICE, ''],
  year: ['Прогноз на год', 1990, 'По месяцам: какие периоды открывают возможности, а где нужна осторожность.'], full: ['Полная карта жизни', 3990, 'Призвание, деньги, отношения, самочувствие, где жить, маршрут на 12 лет, план практик.'], all: ['Всё вместе', 4990, 'Полная карта и прогноз на год. Выгода 990 ₽. Прогноз на год также входит в годовую подписку.'] };
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MON1 = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const fdate = d => d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
const sname = l => K.SIGNS[K.signOf(l)];

// ---------- рекомендации практик ----------
function recommend(ch, tr, prof) {
  const sc = {}, why = {}; const add = (id, w, r) => { sc[id] = (sc[id] || 0) + w; if (r && !why[id]) why[id] = r; };
  const hard = (a, b) => ch.aspects.some(x => ((x.a === a && x.b === b) || (x.a === b && x.b === a)) && x.tone !== 'soft');
  if (['saturn', 'pluto', 'uranus', 'mars'].some(p => hard('moon', p))) { add('silence', 3, 'Напряжённая Луна: эмоциям нужна тишина и опора.'); add('breathe', 2, 'Напряжённая Луна: дыхание быстро возвращает спокойствие.'); add('selflove', 1); }
  if (['sun', 'moon', 'mercury'].some(p => hard('saturn', p))) add('blinders', 3, 'Сатурн давит на личные планеты: внутренние «нельзя» и чужие правила стоит пересмотреть.');
  if (ch.known && [1, 10].includes(ch.pos.saturn.house)) add('blinders', 2, 'Сильный Сатурн: высокие требования к себе.');
  if (['saturn', 'pluto', 'mars'].some(p => hard('venus', p)) || (ch.known && [6, 8, 12].includes(ch.pos.venus.house))) { add('selflove', 3, 'Венера под нагрузкой: тёплое отношение к себе — основа отношений.'); add('relations', 2, 'Венера под нагрузкой: отношения просят мягкости.'); }
  if (['sun', 'moon', 'asc'].some(p => hard('neptune', p)) || (ch.known && [1, 4, 7, 10].includes(ch.pos.neptune.house))) { add('cleanse', 3, 'Сильный Нептун: высокая чувствительность к чужому, нужно регулярное очищение.'); add('habits', 1); }
  if (ch.known && K.PLANETS.filter(p => ch.pos[p[0]].house === 12).length >= 2) add('release', 2, 'Акцент на XII доме: много внутреннего, что стоит отпустить.');
  if (['saturn', 'pluto', 'uranus'].some(p => hard('mars', p))) { add('release', 2, 'Напряжённый Марс: накопленное напряжение ищет выход.'); add('event', 1); }
  if ([1, 3, 6].includes(K.signOf(ch.pos.mars.lon)) || ch.el.fire <= 1) add('energy', 3, 'Энергии нужен разгон: Марс в мягком знаке или мало Огня.');
  if (ch.el.water >= 5) { add('cleanse', 2, 'Много Воды: вы впитываете чужие состояния.'); add('silence', 1); }
  if (ch.el.earth <= 1) { add('health', 2, 'Мало Земли: телу нужен режим и внимание.'); add('food', 1); }
  if (ch.el.air <= 1) add('relations', 1, 'Мало Воздуха: чувства важно проговаривать.');
  if (ch.cr.mut >= 6) add('purpose', 3, 'Много мутабельных знаков: идей много, нужен фокус на своём.');
  if (ch.el.fire >= 5) add('breathe', 1, 'Много Огня: дыхание помогает не перегореть.');
  const now = new Date();
  tr.filter(o => o.from <= now && o.to >= now).forEach(o => {
    if (o.p === 'saturn') add('blinders', 2, 'Сейчас транзит Сатурна: время пересмотреть ограничения.');
    if (o.p === 'pluto') add('release', 2, 'Сейчас транзит Плутона: отпускание облегчит перемены.');
    if (o.p === 'neptune') add('cleanse', 2, 'Сейчас транзит Нептуна: важно очищать восприятие.');
    if (o.p === 'uranus') add('breathe', 1, 'Сейчас транзит Урана: перемены, нужна опора на дыхание.');
    if (o.p === 'jupiter') add('abundance', 2, 'Сейчас транзит Юпитера: время расширяться.');
  });
  const PY = ['energy', 'abundance', 'blinders', 'silence', 'selflove', 'health', 'relations', 'release', 'purpose', 'event', 'luck', 'cleanse'];
  add(PY[prof.house - 1], 2, 'Тема вашего года — ' + HOUSE[prof.house - 1] + '.');
  add('cleanse', 0.5, 'Очищение — основа: после него любая практика идёт глубже.');
  return Object.keys(sc).sort((a, b) => sc[b] - sc[a]).map(id => ({ id, why: why[id] || '' }));
}

// ---------- круг карты ----------
function drawWheel(cv, ch) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), S = cv.clientWidth; if (!S) return;
  cv.width = S * dpr; cv.height = S * dpr; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const c = S / 2, R = S / 2 - 4, rz = R * 0.84, rh = R * 0.62, ra = R * 0.44, base = ch.ang ? ch.ang.asc : 0;
  const pt = (lon, r) => { const a = (180 + (lon - base)) * Math.PI / 180; return [c + r * Math.cos(a), c - r * Math.sin(a)]; };
  g.clearRect(0, 0, S, S);
  const EC = ['rgba(232,126,92,', 'rgba(170,190,130,', 'rgba(140,200,230,', 'rgba(130,150,225,'];
  for (let s = 0; s < 12; s++) {
    g.beginPath(); const a0 = (180 + (s * 30 - base)) * Math.PI / 180, a1 = (180 + ((s + 1) * 30 - base)) * Math.PI / 180;
    g.arc(c, c, R, -a0, -a1, true); g.arc(c, c, rz, -a1, -a0, false); g.closePath(); g.fillStyle = EC[s % 4] + '0.10)'; g.fill();
    const [x, y] = pt(s * 30 + 15, (R + rz) / 2); g.fillStyle = EC[s % 4] + '0.95)'; g.font = Math.round(R * 0.075) + 'px "Segoe UI Symbol","Noto Sans Symbols 2","Apple Symbols",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(K.GLYPH[s], x, y);
  }
  g.strokeStyle = 'rgba(220,189,134,.55)'; g.lineWidth = 1;
  [R, rz, rh * 0.98].forEach(r => { g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke(); });
  for (let d = 0; d < 360; d += 5) { const [x1, y1] = pt(d, rz), [x2, y2] = pt(d, rz - (d % 30 === 0 ? R * 0.06 : d % 10 === 0 ? R * 0.035 : R * 0.02)); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = d % 30 === 0 ? 'rgba(220,189,134,.7)' : 'rgba(220,189,134,.3)'; g.stroke(); }
  if (ch.cusps) ch.cusps.forEach((l, i) => {
    const ax = i % 3 === 0; const [x1, y1] = pt(l, ax ? R : rz), [x2, y2] = pt(l, ra);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = ax ? 'rgba(240,214,160,.95)' : 'rgba(220,189,134,.28)'; g.lineWidth = ax ? 1.6 : 1; g.stroke();
    const mid = K.norm(l + K.norm(ch.cusps[(i + 1) % 12] - l) / 2), [tx, ty] = pt(mid, ra + R * 0.05);
    g.fillStyle = 'rgba(220,189,134,.55)'; g.font = '500 ' + Math.round(R * 0.04) + 'px "Inter Tight",sans-serif'; g.fillText(K.ROMAN[i], tx, ty);
  });
  g.lineWidth = 1; g.beginPath(); g.arc(c, c, ra, 0, 7); g.strokeStyle = 'rgba(220,189,134,.35)'; g.stroke();
  const keys = K.PLANETS.map(p => p[0]); const pos = keys.map(k => ({ k, lon: ch.pos[k].lon, d: ch.pos[k].lon }));
  pos.sort((a, b) => a.lon - b.lon);
  for (let it = 0; it < 30; it++) for (let i = 0; i < pos.length; i++) { const a = pos[i], b = pos[(i + 1) % pos.length], gap = K.norm(b.d - a.d); if (gap < 7) { a.d -= (7 - gap) / 2; b.d += (7 - gap) / 2; } }
  ch.aspects.filter(x => x.a !== 'asc' && x.b !== 'asc' && x.a !== 'mc' && x.b !== 'mc' && x.ang).forEach(x => {
    const [x1, y1] = pt(ch.pos[x.a].lon, ra - 4), [x2, y2] = pt(ch.pos[x.b].lon, ra - 4);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = x.tone === 'hard' ? 'rgba(232,110,100,' + (0.75 - x.orb * 0.07) + ')' : 'rgba(130,180,240,' + (0.7 - x.orb * 0.06) + ')'; g.lineWidth = 1; g.stroke();
  });
  pos.forEach(p => {
    const [x0, y0] = pt(p.lon, rh * 0.98), [x1, y1] = pt(p.lon, rh * 0.93); g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = 'rgba(246,241,232,.8)'; g.stroke();
    const [x, y] = pt(p.d, rh * 0.82); g.fillStyle = '#f6f1e8'; g.font = Math.round(R * 0.07) + 'px "Segoe UI Symbol","Noto Sans Symbols 2","Apple Symbols",serif'; g.fillText(PGL[p.k] + '︎', x, y);
    if (ch.pos[p.k].retro) { g.font = Math.round(R * 0.035) + 'px "Inter Tight",sans-serif'; g.fillStyle = 'rgba(232,110,100,.9)'; g.fillText('R', x + R * 0.045, y + R * 0.035); }
  });
  if (ch.ang) [['AC', ch.ang.asc], ['MC', ch.ang.mc]].forEach(([t, l]) => { const [x, y] = pt(l, R + 0.1); g.font = '600 ' + Math.round(R * 0.045) + 'px "Inter Tight",sans-serif'; g.fillStyle = '#f0d6a0'; const [tx, ty] = pt(l, rz - R * 0.1); g.fillText(t, tx, ty); });
}

// ---------- разметка ----------
// ---------- полная карта: вид ----------
const has = k => { const u = st.get('karta_unlock') || '', e = (() => { try { return JSON.parse(st.get('ent')) || {}; } catch (x) { return {}; } })(); return (window.OWNER && window.OWNER()) || (k === 'year' && e.plan === 'year' && e.subUntil > Date.now()) || u.includes('all') || u.includes(k) || (SECTIONS.includes(k) && u.includes('full')); };
const SECTIONS = ['career', 'money', 'health', 'family', 'places', 'route'];
const RU_P = { sun: 'Солнце', moon: 'Луна', mercury: 'Меркурий', venus: 'Венера', mars: 'Марс', jupiter: 'Юпитер', saturn: 'Сатурн', uranus: 'Уран', neptune: 'Нептун', pluto: 'Плутон', node: 'Северный узел', asc: 'Асцендент', mc: 'MC', ic: 'IC', dsc: 'Десцендент', ketu: 'Кету', rahu: 'Раху', fortune: 'Колесо Фортуны' };
const RU_PG = { sun: 'Солнца', moon: 'Луны', mercury: 'Меркурия', venus: 'Венеры', mars: 'Марса', jupiter: 'Юпитера', saturn: 'Сатурна', uranus: 'Урана', neptune: 'Нептуна', pluto: 'Плутона', ketu: 'Кету', rahu: 'Раху' };
const GL = { sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇', node: '☊', fortune: '⊗', asc: 'AC', mc: 'MC' };
const glyph = k => '<span class="kg">' + (GL[k] || '') + (GL[k] && GL[k].length === 1 ? '︎' : '') + '</span>';
const SIGNG = ['Овна', 'Тельца', 'Близнецов', 'Рака', 'Льва', 'Девы', 'Весов', 'Скорпиона', 'Стрельца', 'Козерога', 'Водолея', 'Рыб'];
const ELNAME = { fire: 'Огонь', earth: 'Земля', air: 'Воздух', water: 'Вода' }, ELCLR = { fire: 'var(--k-fire)', earth: 'var(--k-earth)', air: 'var(--k-air)', water: 'var(--k-water)' };
const LP = { 1: 'лидер и основатель: самостоятельность и первый шаг', 2: 'дипломат: партнёрство и чуткость', 3: 'творец: слово, радость, самовыражение', 4: 'строитель: система, порядок, надёжность', 5: 'искатель: свобода, перемены, опыт', 6: 'хранитель: семья, забота, ответственность', 7: 'исследователь: глубина, знание, уединение', 8: 'управленец: ресурсы, масштаб, власть', 9: 'гуманист: служение, завершение, мудрость', 11: 'вдохновитель: интуиция и миссия', 22: 'мастер-строитель: большие проекты' };
const ZODIAC_CN = ['Крыса', 'Бык', 'Тигр', 'Кролик', 'Дракон', 'Змея', 'Лошадь', 'Коза', 'Обезьяна', 'Петух', 'Собака', 'Свинья'], EL_CN = ['Металл', 'Металл', 'Вода', 'Вода', 'Дерево', 'Дерево', 'Огонь', 'Огонь', 'Земля', 'Земля'];
const YTITLE = ['Новый цикл', 'Ресурсы', 'Связи и знания', 'Корни и дом', 'Радость и творчество', 'Порядок и тело', 'Партнёрство', 'Глубокие перемены', 'Горизонты', 'Вершина', 'Команда и мечты', 'Тишина и итоги'];
const YREC = ['начать новое, обновить образ, позаботиться о теле', 'навести порядок в деньгах и ценностях, создать запас', 'учиться, вести переговоры, писать, ездить', 'укрепить дом и семью, решить вопросы жилья', 'творить, любить, отдыхать, проводить время с детьми', 'настроить режим, работу и здоровье', 'выстраивать союзы и договоры, слушать партнёра', 'пересобрать ресурсы, отпустить отжившее, работать с долгами и вложениями', 'учиться, путешествовать, расширять мировоззрение', 'брать ответственность, добиваться видимого результата', 'собирать команду и сообщество, строить планы', 'завершать начатое, отдыхать, готовить следующий цикл'];
const mo = d => MON[d.getMonth()].replace(/я$/, 'ь').replace(/та$/, 'т').replace(/ая$/, 'ай').replace(/ня$/, 'нь').replace(/ля$/, 'ль');
const MONN = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const span = o => { const a = o.from, b = o.to; return a.getFullYear() === b.getFullYear() ? (a.getMonth() === b.getMonth() ? MONN[a.getMonth()] + ' ' + a.getFullYear() : MONN[a.getMonth()] + '–' + MONN[b.getMonth()] + ' ' + a.getFullYear()) : MONN[a.getMonth()] + ' ' + a.getFullYear() + ' — ' + MONN[b.getMonth()] + ' ' + b.getFullYear(); };
const bar = (lbl, v, max, cls) => '<div class="kb"><span>' + lbl + '</span><i class="' + (cls || '') + '"><b style="width:' + Math.max(4, Math.min(100, v / max * 100)) + '%"></b></i><em>' + v + '/' + max + '</em></div>';
const KT = n => window[n] || null;

function tokensOf(ch, ctx) {
  const T = new Set(['always']), sg = k => K.SIGNS[K.signOf(ch.pos[k].lon)];
  T.add('sun:' + sg('sun')); T.add('moon:' + sg('moon')); if (ch.ang) T.add('asc:' + K.SIGNS[K.signOf(ch.ang.asc)]);
  const elK = Object.keys(ch.el).sort((a, b) => ch.el[b] - ch.el[a]); T.add('el:' + elK[0]); Object.keys(ch.el).forEach(e => { if (ch.el[e] <= 1) T.add('el-lack:' + e); });
  if (ch.known) { const cnt = h => K.PLANETS.slice(0, 10).filter(p => ch.pos[p[0]].house === h).length; if (cnt(10) >= 2) T.add('house10'); if (cnt(12) >= 2) T.add('house12'); if (cnt(1) >= 1) T.add('house1');
    const near = (k, l, o) => Math.abs(((ch.pos[k].lon - l + 540) % 360) - 180) < o;
    if (near('jupiter', ch.ang.asc, 10) || ch.pos.jupiter.house === 1) T.add('jupiter-asc'); if (near('saturn', ch.ang.mc, 10) || ch.pos.saturn.house === 10) T.add('saturn-mc'); if (near('pluto', ch.ang.mc, 10) || ch.pos.pluto.house === 10) T.add('pluto-mc');
    if ([1, 4, 7, 10].includes(ch.pos.neptune.house)) T.add('neptune-angular'); if ([1, 4, 7, 10].includes(ch.pos.uranus.house)) T.add('uranus-angular'); }
  const dg = ctx.dg; if (dg.venus.ess >= 4) T.add('venus-dignified'); if (dg.mars.total >= 8 || dg.mars.ess >= 4) T.add('mars-strong'); if (dg.mercury.total >= 8 || dg.mercury.ess >= 4) T.add('mercury-strong');
  if ([3, 7, 11].includes(K.signOf(ch.pos.moon.lon))) T.add('moon-water');
  ch.aspects.forEach(a => { T.add('aspect-' + (a.tone === 'soft' ? 'soft' : 'hard') + ':' + a.a + '-' + a.b); T.add('aspect-' + (a.tone === 'soft' ? 'soft' : 'hard') + ':' + a.b + '-' + a.a); });
  return T;
}
const matches = (when, T) => String(when || '').split('|').map(s => s.trim()).filter(Boolean).filter(t => T.has(t)).length;

function aspectText(a) { const L = KT('KT_ASPECTS'); if (!L) return ''; const key = [a.a, a.b].join('-'), k2 = [a.b, a.a].join('-'), o = L[key] || L[k2]; if (!o) return ''; return o[a.ang === 0 ? 'conj' : a.tone === 'soft' ? 'soft' : 'hard'] || ''; }

// 12 направлений призвания
const DIRS = [
  { n: 'Своё дело · основатель', d: 'Создавать и вести собственное дело, быть владельцем и стратегом.', img: 'chess', money: 5, signs: [0, 4, 7, 9], houses: [1, 10], flags: ['jupiter-asc', 'pluto-mc', 'mars-strong', 'house10'], step: 'Запустить небольшой проект параллельно с основной работой и проверить спрос на 10 клиентах.' },
  { n: 'Инвестиции и капитал', d: 'Управление активами, сделки, работа с чужими ресурсами и рисками.', img: 'yacht', money: 5, signs: [1, 7, 9], houses: [2, 8], flags: ['pluto-mc', 'saturn-mc'], step: 'Пройти базовый курс финансового анализа и начать с малых сумм по жёстким правилам.' },
  { n: 'Технологии, данные, ИИ', d: 'Цифровые продукты, автоматизация, алгоритмы, новые сервисы.', img: 'circuit', money: 4, signs: [2, 5, 10], houses: [11, 3], flags: ['uranus-angular', 'mercury-strong'], step: 'Освоить один ИИ-инструмент и собрать прототип, который решает реальную задачу знакомых.' },
  { n: 'Руководство и антикризис', d: 'Управлять командами и системами, выводить из кризиса, перестраивать.', img: 'chessboard', money: 5, signs: [7, 9, 0], houses: [10, 6], flags: ['saturn-mc', 'pluto-mc', 'mars-strong'], step: 'Взять управленческую роль в растущей команде или пройти программу для руководителей.' },
  { n: 'Международные дела', d: 'Переговоры, сделки и проекты между странами и культурами.', img: 'handshake', money: 4, signs: [8, 6, 2], houses: [9, 7], flags: ['venus-dignified'], step: 'Подтянуть язык и выйти на отраслевую выставку или сообщество за рубежом.' },
  { n: 'Наставник, спикер, автор', d: 'Делиться опытом, учить, выступать, писать и вести людей.', img: 'speaker', money: 3, signs: [4, 8, 2], houses: [9, 3, 5], flags: ['jupiter-asc'], step: 'Вести канал или блог о своём опыте и взять первых подопечных.' },
  { n: 'Недвижимость и пространство', d: 'Дом, объекты, девелопмент, интерьер и среда, где хорошо жить.', img: 'villa', money: 4, signs: [3, 1, 9], houses: [4, 2], flags: [], step: 'Изучить рынок одного города и войти в первую сделку вместе с опытным партнёром.' },
  { n: 'Психология и помогающие практики', d: 'Работа с людьми и их мотивами, коучинг, поддержка, глубокие разговоры.', img: 'library', money: 3, signs: [11, 7, 3], houses: [8, 12, 6], flags: ['moon-water', 'neptune-angular'], step: 'Пройти обучение одной методике и вести первых клиентов под супервизией.' },
  { n: 'Творчество и дизайн', d: 'Красота, стиль, визуальный язык, искусство и эстетика.', img: 'room', money: 3, signs: [6, 1, 4, 11], houses: [5], flags: ['venus-dignified', 'neptune-angular'], step: 'Собрать портфолио из 5 работ и показать его 20 людям из нужной ниши.' },
  { n: 'Медиа, маркетинг, продажи', d: 'Слова, бренды, коммуникации, умение донести и продать идею.', img: 'london', money: 4, signs: [2, 4, 6], houses: [3, 11, 7], flags: ['mercury-strong'], step: 'Запустить одну рекламную или контентную кампанию и измерить результат в цифрах.' },
  { n: 'Тело, спорт и здоровый образ жизни', d: 'Движение, тренировки, восстановление, забота о теле — своём и чужом.', img: 'hiker', money: 3, signs: [0, 5, 7], houses: [6, 1], flags: ['mars-strong'], step: 'Получить базовую сертификацию тренера или инструктора и вести небольшую группу.' },
  { n: 'Финансы, аналитика, право', d: 'Точность, цифры, правила, структуры и аудит.', img: 'skyline', money: 4, signs: [5, 9, 6, 1], houses: [2, 10, 6], flags: ['mercury-strong', 'saturn-mc'], step: 'Освоить один инструмент аналитики или пройти курс по договорному праву.' }
];
function scoreDirs(ch, T) {
  const pts = [['sun', 3], ['moon', 2], ['mercury', 1], ['venus', 1], ['mars', 1], ['jupiter', 1], ['saturn', 1]];
  return DIRS.map(D => { let s = 0; const tags = [];
    pts.forEach(([p, w]) => { const sg = K.signOf(ch.pos[p].lon); if (D.signs.includes(sg)) { s += w; if (w >= 2) tags.push(RU_P[p] + ' в знаке ' + K.SIGNS[sg]); } if (ch.known && D.houses.includes(ch.pos[p].house)) { s += w; tags.push(RU_P[p] + ' в ' + K.ROMAN[ch.pos[p].house - 1] + ' доме'); } });
    if (ch.ang) { const m = K.signOf(ch.ang.mc), a = K.signOf(ch.ang.asc); if (D.signs.includes(m)) { s += 3; tags.push('MC в знаке ' + K.SIGNS[m]); } if (D.signs.includes(a)) { s += 2; tags.push('Асцендент в знаке ' + K.SIGNS[a]); } }
    D.flags.forEach(f => { if (T.has(f)) { s += 3; tags.push({ 'jupiter-asc': 'Юпитер у Асцендента', 'pluto-mc': 'Плутон у вершины карты', 'saturn-mc': 'Сатурн у вершины карты', 'mars-strong': 'сильный Марс', 'mercury-strong': 'сильный Меркурий', 'venus-dignified': 'сильная Венера', 'uranus-angular': 'Уран на угле карты', 'neptune-angular': 'Нептун на угле карты', 'moon-water': 'Луна в стихии Воды', house10: 'акцент на доме карьеры' }[f]); } });
    return Object.assign({}, D, { s, tags: [...new Set(tags)].slice(0, 3) }); }).sort((a, b) => b.s - a.s);
}

function scoreCities(ch) {
  const W = { career: { MC: { sun: 3, jupiter: 3, venus: 2, mars: 1, uranus: 1, pluto: 1, saturn: -1, neptune: -2 }, ASC: { sun: 2, jupiter: 3, venus: 2, mars: 1, saturn: -2, neptune: -1, pluto: -1 } },
    money: { MC: { jupiter: 3, venus: 3, sun: 1, pluto: 1, saturn: -2, neptune: -2 }, ASC: { jupiter: 3, venus: 2, saturn: -2, neptune: -2 }, IC: { jupiter: 1, venus: 1 } },
    family: { IC: { moon: 3, venus: 3, jupiter: 2, saturn: -2, mars: -2, pluto: -2, uranus: -2 }, DSC: { venus: 3, jupiter: 2, moon: 1, saturn: -2, mars: -2, uranus: -2, pluto: -1 }, ASC: { moon: 1, venus: 1, saturn: -1 } } };
  return (window.KARTA_WCITIES || window.KARTA_CITIES || []).map(c => { const hits = K.angularHits(ch, c[2], c[3], 5.5), sc = {};
    ['career', 'money', 'family'].forEach(d => { let v = 0; hits.forEach(h => { const w = (W[d][h.angle] || {})[h.p] || 0; v += w * (1 - h.d / 8); }); sc[d] = Math.max(1, Math.min(5, Math.round(3 + v))); });
    const hard = hits.filter(h => ['saturn', 'pluto', 'mars', 'neptune'].includes(h.p) && (h.angle === 'MC' || h.angle === 'ASC')).length;
    return { c, hits, sc, total: sc.career + sc.money + sc.family, hard }; });
}
const CITY_IMG = { 'Лондон': 'london', 'Валенсия': 'valencia', 'Дубай': 'dubai', 'Цюрих': 'harbor' }, GEN_IMG = ['skyline', 'city', 'harbor', 'villa', 'valley'];
const hitText = h => RU_P[h.p] + ' на ' + ({ MC: 'MC', IC: 'IC', ASC: 'Асценденте', DSC: 'Десценденте' })[h.angle] + (h.d < 1.5 ? ' (точно)' : '');

function yearScores(ch, trR, ds, now) {
  const out = [];
  for (let i = 0; i < 13; i++) {
    const y = now.getFullYear() + i, mid = new Date(y, 6, 1), pr = K.profection(ch, new Date(y, (new Date(ch.inp.date)).getMonth(), (new Date(ch.inp.date)).getDate() + 1));
    const tr = trR.filter(o => o.from.getFullYear() <= y && o.to.getFullYear() >= y);
    const dom = { career: ['mc', 'sun', 'saturn'], money: ['venus', 'jupiter'], family: ['moon', 'venus', 'ic', 'dsc'], health: ['sun', 'asc', 'moon', 'mars'] };
    const sc = {}, agree = {};
    Object.keys(dom).forEach(d => { let v = 0, sys = 0;
      tr.filter(o => dom[d].includes(o.n)).forEach(o => { const good = o.tone === 'soft' || (o.ang === 0 && o.p === 'jupiter'); const w = o.p === 'jupiter' ? 1 : o.p === 'saturn' ? 1 : 0.7; v += good ? w : -w * (d === 'career' && o.p === 'saturn' && o.ang === 0 ? 0.3 : 1); });
      if (v > 0) sys++;
      const ph = { career: [10, 1], money: [2, 8, 11], family: [4, 5, 7], health: [1, 6] }[d]; if (ph.includes(pr.house)) { v += 1; sys++; }
      const at = ds && ds.at(mid); if (at) { const ben = ['jupiter', 'venus', 'mercury', 'moon'].includes(at.ad.lord); if (ben) { v += 0.5; sys++; } else if (['saturn', 'rahu', 'ketu', 'mars'].includes(at.ad.lord)) v -= 0.4; }
      sc[d] = Math.max(1, Math.min(5, Math.round(3 + v * 0.6))); agree[d] = sys; });
    const top = tr.slice().sort((a, b) => (a.p === 'jupiter' || a.p === 'saturn' ? 0 : 1) - (b.p === 'jupiter' || b.p === 'saturn' ? 0 : 1)).slice(0, 3);
    out.push({ y, age: y - +ch.inp.date.slice(0, 4), pr, sc, agree, top, sum: sc.career + sc.money + sc.family + sc.health });
  }
  return out;
}
const trName = o => RU_P[o.p] + ' ' + (o.ang === 0 ? 'соединяется с' : o.name + ' к') + ' ' + ({ asc: 'Асценденту', mc: 'MC', ic: 'IC', dsc: 'Десценденту' }[o.n] || RU_P[o.n].replace(/а$/, 'е').replace(/е$/, 'е')) ;
const DAT = { sun: 'Солнцу', moon: 'Луне', mercury: 'Меркурию', venus: 'Венере', mars: 'Марсу', jupiter: 'Юпитеру', saturn: 'Сатурну', asc: 'Асценденту', mc: 'MC', ic: 'IC', dsc: 'Десценденту' };
const INS = { sun: 'Солнцем', moon: 'Луной', mercury: 'Меркурием', venus: 'Венерой', mars: 'Марсом', jupiter: 'Юпитером', saturn: 'Сатурном', asc: 'Асцендентом', mc: 'MC', ic: 'IC', dsc: 'Десцендентом' };
const ASPP = { 'секстиль': 'в секстиле к', 'квадрат': 'в квадрате к', 'трин': 'в трине к', 'оппозиция': 'в оппозиции к' };
const trNice = o => o.ang === 0 ? RU_P[o.p] + (o.p === o.n ? ' возвращается на своё место' : ' соединяется с ' + (INS[o.n] || RU_P[o.n])) : RU_P[o.p] + ' ' + (ASPP[o.name] || o.name) + ' ' + (DAT[o.n] || RU_P[o.n]);
const uniqT = arr => { const seen = new Set(); return arr.filter(o => { const k = o.p + o.n + o.ang + o.from.getFullYear(); if (seen.has(k)) return false; seen.add(k); return true; }); };

// компас
const compass = () => '<svg class="kcomp" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="kcg" cx="50%" cy="45%"><stop offset="0" stop-color="rgba(255,255,255,.12)"/><stop offset="1" stop-color="rgba(0,0,0,.35)"/></radialGradient></defs>'
  + '<circle cx="100" cy="100" r="92" fill="url(#kcg)" stroke="var(--k-acc)" stroke-width="2.5"/><circle cx="100" cy="100" r="72" fill="none" stroke="var(--k-acc)" stroke-opacity=".35"/>'
  + Array.from({ length: 72 }, (_, i) => { const a = i * 5 * Math.PI / 180, r1 = i % 18 === 0 ? 80 : i % 2 ? 88 : 85; return '<line x1="' + (100 + 92 * Math.sin(a)).toFixed(1) + '" y1="' + (100 - 92 * Math.cos(a)).toFixed(1) + '" x2="' + (100 + r1 * Math.sin(a)).toFixed(1) + '" y2="' + (100 - r1 * Math.cos(a)).toFixed(1) + '" stroke="var(--k-acc)" stroke-opacity="' + (i % 18 === 0 ? 1 : .45) + '" stroke-width="' + (i % 18 === 0 ? 2.4 : 1) + '"/>'; }).join('')
  + [['С', 100, 34], ['В', 166, 104], ['Ю', 100, 172], ['З', 34, 104]].map(([t, x, y]) => '<text x="' + x + '" y="' + y + '" text-anchor="middle" fill="var(--k-text)" font-size="15" font-weight="600" font-family="Inter Tight,sans-serif">' + t + '</text>').join('')
  + '<g class="kneedle"><path d="M100 100 L110 96 L100 30 L90 96 Z" fill="var(--k-acc)"/><path d="M100 100 L110 104 L100 170 L90 104 Z" fill="var(--k-cool)" opacity=".75"/></g><circle cx="100" cy="100" r="6" fill="var(--k-text)" stroke="var(--k-acc)" stroke-width="2"/></svg>';

// тело (силуэт) и зоны по знакам
// sign → body zone (Aries head … Pisces feet) on the symmetric figure below
const BODYPTS = [[100, 34], [100, 64], [53, 150], [100, 136], [88, 108], [100, 162], [116, 186], [100, 212], [86, 256], [86, 300], [86, 338], [86, 372]];
const bodySvg = zones => '<svg class="kbody" viewBox="0 0 200 390" aria-hidden="true"><g fill="var(--k-panel2)" stroke="var(--k-line2)" stroke-width="1.6" stroke-linejoin="round"><circle cx="100" cy="34" r="22"/><path d="M91 56 L90 70 Q62 72 58 88 L38 192 Q38 206 46 204 L50 194 L68 112 L74 168 Q70 186 72 202 L76 366 Q74 380 84 380 L94 380 Q96 372 94 364 L98 236 Q100 230 102 236 L106 364 Q104 372 106 380 L116 380 Q126 380 124 366 L128 202 Q130 186 126 168 L132 112 L150 194 L154 204 Q162 206 162 192 L142 88 Q138 72 110 70 L109 56Z"/></g>'
  + zones.map((z, i) => { const [x, y] = BODYPTS[z.sign]; return '<g><circle cx="' + x + '" cy="' + y + '" r="12" fill="var(--k-acc)" fill-opacity=".9"/><text x="' + x + '" y="' + (y + 4.5) + '" text-anchor="middle" font-size="12" font-weight="700" fill="var(--k-bg)" font-family="Inter Tight,sans-serif">' + (i + 1) + '</text></g>'; }).join('') + '</svg>';

function worldDraw(cv, ch, cities) {
  const W = window.KARTA_WORLD; if (!W || !cv.clientWidth) return; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = w * 0.46;
  cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px'; const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const bin = atob(W.b), px = lo => (lo + 180) / 360 * w, py = la => (W.lat0 - la) / (W.h * W.step) * h, cs = getComputedStyle(cv);
  const dot = cs.getPropertyValue('--k-dot').trim() || 'rgba(255,255,255,.25)'; g.fillStyle = dot;
  for (let r = 0; r < W.h; r++) for (let c = 0; c < W.w; c++) { const i = r * W.w + c; if (bin.charCodeAt(i >> 3) & (128 >> (i & 7))) { g.beginPath(); g.arc(px(-179.25 + c * 1.5), py(W.lat0 - r * W.step), Math.max(0.8, w / 900), 0, 7); g.fill(); } }
  const lines = K.worldLines(ch, ['jupiter', 'venus', 'sun', 'saturn', 'mars']), CLR = { jupiter: cs.getPropertyValue('--k-good'), venus: cs.getPropertyValue('--k-fam'), sun: cs.getPropertyValue('--k-acc'), saturn: cs.getPropertyValue('--k-bad'), mars: cs.getPropertyValue('--k-bad') };
  Object.keys(lines).forEach(k => { const L = lines[k]; g.strokeStyle = CLR[k]; g.globalAlpha = k === 'saturn' || k === 'mars' ? 0.45 : 0.85; g.lineWidth = 1.4;
    [L.mc].forEach(lo => { g.beginPath(); g.moveTo(px(lo), 0); g.lineTo(px(lo), h); g.stroke(); });
    g.setLineDash([4, 4]); [L.asc, L.dsc].forEach(arr => { g.beginPath(); let prev = null; arr.forEach(([la, lo]) => { const x = px(lo), y = py(la); if (prev && Math.abs(prev - lo) > 90) g.moveTo(x, y); else g.lineTo(x, y); prev = lo; }); g.stroke(); }); g.setLineDash([]);
    g.globalAlpha = 1; g.fillStyle = CLR[k]; g.font = '600 11px Inter Tight,sans-serif'; g.fillText(RU_P[k] + ' MC', px(L.mc) + 4, 14 + ['jupiter', 'venus', 'sun', 'saturn', 'mars'].indexOf(k) * 13); });
  const placed = []; cities.forEach((x, i) => { const X = px(x.c[3]), Y = py(x.c[2]); const clash = placed.some(([a, b]) => Math.abs(a - X) < 90 && Math.abs(b - Y) < 14); placed.push([X, clash ? Y + 16 : Y]); g.beginPath(); g.arc(X, Y, 8, 0, 7); g.fillStyle = cs.getPropertyValue('--k-acc'); g.fill(); g.fillStyle = cs.getPropertyValue('--k-bg'); g.font = '700 10px Inter Tight,sans-serif'; g.textAlign = 'center'; g.fillText(String(i + 1), X, Y + 3.5); g.textAlign = 'left'; if (w > 600) { g.fillStyle = cs.getPropertyValue('--k-text'); g.font = '600 12px Inter Tight,sans-serif'; g.fillText(x.c[0], X + 11, (clash ? Y + 16 : Y) + 4); } });
}

// Locked content is never rendered: only a neutral skeleton of the same rough size goes into the page.
const skel = html => { const n = Math.max(2, Math.min(6, (html.match(/class="km-(c|dir|city|yr|lk|month)\b/g) || []).length)); let o = '<div class="km-g3">';
  for (let i = 0; i < n; i++) o += '<div class="km-c km-skel"><i style="width:40%"></i><i style="width:75%;height:16px"></i><i></i><i></i><i style="width:62%"></i></div>'; return o + '</div>'; };
const lockWrap = (kind, title, html) => has(kind) ? html : '<div class="klk"><div class="klk__in" aria-hidden="true">' + skel(html) + '</div><div class="klk__cta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg><b>' + title + '</b><button class="btn btn--gold btn--sm" type="button" data-buy="' + kind + '">' + (SECTIONS.includes(kind) ? 'Открыть раздел' : 'Открыть') + ' · ' + PRICE[kind][1].toLocaleString('ru') + ' ₽</button>' + (SECTIONS.includes(kind) ? '<button class="ghost btn--sm" type="button" data-buy="full">или вся карта — ' + PRICE.full[1].toLocaleString('ru') + ' ₽</button>' : '<small>или всё вместе — ' + PRICE.all[1].toLocaleString('ru') + ' ₽</small>') + '</div></div>';
const S = (id, n, eyebrow, title, intro, body, topo) => '<section class="km-s' + (topo ? ' topo' : '') + '" id="km-' + id + '"><div class="km-w"><span class="km-eb">' + n + ' · ' + eyebrow + '</span><h2 class="km-h">' + title + '</h2>' + (intro ? '<p class="km-lead">' + intro + '</p>' : '') + body + '</div></section>';

function render(ch) {
  const now = new Date(), Y = now.getFullYear(), g = ch.inp.gender === 'm' ? 'm' : 'f';
  const tr = K.transitsYear(ch, now), prof = K.profection(ch, now), dg = K.dignities(ch), ds = K.dasha(ch), lp = K.lifePath(ch.inp.date);
  const ctx = { dg }, T = tokensOf(ch, ctx), rec = recommend(ch, tr, prof), trR = K.transitsRange(ch, now, 12.5), years = yearScores(ch, trR, ds, now);
  const sgn = k => K.signOf(ch.pos[k].lon), sun = sgn('sun'), moon = sgn('moon'), asc = ch.ang ? K.signOf(ch.ang.asc) : null, nm = ch.inp.name ? esc(ch.inp.name) : '';
  const off = ch.offset / 60, offs = 'UTC' + (off >= 0 ? '+' : '') + off, [yy, mmm, dd] = ch.inp.date.split('-');
  const dms = (v, p, n) => { const a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60); return d + '°' + String(m).padStart(2, '0') + '′' + (v >= 0 ? p : n); };
  const PT = KT('KT_PLANETS'), HP = KT('KT_HOUSE_PLANET');
  let h = '';

  // HERO
  h += '<header class="km-hero km-hero--' + g + '"><div class="km-hero__bg" style="background-image:url(img/karta/hero-' + g + '.webp)"></div><div class="km-w km-hero__in"><div class="km-hero__txt"><span class="km-eb">Персональный навигатор · ' + Y + '–' + (Y + 12) + (nm ? ' · ' + nm : '') + '</span>'
    + '<h1 class="km-title">Карта<br><em>жизни</em></h1><p class="km-sub">Сильные стороны, лучшие направления, деньги, самочувствие, семья, места и маршрут на 12 лет — по положению планет в момент рождения.</p>'
    + '<div class="km-chips"><span>' + dd + '.' + mmm + '.' + yy + ' · ' + (ch.known ? ch.inp.time + ' ' + offs : 'время неизвестно') + '</span><span>' + dms(ch.inp.lat, 'N', 'S') + ' ' + dms(ch.inp.lon, 'E', 'W') + ' · ' + esc(ch.inp.place.split(',')[0]) + '</span><span>' + K.GLYPH[sun] + ' Солнце · ' + K.GLYPH[moon] + ' Луна' + (asc != null ? ' · ' + K.GLYPH[asc] + ' Асцендент' : '') + '</span></div>'
    + '<div class="km-act"><button class="ghost" type="button" id="kEdit">Изменить данные</button><button class="btn btn--gold" type="button" data-go="offer">Полная карта</button></div></div>' + compass() + '</div></header>';
  h += '<nav class="km-nav" id="kmNav"><div class="km-w">' + [['now', 'Сейчас'], ['profile', 'Профиль'], ['career', 'Призвание'], ['money', 'Деньги'], ['health', 'Самочувствие'], ['family', 'Семья'], ['places', 'Где жить'], ['route', 'Маршрут'], ['charter', 'Устав']].map(([i, t]) => '<button type="button" data-go="' + i + '">' + t + '</button>').join('') + '</div></nav>';
  h += '<div class="km-read km-w"><b>Как читать.</b> Положения планет рассчитаны точно, по эфемеридам. Толкования — традиция и язык для размышления, а не доказанный закон. Карта описывает темы и периоды, а не события; результат зависит от ваших решений и обстоятельств. <a href="#d-map">Подробно</a> · <a href="#j-fate">Карта — не приговор</a></div>';
  if (!ch.known) h += '<div class="km-read km-w km-warn"><b>Время рождения неизвестно.</b> Карта построена на 12:00 без домов, Асцендента и MC; Луна может отличаться на ±6°. Точное время восстанавливает ректификация.</div>';

  // 00 СЕЙЧАС
  const at = ds.at(now), active = tr.filter(o => o.from <= now && o.to >= now), soon = tr.filter(o => o.to >= now && o.from - now < 100 * 864e5);
  const good = soon.filter(o => o.tone === 'soft' || (o.ang === 0 && o.p === 'jupiter')), bad = soon.filter(o => !(o.tone === 'soft' || (o.ang === 0 && o.p === 'jupiter')));
  const prNext = YEAR[prof.house % 12].split(':')[0];
  let s0 = '<div class="km-g4">'
    + '<div class="km-c km-c--top"><small>Период жизни · джйотиш</small><h3>' + (at ? RU_P[at.md.lord] + ' / ' + RU_P[at.ad.lord] : '—') + '</h3><p>большой период до ' + (at ? at.md.to.getFullYear() : '') + ', подпериод до ' + (at ? fdate(at.ad.to) : '') + '</p></div>'
    + '<div class="km-c km-c--top"><small>Тема этого года</small><h3>' + K.ROMAN[prof.house - 1] + ' дом' + (prof.sign != null ? ' · ' + K.SIGNS[prof.sign] : '') + '</h3><p>' + (prof.ruler ? 'хозяин года ' + RU_P[prof.ruler] + ': ' : '') + HOUSE[prof.house - 1] + '</p></div>'
    + '<div class="km-c km-c--top"><small>Число пути · нумерология</small><h3>' + lp + '</h3><p>' + (LP[lp] || '') + '</p></div>'
    + '<div class="km-c km-c--top"><small>Влияния планет сейчас</small><h3>' + active.length + ' активн' + (active.length === 1 ? 'ое' : 'ых') + '</h3><p>' + (active.slice(0, 4).map(trNice).join('; ') || 'спокойный период') + '</p></div></div>';
  s0 += '<div class="km-g2"><div class="km-c km-c--good"><h3>Что делать в ближайшие 3 месяца</h3><ul>'
    + (good.slice(0, 3).map(o => '<li><b>' + trNice(o) + '</b> (' + span(o) + '): ' + TR_A[o.p][0] + '</li>').join('') || '')
    + '<li>До ' + fdate(prof.next) + ' — ' + YEAR[prof.house - 1].split(':')[0].toLowerCase() + ': ' + YREC[prof.house - 1] + '. Затем начинается «' + prNext.toLowerCase() + '».</li>'
    + (at && at.ad.to - now < 200 * 864e5 ? '<li>С ' + fdate(at.ad.to) + ' в джйотише начинается подпериод ' + RU_PG[at.md.subs[at.md.subs.indexOf(at.ad) + 1] ? at.md.subs[at.md.subs.indexOf(at.ad) + 1].lord : at.ad.lord] + ' — хорошее время подвести итоги текущего этапа.</li>' : '')
    + '</ul></div><div class="km-c km-c--bad"><h3>На что обратить внимание</h3><ul>' + (bad.slice(0, 4).map(o => '<li><b>' + trNice(o) + '</b> (' + span(o) + '): ' + TR_A[o.p][1] + '</li>').join('') || '<li>Напряжённых транзитов к личным точкам нет — хороший момент для ровной работы.</li>') + '</ul></div></div>';
  const rooms = rec.slice(0, 3).map(r => [window.SITE.ROOMS.find(x => x.id === r.id), r.why]).filter(x => x[0]);
  s0 += '<h3 class="km-h3">Практики для вас сейчас</h3><div class="km-g3">' + rooms.map(([r, why]) => '<a class="km-c km-rec" href="#room-' + r.id + '"><small>' + (r.id === 'cleanse' ? 'Бесплатно' : 'Пространство') + '</small><h3>' + r.name + '</h3><p>' + (why || r.tag) + '</p><span>Открыть →</span></a>').join('') + '</div>';
  h += S('now', '00', 'Сейчас', 'Где вы сейчас на маршруте', MON1[now.getMonth()] + ' ' + Y + '. До ' + fdate(prof.next) + ' идёт ' + YEAR[prof.house - 1].split(':')[0].toLowerCase() + ' (профекция ' + K.ROMAN[prof.house - 1] + ' дома), затем — ' + prNext.toLowerCase() + '.' + (at ? ' В джйотише — подпериод ' + RU_PG[at.ad.lord] + ' внутри большого периода ' + RU_PG[at.md.lord] + '.' : ''), s0);

  // 01 ПРОФИЛЬ
  const big = (lbl, s, sub) => '<div class="km-c km-big"><small>' + lbl + '</small><h3>' + K.SIGNS[s] + '</h3><span>' + sub + '</span></div>';
  const ARCH = KT('KT_ARCH') || [], arch = ARCH.map(a => ({ a, m: matches(a.when, T) })).filter(x => x.m).sort((x, y) => y.m - x.m).slice(0, 3).map(x => x.a);
  const elK = Object.keys(ch.el).sort((a, b) => ch.el[b] - ch.el[a]), crK = Object.keys(ch.cr).sort((a, b) => ch.cr[b] - ch.cr[a]);
  let s1 = '<div class="km-prof"><div class="km-prof__l"><div class="km-g3 km-g3--tight">' + big('Солнце · суть', sun, K.fmtDeg(ch.pos.sun.lon) + (ch.known ? ' · ' + K.ROMAN[ch.pos.sun.house - 1] + ' дом' : '')) + big('Луна · душа', moon, K.fmtDeg(ch.pos.moon.lon) + (ch.known ? ' · ' + K.ROMAN[ch.pos.moon.house - 1] + ' дом' : '')) + (asc != null ? big('Асцендент · образ', asc, K.fmtDeg(ch.ang.asc)) : '<div class="km-c km-big"><small>Асцендент</small><h3>—</h3><span>нужно время</span></div>') + '</div>'
    + arch.map(a => '<div class="km-arch"><div class="km-arch__img" style="background-image:url(img/karta/' + a.img + '.webp)"></div><div><h3>' + esc(a.name) + '</h3><p>' + a.text + '</p></div></div>').join('') + '</div>'
    + '<div class="km-c km-elem"><h3>Баланс стихий</h3><p class="km-muted">Распределение 10 планет' + (ch.ang ? ', Асцендента и MC' : '') + ' по стихиям и крестам.</p>'
    + ['fire', 'water', 'air', 'earth'].map(e => '<div class="km-eb2"><span>' + ELNAME[e] + '</span><i><b style="width:' + ch.el[e] / 12 * 100 * 1.6 + '%;background:' + ELCLR[e] + '"></b></i><em>' + ch.el[e] + '</em></div>').join('')
    + '<p><b>' + ELNAME[elK[0]] + (ch.el[elK[1]] >= ch.el[elK[0]] - 1 ? ' + ' + ELNAME[elK[1]] : '') + ':</b> ' + ELT[elK[0]][1] + '.</p>' + Object.keys(ch.el).filter(e => ch.el[e] <= 1).map(e => '<p>' + LACK[e].replace(/^([^:]+):/, '<b>$1:</b>') + '</p>').join('')
    + '<div class="km-cross">' + crK.map(c => '<div><b>' + ch.cr[c] + '</b><span>' + CRT[c][0] + '</span><small>' + CRT[c][1] + '</small></div>').join('') + '</div><p class="km-muted">Вывод: ' + CRT[crK[0]][2] + '</p></div></div>';
  s1 += '<div class="km-wheelrow"><div class="km-c"><h3>Круг вашей карты</h3><p class="km-muted">Положение планет в момент рождения' + (ch.known ? ', дома по ' + ch.system : '') + '. Синие линии — гармоничные аспекты, красные — напряжённые.</p><canvas id="kWheel" aria-label="Круг натальной карты"></canvas></div></div>';
  const PL = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];
  const fortune = ch.ang ? K.norm(ch.pos.sun.house >= 7 ? ch.ang.asc + ch.pos.moon.lon - ch.pos.sun.lon : ch.ang.asc + ch.pos.sun.lon - ch.pos.moon.lon) : null;
  const pcard = k => { const s = K.signOf(ch.pos[k].lon), hs = ch.known ? ch.pos[k].house : null, txt = k === 'node' ? (KT('KT_NODE') || [])[s] : PT && PT[k] ? PT[k][s] : null;
    return '<div class="km-c km-pl"><div class="km-pl__h"><span class="km-pl__g">' + (GL[k] || '') + '︎</span><div><h3>' + RU_P[k] + '</h3><span class="km-mono">' + K.fmtDeg(ch.pos[k].lon) + ' ' + K.SIGNS[s] + (hs ? ' · ' + K.ROMAN[hs - 1] + ' дом' : '') + (ch.pos[k].retro ? ' · R' : '') + '</span></div></div><small>' + (PTHEME[k] || '') + '</small>'
      + '<p>' + (txt ? txt.t : SIGN[s].core) + (hs && HP && HP[k] ? ' ' + RU_P[k] + ' в ' + K.ROMAN[hs - 1] + ' доме: ' + HP[k][hs - 1] + '.' : '') + '</p>' + (txt && txt.u ? '<p class="km-use"><b>Как использовать:</b> ' + txt.u + '</p>' : '') + '</div>'; };
  const crew = PL.map(pcard).join('') + (fortune != null ? '<div class="km-c km-pl"><div class="km-pl__h"><span class="km-pl__g">⊗</span><div><h3>Колесо Фортуны</h3><span class="km-mono">' + K.fmtDeg(fortune) + ' ' + K.SIGNS[K.signOf(fortune)] + '</span></div></div><small>точка удачи</small><p>Удача приходит через качества знака ' + SIGNG[K.signOf(fortune)] + ': ' + SIGN[K.signOf(fortune)].gift + '.</p></div>' : '');
  s1 += '<h3 class="km-h3">Планеты: ваш внутренний «экипаж»</h3>' + (has('full') ? '<div class="km-g3">' + crew + '</div>' : '<div class="km-g3">' + PL.slice(0, 3).map(pcard).join('') + '</div>');
  // акценты
  const acc = []; if (ch.known) { const byH = {}; PL.slice(0, 10).forEach(k => (byH[ch.pos[k].house] = byH[ch.pos[k].house] || []).push(k));
    Object.keys(byH).filter(hh => byH[hh].length >= 2).sort((a, b) => byH[b].length - byH[a].length).slice(0, 4).forEach(hh => acc.push({ tag: K.ROMAN[hh - 1] + ' дом', t: HOUSE[hh - 1][0].toUpperCase() + HOUSE[hh - 1].slice(1), p: byH[hh].map(k => RU_P[k]).join(', ') + ' в ' + K.ROMAN[hh - 1] + ' доме. Эта сфера жизни — одна из главных: здесь сосредоточена ваша энергия и уроки.' })); }
  if (acc.length < 4) acc.push({ tag: ELNAME[elK[0]], t: 'Ведущая стихия', p: ELT[elK[0]][1][0].toUpperCase() + ELT[elK[0]][1].slice(1) + '.' });
  const dgs = K.CLASSIC.slice().sort((a, b) => dg[b].total - dg[a].total);
  const sAcc = '<h3 class="km-h3">Акценты карты</h3><div class="km-g4">' + acc.slice(0, 4).map(a => '<div class="km-c"><span class="km-tag">' + a.tag + '</span><h3>' + a.t + '</h3><p>' + a.p + '</p></div>').join('') + '</div>';
  const asp = ch.aspects.filter(a => a.a !== 'node' && a.b !== 'node').slice(0, 8);
  const sAsp = '<h3 class="km-h3">Главные аспекты: как планеты разговаривают между собой</h3><div class="km-g3">' + asp.map(a => '<div class="km-c km-asp km-asp--' + (a.tone === 'hard' ? 'hard' : 'soft') + '"><span class="km-asp__g">' + (GL[a.a] || '') + ' ' + a.g + ' ' + (GL[a.b] || '') + '</span><div><h3>' + RU_P[a.a] + ' ' + a.name + ' ' + RU_P[a.b] + ' · ' + a.orb.toFixed(0) + '°</h3><p>' + (aspectText(a) || (a.tone === 'hard' ? 'Напряжение между темами «' + (PTHEME[a.a] || '') + '» и «' + (PTHEME[a.b] || '') + '»: источник роста через усилие.' : 'Темы «' + (PTHEME[a.a] || '') + '» и «' + (PTHEME[a.b] || '') + '» поддерживают друг друга.')) + '</p></div></div>').join('') + '</div>';
  const cn = (() => { const d = new Date(ch.inp.date + 'T12:00:00'); let y = d.getFullYear(); if (d.getMonth() < 1 || (d.getMonth() === 1 && d.getDate() < 4)) y--; return EL_CN[((y - 4) % 10 + 10) % 10] + ' · ' + ZODIAC_CN[((y - 4) % 12 + 12) % 12]; })();
  const sEast = '<div class="km-g4 km-east"><div class="km-c"><h3>Ключевые аспекты</h3><p>' + asp.slice(0, 4).map(a => RU_P[a.a] + ' ' + a.name + ' ' + RU_P[a.b] + ' (' + a.orb.toFixed(0) + '°)').join(', ') + '.</p></div>'
    + '<div class="km-c"><h3>Джйотиш (Лахири)</h3><p>' + (ds.sidAsc != null ? 'Асцендент ' + K.fmtDeg(ds.sidAsc) + ' ' + SIGNG[K.signOf(ds.sidAsc)] + ', ' : '') + 'Солнце ' + K.fmtDeg(ds.sidSun) + ' ' + SIGNG[K.signOf(ds.sidSun)] + ', Луна ' + K.fmtDeg(ds.sidMoon) + ' ' + SIGNG[K.signOf(ds.sidMoon)] + ' (' + ds.nak + ').</p></div>'
    + '<div class="km-c"><h3>Нумерология</h3><p>Число пути ' + lp + ': ' + (LP[lp] || '') + '.</p></div><div class="km-c"><h3>Восточный календарь</h3><p>' + cn + ' (по году рождения, граница — 4 февраля).</p></div></div>';
  const sDig = '<h3 class="km-h3">Сильные и слабые планеты</h3><p class="km-muted">Классическая оценка силы семи планет (по таблицам Уильяма Лилли). Сильные — на что можно опираться; слабые — что стоит поддерживать.</p><div class="km-dig">' + dgs.map(k => '<div class="km-c"><div class="km-dig__r"><b>' + RU_P[k] + '</b><i><b style="width:' + Math.max(3, Math.min(100, (dg[k].total + 12) / 34 * 100)) + '%"></b></i><em>' + (dg[k].total > 0 ? '+' : '') + dg[k].total + '</em></div><p>' + (dg[k].notes.length ? dg[k].notes.join(', ') : 'без поддержки знака') + (dg[k].total >= 8 ? ' — опора карты.' : dg[k].total <= 0 ? ' — тему стоит поддерживать сознательно.' : '.') + '</p></div>').join('') + '</div>';
  s1 += has('full') ? sAcc + sAsp + sEast + sDig : lockWrap('full', 'Ещё 9 планет, аспекты, джйотиш и сила планет', '<div class="km-g3">' + PL.slice(3, 9).map(pcard).join('') + '</div>' + sAcc);
  h += S('profile', '01', 'Профиль', 'С чем вы пришли', 'Основа карты: три ключевые точки, сильные стороны, баланс стихий и подробный разбор каждой планеты.', s1, true);

  // 02 ПРИЗВАНИЕ
  const dirs = scoreDirs(ch, T), mx = dirs[0].s || 1, moneyPot = (() => { let v = dg.jupiter.total / 4 + dg.venus.total / 5; if (ch.known) v += K.PLANETS.slice(0, 10).filter(p => [2, 8, 10, 11].includes(ch.pos[p[0]].house)).length * 0.8; if (T.has('jupiter-asc')) v += 2; ch.aspects.forEach(a => { const ps = [a.a, a.b]; if (ps.includes('jupiter') && (ps.includes('sun') || ps.includes('moon') || ps.includes('venus')) && a.tone === 'soft') v += 1; if ((ps.includes('saturn') || ps.includes('neptune')) && (ps.includes('venus') || ps.includes('jupiter')) && a.tone === 'hard') v -= 1; }); return Math.max(0.15, Math.min(0.95, 0.35 + v / 14)); })();
  const d8 = dirs.slice(0, 8).map((d, i) => { const self = Math.max(2, Math.min(5, Math.round(2 + d.s / mx * 3))), money = Math.max(1, Math.min(5, Math.round(d.money - 1 + moneyPot * 2))); return '<div class="km-dir"><div class="km-dir__img" style="background-image:url(img/karta/' + d.img + '.webp)">' + (i < 3 ? '<span>ТОП-' + (i + 1) + '</span>' : '') + '</div><div class="km-dir__b"><b class="km-num">' + String(i + 1).padStart(2, '0') + '</b><h3>' + d.n + '</h3><p>' + d.d + '</p><p class="km-mono km-blue">' + (d.tags.join(' · ') || 'общий рисунок карты') + '</p>' + bar('Самореализация', self, 5, 'a') + bar('Деньги', money, 5, 'g') + '<p class="km-use"><b>Первый шаг:</b> ' + d.step + '</p></div></div>'; });
  const mcS = ch.ang ? K.signOf(ch.ang.mc) : sun;
  let s2 = has('career') ? '<div class="km-g3">' + d8.slice(0, 3).join('') + '</div>' + ('<div class="km-g3">' + d8.slice(3).join('') + '</div>'
    + '<div class="km-formula"><span>★</span><div><h3>Главная формула: ' + dirs[0].n.split(' · ')[0].toLowerCase() + ' + ' + dirs[1].n.toLowerCase() + '</h3><p>' + MC[mcS] + '</p></div></div>'
    + '<div class="km-g2"><div class="km-c km-c--good"><h3>Где вы растёте</h3><ul><li>' + SIGN[sun].gift[0].toUpperCase() + SIGN[sun].gift.slice(1) + '</li><li>там, где нужна ваша сила: ' + SIGN[mcS].core.split(':')[0] + '</li><li>среда, где ценят ' + SIGN[asc != null ? asc : moon].core.split(',')[0] + '</li><li>результат виден и измерим</li></ul></div><div class="km-c km-c--bad"><h3>Где вы гаснете</h3><ul><li>когда нет места для качества «' + SIGN[sun].gift + '»</li><li>' + SIGN[sun].grow[0].toUpperCase() + SIGN[sun].grow.slice(1) + ' — зона роста, а не повод сдаться</li><li>однообразие без смысла и перспективы</li><li>среда, где чужие правила важнее вашего голоса</li></ul></div></div>'
    ) : lockWrap('career', '8 направлений, где вы сильнее всего, и главная формула', '<div class="km-g3">' + d8.slice(0, 6).join('') + '</div>');
  h += S('career', '02', 'Призвание', 'Восемь дорог, где вы сильнее всего', 'Направления отсортированы по совпадению с картой. У каждого — шкалы самореализации и денег и первый шаг, с которого можно начать.', s2, false);

  // 03 ДЕНЬГИ
  const MCH = [
    ['Через себя и личную инициативу', 'Деньги приходят, когда вы сами берёте ответственность: своё дело, личный бренд, роль, где результат зависит от вашей энергии и решений.'],
    ['Через собственный ресурс и навык', 'Главный канал — то, что вы умеете и имеете: мастерство, продукт, активы. Доход растёт вместе с ценностью, которую вы сами создаёте.'],
    ['Через слова, связи и обучение', 'Деньги идут через общение: продажи, переговоры, тексты, обучение, посредничество, несколько параллельных проектов.'],
    ['Через дом, семью и недвижимость', 'Канал — всё, что связано с домом и корнями: недвижимость, семейное дело, забота о людях, проекты «для своих».'],
    ['Через творчество и удовольствие', 'Доход приносит то, что вам в радость: творчество, личный бренд, работа с детьми, игры, события, красота.'],
    ['Через работу, систему и сервис', 'Деньги приходят через регулярный труд и порядок: профессия, сервис, процессы, здоровье и качество. Ваш капитал — надёжность.'],
    ['Через партнёров и договоры', 'Главный канал — союзы: партнёрский бизнес, клиенты, консалтинг, переговоры. Вдвоём вы зарабатываете больше, чем поодиночке.'],
    ['Через чужие ресурсы и инвестиции', 'Деньги идут через капитал других людей и глубокие проекты: инвестиции, сделки, кредиты, наследство, кризисные задачи, где ставки высоки.'],
    ['Через масштаб, обучение и заграницу', 'Канал — большие идеи и расширение: международные проекты, наставничество, обучение, издательство, путешествия.'],
    ['Через карьеру и статус', 'Деньги приходят через положение и репутацию: руководство, видимая роль, долгие проекты. Чем выше ответственность — тем выше доход.'],
    ['Через сообщества, сети и технологии', 'Главный канал — люди и сети: команда, клиенты по рекомендации, онлайн-проекты, технологии, коллективные начинания.'],
    ['Через тонкое, скрытое и служение', 'Доход приходит через то, что не на виду: работа за кадром, помогающие профессии, творчество, духовные и благотворительные проекты, иностранные связи.']
  ];
  const KEYP = { saturn: ['Система и терпение', 'Стройте доход медленно и надёжно: бюджет, план на год, рост через мастерство. Спешка здесь стоит дороже всего.'], neptune: ['Проверка фактов', 'Все договорённости — письменно, цифры — по документам, обещания — проверять. Не вкладывайтесь «по вдохновению» и не давайте в долг из жалости.'], uranus: ['Подушка и гибкость', 'Доход может быть волнами: держите резерв на 6 месяцев и несколько источников, чтобы неожиданности не выбивали из колеи.'], pluto: ['Прозрачность и контроль рисков', 'Большие суммы — только с ясными правилами и лимитом риска. Избегайте игр «всё или ничего» и борьбы за власть в деньгах.'], mars: ['Пауза перед решением', 'Крупные траты и сделки — только после 24 часов паузы. Энергию направляйте в работу, а не в импульсивные покупки и споры.'] };
  const lvl = moneyPot > 0.7 ? 'Уровень владельца и капитала' : moneyPot > 0.5 ? 'Высокий доход через своё дело' : 'Устойчивый доход через мастерство';
  const h2s = ch.cusps ? K.signOf(ch.cusps[1]) : K.signOf(ch.pos.venus.lon), r2 = K.RULER[h2s], r2h = ch.known && ch.pos[r2] ? ch.pos[r2].house : null;
  const ind = [];
  if (T.has('jupiter-asc')) ind.push(['Юпитер у Асцендента', 'Классический признак покровительства и удачи: люди охотно помогают, а шансы приходят, когда вы сами проявляетесь.']);
  if (dg.venus.ess >= 4) ind.push(['Сильная Венера', 'Деньги легче приходят через людей, вкус и договорённости: обаяние и умение договариваться — ваш денежный актив.']);
  if (dg.jupiter.ess >= 4) ind.push(['Сильный Юпитер', 'Природная щедрость и масштаб: вы умеете расти и вести за собой. Важно знать меру в обещаниях и тратах.']);
  if (ch.known && [2, 8, 10, 11].includes(ch.pos.jupiter.house)) ind.push(['Юпитер в ' + K.ROMAN[ch.pos.jupiter.house - 1] + ' доме', 'Удача сосредоточена в сфере «' + HOUSE[ch.pos.jupiter.house - 1] + '» — именно там стоит искать рост дохода.']);
  if (r2h) ind.push(['Управитель денежного дома в ' + K.ROMAN[r2h - 1] + ' доме', RU_P[r2] + ' управляет вашим II домом и стоит в сфере «' + HOUSE[r2h - 1] + '»: туда направлен ваш главный денежный поток.']);
  if (fortune != null) ind.push(['Колесо Фортуны в знаке ' + K.SIGNS[K.signOf(fortune)], 'Удача приходит через качество «' + SIGN[K.signOf(fortune)].gift + '». Чем чаще вы его используете, тем больше совпадений в вашу пользу.']);
  ch.aspects.filter(a => a.tone === 'soft' && ['jupiter', 'venus'].some(p => a.a === p || a.b === p)).slice(0, 2).forEach(a => { const MG = { uranus: 'неожиданные возможности и нестандартные источники дохода', neptune: 'вдохновение, творческие и помогающие проекты', pluto: 'умение работать с крупными ресурсами и сделками', saturn: 'надёжность, долгие вложения и терпение', mars: 'энергия и предприимчивость', mercury: 'переговоры, торговля и умные решения', moon: 'денежная интуиция и забота о людях', sun: 'уверенность и признание', jupiter: 'рост и щедрость, которая возвращается', venus: 'связи, вкус и договорённости', asc: 'личное обаяние', mc: 'карьера и репутация' };
    const other = a.a === 'jupiter' || a.a === 'venus' ? a.b : a.a, main = other === a.b ? a.a : a.b; ind.push([RU_P[a.a] + ' ' + a.name + ' ' + RU_P[a.b], 'Гармоничная связь: ' + RU_P[main] + ' поддерживает деньги через ' + (MG[other] || 'вашу энергию') + '.']); });
  const jy = trR.filter(o => o.p === 'jupiter' && (o.tone === 'soft' || o.ang === 0) && ['sun', 'venus', 'jupiter', 'mc'].includes(o.n)).map(o => o.from.getFullYear()), jys = [...new Set(jy)].slice(0, 5);
  const satY = trR.filter(o => o.p === 'saturn' && o.tone === 'soft' && ['mc', 'sun', 'venus'].includes(o.n)).map(o => o.from.getFullYear()), satys = [...new Set(satY)].slice(0, 3);
  const lim = ch.aspects.filter(a => a.tone === 'hard' && ['saturn', 'neptune', 'pluto', 'mars', 'uranus'].some(p => a.a === p || a.b === p) && ['venus', 'jupiter', 'moon', 'sun', 'mars', 'mercury'].some(p => a.a === p || a.b === p)).slice(0, 4);
  const mch = MCH[r2h ? r2h - 1 : 1], vnS = K.signOf(ch.pos.venus.lon), jup = K.signOf(ch.pos.jupiter.lon), sat = K.signOf(ch.pos.saturn.lon);
  const strat = [
    'Главный канал дохода — ' + mch[0].toLowerCase().replace(/^через /, '') + '. Проверьте: сколько из вашего дохода сейчас идёт именно оттуда?',
    'Ваш денежный стиль (II дом в знаке ' + K.SIGNS[h2s] + '): ' + MONEY[h2s],
    'Венера в знаке ' + K.SIGNS[vnS] + ' — как вы цените и тратите: вам важно, чтобы деньги давали ' + SIGN[vnS].need.split(',')[0] + '. Тратьте осознанно на то, что действительно даёт это чувство.',
    'Юпитер в знаке ' + K.SIGNS[jup] + ' — где вы растёте: через ' + SIGN[jup].gift + '. Вкладывайтесь в это: обучение, связи, проекты.',
    'Сатурн в знаке ' + K.SIGNS[sat] + ' — ваш денежный урок: ' + SIGN[sat].grow + '. Здесь деньги приходят медленно, но остаются надолго.'
  ];
  let s3 = '<div class="km-banner km-banner--money" style="background-image:url(img/karta/skyline.webp)"><small>Потенциал</small><h3>' + lvl + '</h3><p>' + (moneyPot > 0.7 ? 'В карте несколько сильных денежных признаков. Ваш масштаб — не только высокий доход, а собственный капитал и активы.' : moneyPot > 0.5 ? 'Денежные признаки выше среднего. Лучший результат — когда вы работаете на себя или в доле, а не только за зарплату.' : 'Ваши деньги — в мастерстве и надёжности. Устойчивый рост дохода через профессию и репутацию.') + '</p><div class="km-scale"><i style="left:' + moneyPot * 100 + '%"></i></div><div class="km-scale__l"><span>Доход специалиста</span><span>Высокий доход</span><span>Владелец капитала</span></div></div>'
    + '<div class="km-g3"><div class="km-c km-c--top"><small>Источник</small><h3>' + mch[0] + '</h3><p>' + mch[1] + '</p>' + (r2h ? '<p class="km-mono km-blue">' + RU_P[r2] + ', управитель II дома, в ' + K.ROMAN[r2h - 1] + ' доме</p>' : '') + '</div>'
    + '<div class="km-c km-c--top"><small>Время роста</small><h3>' + (jys.length ? 'Волны: ' + jys.slice(0, 3).join(', ') : 'Ровный рост') + '</h3><p>Годы, когда Юпитер мягко касается ваших денежных и карьерных точек: хорошее время просить, запускать, договариваться о большем.' + (satys.length ? ' Годы закрепления результата (Сатурн): ' + satys.join(', ') + '.' : '') + '</p></div>'
    + '<div class="km-c km-c--top"><small>Масштаб</small><h3>' + (moneyPot > 0.7 ? 'Высокий' : moneyPot > 0.5 ? 'Выше среднего' : 'Устойчивый') + '</h3><p>' + (dg.saturn.total >= 4 ? 'С возрастом доход растёт сильнее, чем в молодости: Сатурн платит поздно, но надёжно.' : 'Доход растёт волнами по циклам Юпитера: важно не пропускать благоприятные годы.') + '</p></div></div>'
    + '<h3 class="km-h3">Денежные признаки вашей карты</h3><div class="km-g2 km-checks">' + ind.slice(0, 6).map(([a, b]) => '<div class="km-c"><span class="km-ok">✓</span><div><b>' + a + '</b><p>' + b + '</p></div></div>').join('') + '</div>'
    + (jys.length ? '<div class="km-chipsY">' + jys.map((y, i) => '<span class="' + (i === 1 ? 'on' : '') + '">' + y + ' · ' + ['фундамент', 'главная волна', 'рост', 'новая высота', 'урожай'][i] + '</span>').join('') + '</div>' : '')
    + '<h3 class="km-h3">Ваша денежная стратегия</h3><div class="km-c"><ol class="km-strat">' + strat.map(x => '<li>' + x + '</li>').join('') + '</ol></div>'
    + (lim.length ? '<h3 class="km-h3">Что мешает и как это снять</h3><div class="km-g2">' + lim.map(a => { const outer = ['saturn', 'neptune', 'uranus', 'pluto', 'mars'].find(p => a.a === p || a.b === p), kp = KEYP[outer] || ['Осознанность', 'Замечайте этот сценарий заранее.'], t = aspectText(a).split(/(?<=\.)\s+/);
        return '<div class="km-lk"><div><small>Ограничение</small><b>' + RU_P[a.a] + ' ' + a.name + ' ' + RU_P[a.b] + '</b><p>' + (t[0] || '') + '</p></div><div><small>Ключ</small><b>' + kp[0] + '</b><p>' + kp[1] + '</p></div></div>'; }).join('') + '</div>' : '')
    + '<p class="km-note">Это описание склонностей и периодов, а не финансовый совет и не гарантия дохода. Решения о деньгах и вложениях принимайте сами и со специалистами.</p>';
  h += S('money', '03', 'Деньги', 'Финансовый потенциал', 'Конкретную сумму не называет ни одна система. Классические признаки показывают масштаб, источник и время роста, а также что мешает и как это снять.', lockWrap('money', 'Финансовый потенциал, источники и ключи', s3), true);

  // 04 САМОЧУВСТВИЕ
  const Z = KT('KT_ZONES') || []; const zsrc = [['Солнце', sun], ['Луна', moon]].concat(asc != null ? [['Асцендент', asc]] : []).concat(ch.cusps ? [['VI дом', K.signOf(ch.cusps[5])]] : []).concat([['Марс', sgn('mars')], ['Сатурн', sgn('saturn')]]);
  const zones = []; zsrc.forEach(([w, s]) => { const z = zones.find(x => x.sign === s); if (z) z.by.push(w); else zones.push({ sign: s, by: [w] }); });
  const zl = zones.slice(0, 6);
  const SPORT = { fire: ['Интенсив и азарт', 'Короткие интенсивные тренировки, игры, единоборства — выход для огня.'], earth: ['Силовые по плану', 'Тренировки по программе: техника, прогрессия, учёт.'], air: ['Ритм и лёгкость', 'Бег, танцы, велосипед, групповые занятия с общением.'], water: ['Вода и плавность', 'Плавание, йога, растяжка, долгие прогулки у воды.'] };
  const FOOD = { fire: ['Не перегревать', 'Меньше кофеина и острого вечером, больше воды.'], earth: ['Ритм и мера', 'Есть в одно и то же время, порции по тарелке.'], air: ['Не на бегу', 'Регулярность и спокойная еда без экрана.'], water: ['Вода и лёгкость', 'Достаточно воды, лёгкий ужин, внимание к сигналам тела.'] };
  const hy = years.map(y => '<div class="km-yb"><em>' + y.sc.health + '/5</em><i class="' + (y.sc.health >= 4 ? 'g' : y.sc.health <= 2 ? 'r' : 'b') + '" style="height:' + y.sc.health * 18 + 'px"></i><span>' + y.y + '</span></div>').join('');
  const att = uniqT(trR.filter(o => ['saturn', 'pluto', 'neptune', 'uranus'].includes(o.p) && ['sun', 'asc', 'moon'].includes(o.n)).concat(trR.filter(o => o.p === 'jupiter' && o.ang !== 90 && o.ang !== 180 && ['sun', 'asc'].includes(o.n)))).sort((a, b) => a.from - b.from).slice(0, 8);
  let s4 = '<div class="km-health"><div class="km-c km-bodyc">' + bodySvg(zl) + '<p class="km-muted">Номера соответствуют зонам в списке.</p></div><div class="km-zones">' + zl.map((z, i) => { const t = Z[z.sign] || {}; return '<div class="km-c km-zone"><span class="km-zone__n">' + (i + 1) + '</span><div><h3>' + (t.zone || K.SIGNS[z.sign]) + '</h3><span class="km-mono km-blue">' + z.by.join(', ') + ' · ' + K.SIGNS[z.sign] + '</span>' + (t.tips ? '<ul>' + t.tips.map(x => '<li>' + x + '</li>').join('') + '</ul>' : '') + (t.note ? '<p class="km-muted">' + t.note + '</p>' : '') + '</div></div>'; }).join('') + '</div></div>'
    + '<h3 class="km-h3">Движение по карте</h3><div class="km-g4">' + [elK[0], elK[1], 'earth', 'water'].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4).map(e => '<div class="km-c"><h3>' + SPORT[e][0] + '</h3><p>' + SPORT[e][1] + '</p><span class="km-mono km-blue">стихия ' + ELNAME[e] + '</span></div>').join('') + '</div>'
    + '<h3 class="km-h3">Питание по карте</h3><div class="km-g4">' + Object.keys(FOOD).map(e => '<div class="km-c km-c--leftg"><h3>' + FOOD[e][0] + '</h3><p>' + FOOD[e][1] + '</p><span class="km-mono km-blue">' + (ch.el[e] >= 4 ? 'много: ' : ch.el[e] <= 1 ? 'мало: ' : '') + ELNAME[e] + '</span></div>').join('') + '</div>'
    + '<h3 class="km-h3">Энергия по годам</h3><div class="km-c km-years">' + hy + '</div><p class="km-muted">5 — много сил, 1 — время беречь себя. Оценка по транзитам, годовым профекциям и периодам джйотиша.</p>'
    + (att.length ? '<h3 class="km-h3">Периоды повышенного внимания</h3><div class="km-g4">' + att.map(o => { const gd = o.tone === 'soft' || (o.p === 'jupiter' && o.ang === 0); return '<div class="km-c"><h3 class="' + (gd ? 'km-g' : 'km-r') + '">' + span(o) + '</h3><p>' + trNice(o) + ': ' + TR_A[o.p][gd ? 0 : 1] + '</p></div>'; }).join('') + '</div>' : '')
    + '<p class="km-note">Астрология не диагностирует и не предсказывает болезни. Это советы о режиме и самочувствии. При любых симптомах обращайтесь к врачу.</p>';
  h += S('health', '04', 'Самочувствие', 'Зоны внимания и ваш режим', 'Карта подсказывает, какой ритм подходит телу и когда силы стоит беречь. Это профилактика и забота о себе, а не диагноз.', lockWrap('health', 'Зоны внимания, режим и энергия по годам', s4), false);

  // 05 СЕМЬЯ
  const ven = sgn('venus'), h7 = ch.cusps ? K.signOf(ch.cusps[6]) : null, h4 = ch.cusps ? K.signOf(ch.cusps[3]) : null;
  const in7 = ch.known ? PL.slice(0, 10).filter(k => ch.pos[k].house === 7).map(k => RU_P[k]) : [];
  const famHard = ch.aspects.filter(a => a.tone === 'hard' && ['mars', 'venus', 'moon', 'mercury'].some(p => a.a === p || a.b === p) && ['neptune', 'saturn', 'uranus', 'pluto'].some(p => a.a === p || a.b === p))[0];
  const famT = uniqT(trR.filter(o => ['venus', 'moon', 'dsc', 'ic'].includes(o.n))).slice(0, 10);
  let s5 = '<div class="km-fam"><div class="km-fam__ph"><div style="background-image:url(img/karta/family.webp)"></div><div style="background-image:url(img/karta/couple.webp)"></div><div style="background-image:url(img/karta/room.webp)"></div></div><div class="km-fam__c">'
    + '<div class="km-c"><h3>Вы в отношениях</h3><p>' + LOVE[ven] + ' Чтобы было спокойно, вам нужны ' + SIGN[moon].need + '.</p></div>'
    + (h7 != null ? '<div class="km-c"><h3>Партнёр в вашей карте</h3><p>Десцендент в знаке ' + K.SIGNS[h7] + ': вас притягивает ' + SIGN[h7].look + '.' + (in7.length ? ' В VII доме: ' + in7.join(', ') + ' — партнёрство один из главных уроков роста.' : '') + '</p></div>' : '')
    + (h4 != null ? '<div class="km-c"><h3>Дом</h3><p>IC в знаке ' + K.SIGNS[h4] + ': дом для вас — это ' + SIGN[h4].need + '.</p></div>' : '')
    + '<div class="km-c"><h3>Свобода и близость</h3><p>' + (T.has('aspect-hard:moon-uranus') || T.has('aspect-hard:venus-uranus') ? 'Даже в крепком союзе вам нужно своё дело и личное время. Договоритесь об этом заранее.' : 'Близость для вас — это ' + SIGN[moon].need.split(',')[0] + '. Говорите об этом прямо.') + '</p></div>'
    + (famHard ? '<div class="km-rule"><b>Правило пары · ' + RU_P[famHard.a] + ' ' + famHard.name + ' ' + RU_P[famHard.b] + ':</b> ' + ((aspectText(famHard).split(/(?<=\.)\s+/)[1]) || 'говорить прямо и вслух — недосказанность превращается в обиды.') + '</div>' : '<div class="km-rule"><b>Правило пары:</b> говорить прямо и вслух — так чувства не превращаются в обиды.</div>') + '</div></div>'
    + '<div class="km-g5">' + famT.map(o => { const gd = o.tone === 'soft' || (o.p === 'jupiter' && o.ang === 0); return '<div class="km-c"><h3 class="' + (gd ? 'km-g' : 'km-r') + '">' + span(o) + '</h3><p>' + trNice(o) + ': ' + (gd ? 'тёплый период, обновление и сближение.' : TR_A[o.p][1]) + '</p></div>'; }).join('') + '</div>';
  h += S('family', '05', 'Семья', 'Тыл, который даёт силу', 'Как вы любите, кого притягиваете, каким должен быть дом и какие периоды важны для отношений.', lockWrap('family', 'Отношения, дом и периоды для семьи', s5), true);

  // 06 ГДЕ ЖИТЬ
  const cs = scoreCities(ch).filter(x => x.hits.length), best = cs.slice().sort((a, b) => b.total - a.total);
  const usedC = new Set(), regN = {}, ok = x => x && !usedC.has(x.c[1]) && (regN[x.c[4]] || 0) < 2, take = (x, l) => { usedC.add(x.c[1]); regN[x.c[4]] = (regN[x.c[4]] || 0) + 1; return { x, l }; };
  const picks = [];
  [[cs.slice().sort((a, b) => b.sc.family - a.sc.family || b.total - a.total), 'Лучшее для семьи'], [cs.slice().sort((a, b) => b.sc.money - a.sc.money || b.total - a.total), 'Лучшее для денег'], [cs.slice().sort((a, b) => b.sc.career - a.sc.career || b.total - a.total), 'Лучшее для карьеры'], [cs.filter(x => x.hits.some(h => ['uranus', 'mars', 'pluto'].includes(h.p) && h.angle === 'MC')).sort((a, b) => b.sc.career - a.sc.career), 'Прорыв']]
    .forEach(([arr, l]) => { const x = arr.find(ok); if (x) picks.push(take(x, l)); });
  best.filter(x => x.hard === 0).forEach(x => { if (picks.length < 10 && ok(x)) picks.push(take(x, 'Хорошо')); });
  const city = (p, i) => '<div class="km-city"><div class="km-city__img" style="background-image:url(img/karta/' + (CITY_IMG[p.x.c[0]] || GEN_IMG[i % GEN_IMG.length]) + '.webp)"><span>' + (i + 1) + '</span></div><div class="km-city__b"><small>★ ' + p.l + ' · ' + p.x.c[4] + '</small><h3>' + p.x.c[0] + '</h3><p>' + p.x.c[1] + '. ' + p.x.hits.slice(0, 3).map(hitText).join(', ') + '.</p>' + bar('Карьера', p.x.sc.career, 5, 'a') + bar('Деньги', p.x.sc.money, 5, 'g') + bar('Семья', p.x.sc.family, 5, 'p') + '</div></div>';
  const mini = (p, i) => '<div class="km-c km-cmini"><span class="km-cmini__n">' + (i + 1) + '</span><div><h3>' + p.x.c[0] + ' <em>' + p.x.c[1] + ' · ' + p.x.c[4] + '</em></h3><p>' + p.x.hits.slice(0, 2).map(hitText).join(', ') + '</p>' + bar('Карьера', p.x.sc.career, 5, 'a') + bar('Деньги', p.x.sc.money, 5, 'g') + bar('Семья', p.x.sc.family, 5, 'p') + '</div></div>';
  const harder = (() => { const seen = new Set(picks.map(p => p.x.c[1])); return cs.filter(x => x.hard >= 1).sort((a, b) => b.hard - a.hard || a.total - b.total).filter(x => { if (seen.has(x.c[1])) return false; seen.add(x.c[1]); return true; }).slice(0, 6); })();
  let s6 = '<div class="km-c km-map"><canvas id="kWorld" aria-label="Карта мира с линиями планет"></canvas><p class="km-muted">Цифры — ваши ' + picks.length + ' точек силы по всему миру. Сплошные линии — планета в зените (MC), пунктир — на восходе и закате (ASC/DSC). Зелёный — Юпитер, розовый — Венера, золотой — Солнце, красный — Сатурн и Марс.</p></div>'
    + '<div class="km-g4">' + picks.slice(0, 4).map(city).join('') + '</div>'
    + (picks.length > 4 ? '<h3 class="km-h3">Ещё ' + (picks.length - 4) + ' точек силы</h3><div class="km-g3">' + picks.slice(4).map((p, i) => mini(p, i + 4)).join('') + '</div>' : '')
    + '<div class="km-c km-c--bad"><h3>Будет тяжелее</h3><ul>' + harder.map(x => '<li><b>' + x.c[0] + ' (' + x.c[1] + '):</b> ' + x.hits.filter(h => ['saturn', 'pluto', 'mars', 'neptune'].includes(h.p)).slice(0, 2).map(hitText).join(', ') + '</li>').join('') + '</ul></div>';
  h += S('places', '06', 'Где жить', 'Точки силы на карте мира', 'Астрокартография по всему миру, независимо от того, где вы живёте сейчас: в этих городах благоприятные планеты оказываются на ключевых углах вашей карты.' + (ch.known ? ' Ошибка времени рождения на 4 минуты сдвигает линии примерно на 1° (около 100 км).' : ' Без точного времени рождения линии неточны.'), lockWrap('places', 'Ваши города и линии планет', s6), false);

  // 07 МАРШРУТ
  const peak = years.slice(1).reduce((a, b) => (b.sum > a.sum ? b : a), years[1]);
  const yb = (y, k) => bar({ career: 'Карьера', money: 'Деньги', family: 'Семья', health: 'Здоровье' }[k], y.sc[k], 5, { career: 'a', money: 'g', family: 'p', health: 'b' }[k]).replace('</em></div>', '</em><u class="' + (y.agree[k] >= 3 ? 'on' : '') + '">' + y.agree[k] + '/3</u></div>');
  const yearCard = y => '<div class="km-yr"><span class="km-yr__dot"></span><div class="km-yr__y"><b>' + y.y + '</b><small>исполнится ' + y.age + '</small></div><div class="km-yr__t"><h3>' + YTITLE[y.pr.house - 1] + '</h3><ul>' + (y.top.map(o => '<li>' + trNice(o) + ' (' + span(o) + ')</li>').join('') || '<li>ровный год без крупных транзитов</li>') + '</ul><p class="km-use"><b>Рекомендация:</b> ' + YREC[y.pr.house - 1] + '.</p></div><div class="km-yr__b">' + ['career', 'money', 'family', 'health'].map(k => yb(y, k)).join('') + '</div></div>';
  const yearBody = () => { const by = {}; tr.forEach(o => { const k = o.peak.getFullYear() * 12 + o.peak.getMonth(); (by[k] = by[k] || []).push(o); }); return '<div class="km-months">' + Object.keys(by).sort((a, b) => a - b).map(k => '<div class="km-c"><h3>' + MON1[k % 12] + ' ' + Math.floor(k / 12) + '</h3><ul>' + by[k].map(o => { const gd = o.tone === 'soft' || (o.ang === 0 && o.p === 'jupiter'); return '<li><b>' + trNice(o) + '</b> · ' + span(o) + '<br>' + (gd ? 'Мягко' : 'Напряжённо') + ' включает ' + TR_P[o.p] + ' в теме ' + TR_N[o.n] + '. ' + TR_A[o.p][gd ? 0 : 1] + '</li>'; }).join('') + '</ul></div>').join('') + '</div>'; };
  let s7 = '<h3 class="km-h3">Прогноз на 12 месяцев</h3><p class="km-muted">' + tr.length + ' периодов влияния медленных планет. Это темы и настроение периодов, а не события.</p>' + lockWrap('year', 'Прогноз по месяцам на год вперёд', yearBody())
    + '<div class="km-banner km-banner--peak" style="background-image:url(img/karta/valley.webp)"><h3>Пик маршрута: ' + peak.y + '</h3><p>' + YEAR[peak.pr.house - 1] + ' Сумма оценок по четырём сферам — самая высокая на 12 лет. Всё, что заложено до этого, даст максимальный результат.</p></div>'
    + lockWrap('route', 'Маршрут на 12 лет по годам', '<div class="km-route">' + years.map(yearCard).join('') + '</div>');
  h += S('route', '07', 'Маршрут', 'Год за годом', 'Каждый год оценён тремя независимыми системами: транзиты, годовые профекции и периоды джйотиша. Рядом с оценкой — сколько систем с ней согласны (например, 2/3).', s7, true);

  // 08 УСТАВ
  const RL = KT('KT_RULES') || [], rules = RL.map(r => ({ r, m: matches(r.when, T) - (String(r.when).includes('always') ? 0.5 : 0) })).filter(x => x.m > 0).sort((a, b) => b.m - a.m).slice(0, 10).map(x => x.r);
  const s8 = '<div class="km-charter"><div class="km-g3">' + rules.map((r, i) => '<div class="km-c km-rule2"><b class="km-num">' + String(i + 1).padStart(2, '0') + '</b><div><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></div></div>').join('') + '</div></div>';
  h += S('charter', '08', 'Рекомендации', 'Ваш устав: 10 правил', 'Выжимка всей карты: что делать, чтобы пройти маршрут с лучшим результатом.', lockWrap('full', 'Ваши 10 правил', s8), false);

  // ПРЕДЛОЖЕНИЕ + футер
  h += '<section class="km-s" id="km-offer"><div class="km-w"><span class="km-eb">Открыть полностью</span><h2 class="km-h">Полная карта и прогноз</h2><p class="km-lead">Расчёт по эфемеридам на момент вашего рождения. Карта сохраняется у вас и не требует повторной оплаты.</p><div class="km-g3">'
    + ['year', 'full', 'all'].map(k => '<div class="km-c km-price' + (k === 'all' ? ' km-price--best' : '') + '"><small>' + (k === 'all' ? 'Выгоднее' : 'Разово') + '</small><h3>' + PRICE[k][0] + '</h3><p>' + PRICE[k][2] + '</p><b>' + PRICE[k][1].toLocaleString('ru') + ' ₽</b><button class="btn ' + (k === 'all' ? 'btn--gold' : 'ghost') + '" type="button" data-buy="' + k + '">' + (has(k) ? 'Открыто' : 'Открыть') + '</button></div>').join('')
    + '</div><div class="km-c km-rect"><div><small>Отдельная услуга</small><h3>Уточнение времени рождения · автоматически</h3><p>Если точное время неизвестно или есть сомнения. Введите 5–10 важных событий жизни с датами — сайт переберёт время с шагом 2 минуты и покажет 3 самых вероятных варианта. От времени зависят Асцендент, дома, города и сроки.</p></div><button class="ghost" type="button" id="kRectOpen">Уточнить время</button></div></div></section>';
  h += '<footer class="km-foot"><div class="km-w"><p>Составлено ' + fdate(now) + ' · ' + dd + '.' + mmm + '.' + yy + ', ' + (ch.known ? ch.inp.time : 'время неизвестно') + ', ' + esc(ch.inp.place.split(',')[0]) + '.</p><p>Астрология — инструмент для размышлений, а не гарантия. Не является медицинской, психологической, финансовой или юридической консультацией. <a href="#d-map">Как относиться к карте</a> · <a href="#dokumenty">Условия</a>. Фото: Unsplash.</p></div></footer>';

  const R = $k('kResult'); R.className = 'km km--' + g; R.innerHTML = h; R.hidden = false; $k('kFormWrap').hidden = true;
  requestAnimationFrame(() => { const w = $k('kWheel'); if (w) drawWheel(w, ch); const wd = $k('kWorld'); if (wd) worldDraw(wd, ch, picks.map(p => p.x)); });
  $k('kEdit').onclick = () => { $k('kFormWrap').hidden = false; R.hidden = true; scrollTo(0, 0); };
  R.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => buy(b.dataset.buy));
  const ro = $k('kRectOpen'); if (ro) ro.onclick = () => { $k('kFormWrap').hidden = false; R.hidden = true; scrollTo(0, 0); $k('kRect').hidden = true; $k('kRectT').click(); };
  R.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { const el = $k('km-' + b.dataset.go); if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 120, behavior: 'smooth' }); });
  window.KARTA_LAST = ch; window.KARTA_PICKS = picks.map(p => p.x);
}

function buy(kind) {
  const m = $k('kPay'); const p = PRICE[kind];
  $k('kPayT').textContent = kind === 'rect' ? 'Ректификация' : p[0] + ' · ' + p[1].toLocaleString('ru') + ' ₽';
  $k('kPayText').textContent = kind === 'rect' ? 'Приём заявок на ректификацию откроется вместе с оплатой. Сейчас сайт в тестовом режиме.' : 'Оплата подключается к запуску. Сейчас сайт в тестовом режиме: можно открыть полную версию, чтобы посмотреть, как она выглядит.';
  $k('kPayDemo').hidden = kind === 'rect'; $k('kPayOkL').hidden = kind === 'rect'; $k('kPayOk').checked = false; $k('kPayDemo').disabled = true; $k('kPayOk').onchange = () => $k('kPayDemo').disabled = !$k('kPayOk').checked; m.hidden = false;
  $k('kPayDemo').onclick = () => { st.set('karta_pay_consent', JSON.stringify({ kind, v: '2026-10-14', at: new Date().toISOString() })); const u = (st.get('karta_unlock') || '') + ',' + kind; st.set('karta_unlock', u); m.hidden = true; if (window.KARTA_LAST) render(window.KARTA_LAST); setTimeout(() => { const el = $k('kOffer'); }, 0); };
  $k('kPayClose').onclick = () => m.hidden = true;
}

// ---------- форма ----------
function initForm() {
  const list = $k('kCities'), cities = window.KARTA_CITIES;
  list.innerHTML = cities.map(c => '<option value="' + c[0] + ', ' + c[1] + '"></option>').join('');
  $k('kNoTime').onchange = () => { $k('kTime').disabled = $k('kNoTime').checked; };
  $k('kManualT').onclick = () => { $k('kManual').hidden = !$k('kManual').hidden; };
  // --- автоматическое уточнение времени ---
  const ETY = [['marriage', 'Свадьба'], ['divorce', 'Развод / расставание'], ['child', 'Рождение ребёнка'], ['career', 'Новая работа / повышение / своё дело'], ['jobloss', 'Увольнение / закрытие дела'], ['move', 'Переезд'], ['loss', 'Утрата близкого'], ['health', 'Операция / травма / болезнь'], ['love', 'Начало важных отношений'], ['money', 'Крупная покупка / сделка / потеря денег']];
  const addEv = () => { const d = document.createElement('div'); d.className = 'krt__ev'; d.innerHTML = '<input type="date" min="1900-01-01" aria-label="Дата события"><select aria-label="Тип события">' + ETY.map(([v, t]) => '<option value="' + v + '">' + t + '</option>').join('') + '</select><button type="button" aria-label="Удалить">×</button>'; d.querySelector('button').onclick = () => d.remove(); $k('kRectEvs').appendChild(d); };
  $k('kRectT').onclick = () => { const p = $k('kRect'); p.hidden = !p.hidden; if (!p.hidden && !$k('kRectEvs').children.length) for (let i = 0; i < 5; i++) addEv(); };
  $k('kRectAdd').onclick = addEv;
  $k('kRectGo').onclick = () => {
    const er = $k('kRectErr'), out = $k('kRectRes'); er.textContent = ''; out.innerHTML = '';
    const date = $k('kDate').value, place = $k('kPlace').value.trim(); if (!date) return er.textContent = 'Сначала укажите дату рождения.';
    let lat, lon, tz; if (!$k('kManual').hidden && $k('kLat').value) { lat = +$k('kLat').value; lon = +$k('kLon').value; tz = $k('kTz').value; } else { const c = cities.find(c => (c[0] + ', ' + c[1]).toLowerCase() === place.toLowerCase()) || cities.find(c => c[0].toLowerCase() === place.toLowerCase().split(',')[0].trim()); if (!c) return er.textContent = 'Сначала выберите город рождения.'; [lat, lon, tz] = [c[2], c[3], c[4]]; }
    const evs = [...$k('kRectEvs').children].map(r => ({ date: r.querySelector('input').value, type: r.querySelector('select').value })).filter(e => e.date && e.date > date);
    if (evs.length < 4) return er.textContent = 'Нужно минимум 4 события с точными датами (после даты рождения). Лучше 6–10.';
    const w = $k('kRectWin').value; let from, to;
    if (w === 'around') { const t = $k('kTime').value; if (!t) return er.textContent = 'Укажите примерное время в поле «Время рождения».'; const [h, m] = t.split(':').map(Number); from = Math.max(0, h * 60 + m - 120); to = Math.min(1439, h * 60 + m + 120); }
    else if (w === 'night') { from = 0; to = 1439; } else [from, to] = w.split('-').map(Number);
    $k('kRectGo').disabled = true; $k('kRectGo').textContent = 'Считаем…';
    setTimeout(() => { try {
      let r = K.rectify({ date, tz, lat, lon }, evs, from, to, 2);
      if (w === 'night') { const n = K.rectify({ date, tz, lat, lon }, evs, 0, 300, 2), e2 = K.rectify({ date, tz, lat, lon }, evs, 1380, 1439, 2); r = n.top[0] && (!e2.top[0] || n.top[0].smooth >= e2.top[0].smooth) ? Object.assign(n, { top: n.top.concat(e2.top).sort((a, b) => b.smooth - a.smooth).slice(0, 3) }) : Object.assign(e2, { top: e2.top.concat(n.top).sort((a, b) => b.smooth - a.smooth).slice(0, 3) }); }
      const lvl = r.conf > 0.6 ? 'высокая' : r.conf > 0.35 ? 'средняя' : 'низкая', best = r.top[0].smooth || 1;
      out.innerHTML = '<div class="krt__res"><p class="krt__note">Надёжность результата: <b>' + lvl + '</b>. ' + (r.conf > 0.6 ? 'Первый вариант заметно сильнее остальных.' : 'Варианты близки — выберите тот, чей Асцендент больше похож на вас, или добавьте события.') + '</p>'
        + r.top.map(c => { const s = K.signOf(c.asc); return '<div class="krt__c"><b>' + c.time + '</b><span>Асцендент ' + K.SIGNS[s] + ': люди видят в вас ' + SIGN[s].look + '.</span><button class="btn btn--astro btn--sm" type="button" data-t="' + c.time + '">Выбрать</button><i><u style="width:' + Math.round(c.smooth / best * 100) + '%"></u></i></div>'; }).join('')
        + '<p class="krt__note">Это расчёт по классическим техникам (транзиты и солнечные дуги к углам карты), а не точное знание. Если результат не откликается — добавьте 3–5 событий с точными датами и пересчитайте.</p></div>';
      out.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { $k('kTime').value = b.dataset.t; $k('kNoTime').checked = false; $k('kTime').disabled = false; st.set('karta_rect', JSON.stringify({ t: b.dataset.t, conf: r.conf, n: evs.length, at: Date.now() })); $k('kRect').hidden = true; $k('kTime').scrollIntoView({ block: 'center' }); });
    } catch (x) { er.textContent = 'Не получилось рассчитать: ' + x.message; } $k('kRectGo').disabled = false; $k('kRectGo').textContent = 'Уточнить время'; }, 50);
  };
  const tzs = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [...new Set(cities.map(c => c[4]))]);
  $k('kTz').innerHTML = tzs.map(z => '<option>' + z + '</option>').join(''); $k('kTz').value = 'Europe/Moscow';
  const saved = st.get('karta_input'); if (st.get('karta_consent')) $k('kOk').checked = true; if (saved) { try { const v = JSON.parse(saved); $k('kName').value = v.name || ''; $k('kDate').value = v.date; $k('kTime').value = v.time || ''; $k('kNoTime').checked = !v.time; $k('kTime').disabled = !v.time; $k('kPlace').value = v.place; const gr = document.querySelector('input[name=kGender][value=' + (v.gender || 'f') + ']'); if (gr) gr.checked = true; } catch (e) {} }
  $k('kForm').onsubmit = e => {
    e.preventDefault(); const err = $k('kErr'); err.textContent = '';
    const date = $k('kDate').value, time = $k('kNoTime').checked ? '' : $k('kTime').value, place = $k('kPlace').value.trim();
    if (!date) return err.textContent = 'Укажите дату рождения.';
    if (!$k('kNoTime').checked && !time) return err.textContent = 'Укажите время или отметьте «Не знаю точного времени».';
    if (!$k('kOk').checked) return err.textContent = 'Подтвердите, что понимаете, как относиться к карте.';
    let lat, lon, tz;
    if (!$k('kManual').hidden && $k('kLat').value && $k('kLon').value) { lat = +$k('kLat').value; lon = +$k('kLon').value; tz = $k('kTz').value; }
    else { const c = cities.find(c => (c[0] + ', ' + c[1]).toLowerCase() === place.toLowerCase()) || cities.find(c => c[0].toLowerCase() === place.toLowerCase().split(',')[0].trim());
      if (!c) return err.textContent = 'Город не найден. Выберите из списка или введите координаты вручную.'; [lat, lon, tz] = [c[2], c[3], c[4]]; }
    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return err.textContent = 'Проверьте координаты.';
    const gEl = document.querySelector('input[name=kGender]:checked'); if (!gEl) return err.textContent = 'Выберите оформление карты: женское или мужское.';
    const acct = (() => { try { return JSON.parse(st.get('acct')); } catch (e) { return null; } })(), prev = (() => { try { return JSON.parse(st.get('karta_input')); } catch (e) { return null; } })();
    if (acct && prev && !(window.OWNER && window.OWNER()) && (prev.date !== date || (prev.time || '') !== time || prev.place !== (place || prev.place))) {
      const edits = +(st.get('karta_edits') || 0), fresh = acct && Date.now() - (+st.get('karta_t0') || Date.now()) < 7 * 864e5;
      if (st.get('karta_extra') === '1') st.set('karta_extra', '0');
      else if (edits < 1 && fresh) st.set('karta_edits', edits + 1);
      else return err.innerHTML = 'Бесплатная карта уже построена для ' + (prev.name || 'вас') + ' (' + prev.date.split('-').reverse().join('.') + '). Исправить данные можно один раз в первые 7 дней. Карта для близкого человека — <a href="#kabinet" style="color:#dcbd86">в кабинете</a>.';
    }
    if (!st.get('karta_t0')) st.set('karta_t0', Date.now());
    const inp = { gender: gEl.value, name: $k('kName').value.trim(), date, time, place: place || (lat.toFixed(2) + ', ' + lon.toFixed(2)), lat, lon, tz };
    st.set('karta_input', JSON.stringify(inp)); st.set('karta_consent', JSON.stringify({ v: '2026-10-14', at: new Date().toISOString() }));
    const btn = $k('kGo'); btn.disabled = true; btn.textContent = 'Считаем положение планет…';
    setTimeout(() => { try { render(K.computeChart(inp)); scrollTo(0, 0); } catch (x) { err.textContent = 'Не получилось рассчитать: ' + x.message; } btn.disabled = false; btn.textContent = 'Построить карту'; }, 60);
  };
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (window.KARTA_LAST && !$k('kResult').hidden) { const w = $k('kWheel'); if (w) drawWheel(w, window.KARTA_LAST); const wd = $k('kWorld'); if (wd) worldDraw(wd, window.KARTA_LAST, window.KARTA_PICKS || []); } }, 200); });
  if (saved && st.get('karta_auto') !== '0') { try { render(K.computeChart(JSON.parse(saved))); } catch (e) {} }
}
window.KARTA_UI = { initForm, render, drawWheel };
})();
