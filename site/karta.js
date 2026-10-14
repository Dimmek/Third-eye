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
const PRICE = { year: ['Прогноз на год', 990, 'По месяцам: какие периоды открывают возможности, а где нужна осторожность.'], full: ['Полная карта жизни', 1990, 'Призвание, деньги, отношения, самочувствие, где жить, маршрут на 12 лет, план практик.'], all: ['Всё вместе', 2490, 'Полная карта и прогноз на год. Выгода 490 ₽.'] };
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
const lockBox = (kind, title, teaser) => '<div class="klock" data-kind="' + kind + '"><div class="klock__fog"><p>' + teaser + '</p><i></i><i></i><i style="width:62%"></i></div><div class="klock__cta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg><b>' + title + '</b><button class="btn btn--gold btn--sm" type="button" data-buy="' + kind + '">Открыть · ' + PRICE[kind][1].toLocaleString('ru') + ' ₽</button></div></div>';
const sec = (n, eyebrow, title, intro, body) => '<section class="ksec"><div class="ksec__head"><span class="eyebrow">' + n + ' · ' + eyebrow + '</span><h2>' + title + '</h2>' + (intro ? '<p class="ksec__intro">' + intro + '</p>' : '') + '</div>' + body + '</section>';
const has = k => { const u = st.get('karta_unlock') || ''; return u.includes('all') || u.includes(k); };

function render(ch) {
  const now = new Date(), tr = K.transitsYear(ch, now), prof = K.profection(ch, now), rec = recommend(ch, tr, prof);
  const sun = K.signOf(ch.pos.sun.lon), moon = K.signOf(ch.pos.moon.lon), asc = ch.ang ? K.signOf(ch.ang.asc) : null, nm = ch.inp.name ? esc(ch.inp.name) : '';
  const off = ch.offset / 60, offs = 'UTC' + (off >= 0 ? '+' : '') + off;
  const [yy, mm, dd] = ch.inp.date.split('-');
  let h = '';
  h += '<div class="khead"><div class="khead__txt"><span class="eyebrow">Ваша карта' + (nm ? ' · ' + nm : '') + '</span><h1 class="display">' + K.SIGNS[sun] + ', ' + K.SIGNS[moon] + (asc != null ? ', ' + K.SIGNS[asc] : '') + '</h1>'
    + '<p class="khead__meta">' + dd + '.' + mm + '.' + yy + ' · ' + (ch.known ? ch.inp.time + ' (' + offs + ')' : 'время неизвестно') + ' · ' + esc(ch.inp.place) + '</p>'
    + '<div class="kbig"><div><small>Солнце · суть</small><b>' + K.GLYPH[sun] + ' ' + K.SIGNS[sun] + '</b><span>' + K.fmtDeg(ch.pos.sun.lon) + (ch.known ? ' · ' + K.ROMAN[ch.pos.sun.house - 1] + ' дом' : '') + '</span></div>'
    + '<div><small>Луна · душа</small><b>' + K.GLYPH[moon] + ' ' + K.SIGNS[moon] + '</b><span>' + K.fmtDeg(ch.pos.moon.lon) + (ch.known ? ' · ' + K.ROMAN[ch.pos.moon.house - 1] + ' дом' : '') + '</span></div>'
    + '<div><small>Асцендент · образ</small><b>' + (asc != null ? K.GLYPH[asc] + ' ' + K.SIGNS[asc] : '—') + '</b><span>' + (asc != null ? K.fmtDeg(ch.ang.asc) : 'нужно время рождения') + '</span></div></div>'
    + '<div class="kact"><button class="ghost" type="button" id="kEdit">Изменить данные</button><a class="ghost" href="#kOffer">Полная карта и прогноз</a></div></div>'
    + '<div class="kwheel"><canvas id="kWheel" aria-label="Круг натальной карты"></canvas></div></div>';
  h += '<div class="kread"><div class="kread__in"><h3>Как читать<br>эту карту</h3><ul><li><b>Положения планет</b> рассчитаны точно, по астрономическим эфемеридам. <b>Толкования</b> — традиция и язык для размышления, а не доказанный закон.</li><li>Карта описывает <b>темы и периоды, а не события</b>. Что произойдёт, зависит от ваших решений, других людей и обстоятельств.</li><li>Читайте каждый раздел как вопрос к себе: «Где это про меня? Где нет?» Не принимайте важных решений только по карте.</li><li>Подробно: <a href="#d-map">как относиться к карте</a> · <a href="#j-astro-science">астрология и наука</a> · <a href="#j-fate">карта — не приговор</a></li></ul></div></div>';
  if (!ch.known) h += '<div class="kwarn"><b>Время рождения неизвестно.</b> Карта построена на 12:00: положения планет верны, а дома, Асцендент и MC не рассчитываются. Луна может отличаться на ±6°. Точное время можно восстановить ректификацией — см. ниже.</div>';

  // 00 сейчас
  const active = tr.filter(o => o.from <= now && o.to >= now), soon = tr.filter(o => o.from > now && o.from - now < 90 * 864e5);
  const trLine = o => { const tone = o.tone === 'soft' || (o.tone === 'mix' && o.p === 'jupiter'); return '<li><b>' + PNAME[o.p] + ' ' + o.name + ' ' + (o.n === 'asc' ? 'Асцендент' : o.n === 'mc' ? 'MC' : PNAME[o.n]) + '</b> <span class="kdate">' + fdate(o.from) + ' — ' + fdate(o.to) + '</span><br>' + (tone ? 'Мягко' : 'Напряжённо') + ' включает ' + TR_P[o.p] + ' в теме ' + TR_N[o.n] + '. ' + TR_A[o.p][tone ? 0 : 1] + '</li>'; };
  h += sec('00', 'Сейчас', 'Где вы сейчас на маршруте', null,
    '<div class="kgrid2"><div class="kcard"><small>Тема года · до ' + fdate(prof.next) + '</small><h3>' + K.ROMAN[prof.house - 1] + ' дом' + (prof.sign != null ? ' · ' + K.SIGNS[prof.sign] : '') + '</h3><p>' + YEAR[prof.house - 1] + (prof.ruler ? ' Хозяин года — <b>' + PNAME[prof.ruler] + '</b>: следите за его темой «' + PTHEME[prof.ruler] + '».' : '') + '</p></div>'
    + '<div class="kcard"><small>Влияния планет сейчас</small><h3>' + (active.length ? active.length + ' активн' + (active.length === 1 ? 'ое' : 'ых') : 'Спокойный период') + '</h3><ul class="ktr">' + (active.length ? active.slice(0, 3).map(trLine).join('') : '<li>Крупных транзитов к личным точкам нет: хорошее время для ровной работы и практик.</li>') + '</ul></div></div>'
    + (soon.length ? '<div class="kcard"><small>Ближайшие 3 месяца</small><ul class="ktr">' + soon.slice(0, 3).map(trLine).join('') + '</ul></div>' : ''));

  // 01 профиль
  const elK = Object.keys(ch.el).sort((a, b) => ch.el[b] - ch.el[a]), crK = Object.keys(ch.cr).sort((a, b) => ch.cr[b] - ch.cr[a]);
  const big = (lbl, s, f) => '<div class="kcard"><small>' + lbl + '</small><h3>' + K.GLYPH[s] + ' ' + K.SIGNS[s] + '</h3><p>' + f(SIGN[s]) + '</p></div>';
  let prof1 = '<div class="kgrid3">' + big('Солнце · суть', sun, x => 'Ваша сердцевина — ' + x.core + '. Ваш дар — <b>' + x.gift + '</b>.')
    + big('Луна · душа', moon, x => 'Чтобы было спокойно, вам нужны ' + x.need + '. Зона роста — ' + x.grow + '.')
    + (asc != null ? big('Асцендент · образ', asc, x => 'Люди видят в вас ' + x.look + '. Так вы входите в любое новое дело.') : '<div class="kcard"><small>Асцендент · образ</small><h3>Нужно время</h3><p>Асцендент меняется каждые 2 часа. Без точного времени его не определить.</p></div>') + '</div>';
  prof1 += '<div class="kgrid2"><div class="kcard"><small>Баланс стихий</small><div class="kbars">' + ['fire', 'water', 'air', 'earth'].map(e => '<div><span>' + ELT[e][0] + '</span><i style="--w:' + (ch.el[e] / 12 * 100) + '%"></i><b>' + ch.el[e] + '</b></div>').join('') + '</div><p>Ведущая стихия — <b>' + ELT[elK[0]][0] + '</b>: ' + ELT[elK[0]][1] + '.' + (ch.el[elK[3]] <= 1 ? ' ' + LACK[elK[3]] : '') + '</p></div>'
    + '<div class="kcard"><small>Кресты</small><div class="kbars">' + ['card', 'fix', 'mut'].map(e => '<div><span>' + CRT[e][0] + '</span><i style="--w:' + (ch.cr[e] / 12 * 100) + '%"></i><b>' + ch.cr[e] + '</b></div>').join('') + '</div><p>' + CRT[crK[0]][2] + '</p></div></div>';
  prof1 += '<div class="ktable"><table><thead><tr><th>Планета</th><th>Знак</th><th>Градус</th>' + (ch.known ? '<th>Дом</th>' : '') + '<th>Тема</th></tr></thead><tbody>' + K.PLANETS.map(([k, n, gl]) => '<tr><td><span class="kgl">' + gl + '︎</span> ' + n + (ch.pos[k].retro ? ' <em>R</em>' : '') + '</td><td>' + sname(ch.pos[k].lon) + '</td><td class="num">' + K.fmtDeg(ch.pos[k].lon) + '</td>' + (ch.known ? '<td>' + K.ROMAN[ch.pos[k].house - 1] + ' · ' + HOUSE[ch.pos[k].house - 1] + '</td>' : '') + '<td>' + PTHEME[k] + '</td></tr>').join('')
    + (ch.ang ? '<tr><td><b>AC</b> Асцендент</td><td>' + sname(ch.ang.asc) + '</td><td class="num">' + K.fmtDeg(ch.ang.asc) + '</td><td>—</td><td>образ, тело</td></tr><tr><td><b>MC</b> Середина неба</td><td>' + sname(ch.ang.mc) + '</td><td class="num">' + K.fmtDeg(ch.ang.mc) + '</td><td>—</td><td>призвание, вершина</td></tr>' : '') + '</tbody></table></div>';
  if (ch.aspects.length) prof1 += '<p class="ksmall">Главные аспекты: ' + ch.aspects.slice(0, 6).map(a => PNAME[a.a] + ' ' + a.name + ' ' + PNAME[a.b] + ' (' + a.orb.toFixed(1) + '°)').join(' · ') + '. Дома: ' + (ch.system || '—') + '.</p>';
  h += sec('01', 'Профиль', 'С чем вы пришли', 'Три ключевые точки, баланс стихий и положение планет в момент рождения.', prof1);

  // 02 практики
  const rooms = rec.slice(0, 3).map(r => window.SITE.ROOMS.find(x => x.id === r.id) ? [window.SITE.ROOMS.find(x => x.id === r.id), r.why] : null).filter(Boolean);
  h += sec('02', 'Практики для вас', 'С чего начать', 'Подобраны по вашей карте и текущему периоду. Очищение открыто бесплатно.',
    '<div class="kgrid3">' + rooms.map(([r, why]) => '<a class="kcard krec" href="#room-' + r.id + '"><small>' + (r.id === 'cleanse' ? 'Бесплатно' : 'Пространство') + '</small><h3>' + r.name + '</h3><p>' + (why || r.tag) + '</p><span class="krec__go">Открыть →</span></a>').join('') + '</div>');

  // 03 прогноз на год
  const yearBody = () => { const by = {}; tr.forEach(o => { const k = o.peak.getFullYear() * 12 + o.peak.getMonth(); (by[k] = by[k] || []).push(o); });
    return '<div class="kmonths">' + Object.keys(by).sort((a, b) => a - b).map(k => '<div class="kmonth"><h3>' + MON1[k % 12] + ' ' + Math.floor(k / 12) + '</h3><ul class="ktr">' + by[k].map(trLine).join('') + '</ul></div>').join('') + '</div>'; };
  h += sec('03', 'Прогноз на год', 'Ваши 12 месяцев', tr.length + ' периодов влияния медленных планет на личные точки карты. Это темы и настроение периодов, а не события: результат зависит от ваших действий и обстоятельств.', has('year') ? yearBody() : lockBox('year', 'Прогноз по месяцам на год вперёд', (tr[0] ? MON1[tr[0].peak.getMonth()] + ': ' + PNAME[tr[0].p] + ' ' + tr[0].name + ' ' + (PNAME[tr[0].n] || 'MC') + '…' : 'Месяц за месяцем: возможности и осторожность…')));

  // 04–09 полная карта
  const full = has('full');
  const mcS = ch.ang ? K.signOf(ch.ang.mc) : sun, h2 = ch.cusps ? K.signOf(ch.cusps[1]) : K.signOf(ch.pos.venus.lon), h7 = ch.cusps ? K.signOf(ch.cusps[6]) : null, h6 = ch.cusps ? K.signOf(ch.cusps[5]) : K.signOf(ch.pos.mars.lon), ven = K.signOf(ch.pos.venus.lon);
  const in10 = ch.known ? K.PLANETS.filter(p => ch.pos[p[0]].house === 10).map(p => p[1]) : [];
  h += sec('04', 'Призвание', 'Где вы сильнее всего', null, full ? '<div class="kcard"><small>' + (ch.ang ? 'MC в знаке ' + K.SIGNS[mcS] : 'По Солнцу в знаке ' + K.SIGNS[mcS]) + '</small><p>' + MC[mcS] + '</p>' + (in10.length ? '<p>В доме карьеры: <b>' + in10.join(', ') + '</b> — эти темы будут видны в вашей работе особенно сильно.</p>' : '') + '<p>Ваш природный дар — <b>' + SIGN[sun].gift + '</b>. Выбирайте дело, где он нужен каждый день.</p></div>' : lockBox('full', 'Призвание и лучшие направления', (ch.ang ? 'MC в знаке ' + K.SIGNS[mcS] : 'Солнце в знаке ' + K.SIGNS[mcS]) + ': ' + MC[mcS].split(':')[0] + '…'));
  h += sec('05', 'Деньги', 'Как к вам приходят деньги', null, full ? '<div class="kcard"><small>' + (ch.cusps ? 'II дом в знаке ' + K.SIGNS[h2] : 'Венера в знаке ' + K.SIGNS[h2]) + '</small><p>' + MONEY[h2] + '</p><p>Юпитер в знаке ' + sname(ch.pos.jupiter.lon) + (ch.known ? ', ' + K.ROMAN[ch.pos.jupiter.house - 1] + ' дом (' + HOUSE[ch.pos.jupiter.house - 1] + ')' : '') + ': здесь у вас больше всего удачи и роста.</p></div>' : lockBox('full', 'Деньги: источники, риски, правила', 'Ваш денежный стиль: ' + MONEY[h2].split('.')[0].toLowerCase() + '…'));
  h += sec('06', 'Отношения', 'Как вы любите и кого притягиваете', null, full ? '<div class="kcard"><small>Венера в знаке ' + K.SIGNS[ven] + '</small><p>' + LOVE[ven] + '</p>' + (h7 != null ? '<p>VII дом в знаке ' + K.SIGNS[h7] + ': вас притягивают люди, в которых видно ' + SIGN[h7].look.replace(/человека$/, 'человека') + '. Рядом с ними вы учитесь качеству «' + SIGN[h7].gift + '».</p>' : '') + '</div>' : lockBox('full', 'Отношения и партнёрство', 'Венера в знаке ' + K.SIGNS[ven] + ': ' + LOVE[ven].split(':')[0].toLowerCase() + '…'));
  h += sec('07', 'Самочувствие', 'Где ваш ресурс', 'Не медицинская рекомендация: о самочувствии и режиме, а не о болезнях.', full ? '<div class="kcard"><small>' + (ch.cusps ? 'VI дом в знаке ' + K.SIGNS[h6] : 'Марс в знаке ' + K.SIGNS[h6]) + '</small><p>' + BODY[h6] + '</p><p>Марс в знаке ' + sname(ch.pos.mars.lon) + ': ваша энергия включается через ' + SIGN[K.signOf(ch.pos.mars.lon)].gift + '.</p></div>' : lockBox('full', 'Ресурс, режим и энергия', BODY[h6].split(':')[0] + '…'));
  const lines = K.mcLines(ch), cities = window.KARTA_CITIES || [];
  const near = lon => cities.map(cc => [cc, Math.abs(((cc[3] - lon + 540) % 360) - 180)]).filter(x => x[1] < 4).sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => x[0][0] + ' (' + x[0][1] + ')');
  h += sec('08', 'Где жить', 'Ваши линии на карте мира', 'Астрокартография: долготы, где планета в момент рождения стояла в зените.', full ? '<div class="kgrid3">' + Object.keys(LINES).map(k => { const n = near(lines[k]); return '<div class="kcard"><small>Линия ' + LINES[k][0] + ' · ' + Math.abs(lines[k]).toFixed(1) + '° ' + (lines[k] >= 0 ? 'в.д.' : 'з.д.') + '</small><h3>' + LINES[k][1] + '</h3><p>' + (n.length ? n.join(', ') : 'Крупных городов из нашей базы на линии нет — смотрите долготу.') + '</p></div>'; }).join('') + '</div>' : lockBox('full', 'Города на линиях Юпитера, Венеры и Солнца', 'Линия Юпитера проходит через ' + (near(lines.jupiter).length || 'несколько') + ' городов из нашей базы…'));
  const route = () => { const out = []; for (let i = 0; i < 12; i++) { const d = new Date(now); d.setFullYear(now.getFullYear() + i); const p = K.profection(ch, d); out.push('<li><b>' + (d.getFullYear()) + ' · ' + p.age + ' ' + (p.age % 10 === 1 && p.age % 100 !== 11 ? 'год' : [2, 3, 4].includes(p.age % 10) && ![12, 13, 14].includes(p.age % 100) ? 'года' : 'лет') + '</b> — ' + K.ROMAN[p.house - 1] + ' дом. ' + YEAR[p.house - 1] + '</li>'); } return '<ol class="kroute">' + out.join('') + '</ol>'; };
  h += sec('09', 'Маршрут', 'Ваши следующие 12 лет', 'Годовые темы по профекциям: каждый год жизни ведёт свой дом карты.', full ? route() : lockBox('full', 'Маршрут на 12 лет по годам', (now.getFullYear() + 1) + ': ' + YEAR[(prof.house) % 12].split(':')[0] + '…'));
  const plan = rec.slice(0, 4).map(r => window.SITE.ROOMS.find(x => x.id === r.id)).filter(Boolean);
  h += sec('10', 'План практик', '30 дней под вашу карту', null, full ? '<ol class="kroute">' + plan.map((r, i) => '<li><b>Неделя ' + (i + 1) + ': <a href="#room-' + r.id + '">' + r.name + '</a></b> — ' + (rec[i].why || r.tag) + ' Каждый день, 12–15 минут.</li>').join('') + '</ol>' : lockBox('full', 'Пошаговый план на 4 недели', 'Неделя 1: ' + (plan[0] ? plan[0].name : 'Очищение') + '…'));

  // предложение
  h += '<section class="ksec koffer" id="kOffer"><div class="ksec__head"><span class="eyebrow">Открыть полностью</span><h2>Полная карта и прогноз</h2><p class="ksec__intro">Расчёт по эфемеридам на момент вашего рождения. Карта сохраняется у вас и не требует повторной оплаты.</p></div><div class="kgrid3">'
    + ['year', 'full', 'all'].map(k => '<div class="kcard kprice' + (k === 'all' ? ' kprice--best' : '') + '"><small>' + (k === 'all' ? 'Выгоднее' : 'Разово') + '</small><h3>' + PRICE[k][0] + '</h3><p>' + PRICE[k][2] + '</p><b class="kprice__n">' + PRICE[k][1].toLocaleString('ru') + ' ₽</b><button class="btn ' + (k === 'all' ? 'btn--gold' : 'btn--line') + '" type="button" data-buy="' + k + '">' + (has(k) ? 'Открыто' : 'Открыть') + '</button></div>').join('')
    + '</div><div class="kcard krect"><div><small>Отдельная услуга</small><h3>Ректификация времени рождения · 4 990 ₽</h3><p>Если вы не знаете точного времени или сомневаетесь в нём. Астролог сверяет 5–10 важных событий вашей жизни с картой и находит время с точностью до минут. От него зависят Асцендент, дома и все сроки прогноза.</p></div><button class="btn btn--line" type="button" data-buy="rect">Оставить заявку</button></div>'
    + '<p class="ksmall">Астрология — инструмент самопознания и размышления. Она не предсказывает события с гарантией и не заменяет советы врача, юриста или финансового специалиста.</p></section>';

  $k('kResult').innerHTML = h; $k('kResult').hidden = false; $k('kFormWrap').hidden = true;
  requestAnimationFrame(() => drawWheel($k('kWheel'), ch));
  $k('kEdit').onclick = () => { $k('kFormWrap').hidden = false; $k('kResult').hidden = true; scrollTo(0, 0); };
  $k('kResult').querySelectorAll('[data-buy]').forEach(b => b.onclick = () => buy(b.dataset.buy));
  window.KARTA_LAST = ch;
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
  const tzs = (Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [...new Set(cities.map(c => c[4]))]);
  $k('kTz').innerHTML = tzs.map(z => '<option>' + z + '</option>').join(''); $k('kTz').value = 'Europe/Moscow';
  const saved = st.get('karta_input'); if (st.get('karta_consent')) $k('kOk').checked = true; if (saved) { try { const v = JSON.parse(saved); $k('kName').value = v.name || ''; $k('kDate').value = v.date; $k('kTime').value = v.time || ''; $k('kNoTime').checked = !v.time; $k('kTime').disabled = !v.time; $k('kPlace').value = v.place; } catch (e) {} }
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
    const inp = { name: $k('kName').value.trim(), date, time, place: place || (lat.toFixed(2) + ', ' + lon.toFixed(2)), lat, lon, tz };
    st.set('karta_input', JSON.stringify(inp)); st.set('karta_consent', JSON.stringify({ v: '2026-10-14', at: new Date().toISOString() }));
    const btn = $k('kGo'); btn.disabled = true; btn.textContent = 'Считаем положение планет…';
    setTimeout(() => { try { render(K.computeChart(inp)); scrollTo(0, 0); } catch (x) { err.textContent = 'Не получилось рассчитать: ' + x.message; } btn.disabled = false; btn.textContent = 'Построить карту'; }, 60);
  };
  addEventListener('resize', () => { if (window.KARTA_LAST && !$k('kResult').hidden) drawWheel($k('kWheel'), window.KARTA_LAST); });
  if (saved && st.get('karta_auto') !== '0') { try { render(K.computeChart(JSON.parse(saved))); } catch (e) {} }
}
window.KARTA_UI = { initForm, render, drawWheel };
})();
