// Карта жизни: расчёт. Эфемериды — astronomy-engine (MIT). Дома — Плацидус (выше 66° широты — равнодомная система).
(function (G) {
const A = () => G.Astronomy;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const norm = x => ((x % 360) + 360) % 360;
const sind = x => Math.sin(x * D2R), cosd = x => Math.cos(x * D2R), tand = x => Math.tan(x * D2R);
const atan2d = (y, x) => Math.atan2(y, x) * R2D, asind = x => Math.asin(Math.max(-1, Math.min(1, x))) * R2D;

const PLANETS = [
  ['sun', 'Солнце', '☉'], ['moon', 'Луна', '☽'], ['mercury', 'Меркурий', '☿'], ['venus', 'Венера', '♀'], ['mars', 'Марс', '♂'],
  ['jupiter', 'Юпитер', '♃'], ['saturn', 'Сатурн', '♄'], ['uranus', 'Уран', '♅'], ['neptune', 'Нептун', '♆'], ['pluto', 'Плутон', '♇'], ['node', 'Сев. узел', '☊']
];
const BODY = { mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto' };
const SIGNS = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'];
const SIGNS_IN = ['Овне', 'Тельце', 'Близнецах', 'Раке', 'Льве', 'Деве', 'Весах', 'Скорпионе', 'Стрельце', 'Козероге', 'Водолее', 'Рыбах'];
const GLYPH = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(g => g + '︎');
const ELEM = ['fire', 'earth', 'air', 'water'], CROSS = ['card', 'fix', 'mut'];
const RULER = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'pluto', 'jupiter', 'saturn', 'uranus', 'neptune'];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const ASPECTS = [[0, 'соединение', '☌', 'mix'], [60, 'секстиль', '⚹', 'soft'], [90, 'квадрат', '□', 'hard'], [120, 'трин', '△', 'soft'], [180, 'оппозиция', '☍', 'hard']];

// Local civil time in an IANA zone → UTC. Browsers carry the full tz history (USSR декретное время, летнее время и т.д.).
function tzOffsetMin(tz, utcMs) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const p = {}; f.formatToParts(new Date(utcMs)).forEach(x => p[x.type] = +x.value);
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second) - utcMs) / 60000;
}
function localToUtc(y, mo, d, h, mi, tz) {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let u = guess - tzOffsetMin(tz, guess) * 60000;
  u = guess - tzOffsetMin(tz, u) * 60000;
  return { utc: new Date(u), offset: tzOffsetMin(tz, u) };
}

function lonOf(key, t) {
  const X = A();
  if (key === 'sun') return X.SunPosition(t).elon;
  if (key === 'moon') return X.EclipticGeoMoon(t).lon;
  if (key === 'node') { const T = t.tt / 36525; return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T); }
  return X.Ecliptic(X.GeoVector(X.Body[BODY[key]], t, true)).elon;
}
function obliquity(t) { const T = t.tt / 36525; return 23.4392911 - 0.0130042 * T - 1.64e-7 * T * T + 5.036e-7 * T * T * T; }

function angles(t, lat, lon) {
  const X = A(), e = obliquity(t), ramc = norm(X.SiderealTime(t) * 15 + lon);
  const mc = norm(atan2d(sind(ramc), cosd(ramc) * cosd(e)));
  let asc = norm(atan2d(cosd(ramc), -(sind(ramc) * cosd(e) + tand(lat) * sind(e))));
  return { ramc, e, mc, asc };
}
const raToLon = (ra, e) => norm(atan2d(sind(ra), cosd(ra) * cosd(e)));
function placidus(ramc, e, lat, asc, mc) {
  if (Math.abs(lat) > 66) return null;
  const cusp = (frac, below) => { // frac of the semi-arc measured from MC (above) or IC (below)
    let lam = norm(mc + (below ? 180 : 0) + (below ? -1 : 1) * frac * 90);
    for (let i = 0; i < 30; i++) {
      const dec = asind(sind(e) * sind(lam)), x = tand(lat) * tand(dec);
      if (Math.abs(x) >= 1) return null;
      const ad = asind(x);
      const ra = below ? ramc + 180 - frac * (90 - ad) : ramc + frac * (90 + ad);
      const nl = raToLon(norm(ra), e);
      if (Math.abs(((nl - lam + 540) % 360) - 180) < 1e-7) { lam = nl; break; }
      lam = nl;
    }
    return lam;
  };
  const c11 = cusp(1 / 3, false), c12 = cusp(2 / 3, false), c3 = cusp(1 / 3, true), c2 = cusp(2 / 3, true);
  if ([c11, c12, c2, c3].some(v => v == null || isNaN(v))) return null;
  const h = [asc, c2, c3, norm(mc + 180), 0, 0, norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12];
  h[4] = norm(c11 + 180); h[5] = norm(c12 + 180);
  return h;
}
const equalHouses = asc => Array.from({ length: 12 }, (_, i) => norm(asc + i * 30));
function houseOf(lon, cusps) {
  for (let i = 0; i < 12; i++) { const a = cusps[i], b = cusps[(i + 1) % 12], span = norm(b - a), d = norm(lon - a); if (d < span) return i + 1; }
  return 1;
}
const signOf = lon => Math.floor(norm(lon) / 30);
const fmtDeg = lon => { const d = norm(lon) % 30, g = Math.floor(d), m = Math.floor((d - g) * 60); return g + '°' + String(m).padStart(2, '0') + '′'; };

function aspectBetween(a, b, orbBase) {
  const d = Math.abs(((a - b + 540) % 360) - 180), sep = 180 - d; // angular separation 0..180
  for (const [ang, name, g, tone] of ASPECTS) { const orb = Math.abs(sep - ang); if (orb <= orbBase) return { ang, name, g, tone, orb }; }
  return null;
}

function computeChart(inp) {
  const X = A(); const [y, mo, d] = inp.date.split('-').map(Number);
  const known = !!inp.time; const [hh, mm] = known ? inp.time.split(':').map(Number) : [12, 0];
  const { utc, offset } = localToUtc(y, mo, d, hh, mm, inp.tz);
  const t = X.MakeTime(utc);
  const pos = {};
  PLANETS.forEach(([k]) => { const l = lonOf(k, t), l2 = lonOf(k, t.AddDays(1)); pos[k] = { lon: l, retro: k !== 'node' && k !== 'sun' && k !== 'moon' && (((l2 - l + 540) % 360) - 180) < 0 }; });
  let ang = null, cusps = null, system = null;
  if (known) {
    ang = angles(t, inp.lat, inp.lon);
    cusps = placidus(ang.ramc, ang.e, inp.lat, ang.asc, ang.mc); system = 'Плацидус';
    if (!cusps) { cusps = equalHouses(ang.asc); system = 'равнодомная'; }
    PLANETS.forEach(([k]) => pos[k].house = houseOf(pos[k].lon, cusps));
  }
  const pts = PLANETS.map(([k]) => [k, pos[k].lon]); if (ang) pts.push(['asc', ang.asc], ['mc', ang.mc]);
  const aspects = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const [ka, la] = pts[i], [kb, lb] = pts[j]; if (ka === 'node' || kb === 'node' || (ka === 'asc' && kb === 'mc')) continue;
    const lum = /sun|moon/.test(ka + kb); const a = aspectBetween(la, lb, (lum ? 8 : 6) - (/asc|mc/.test(ka + kb) ? 2 : 0));
    if (a) aspects.push({ a: ka, b: kb, ...a });
  }
  aspects.sort((p, q) => p.orb - q.orb);
  const el = { fire: 0, earth: 0, air: 0, water: 0 }, cr = { card: 0, fix: 0, mut: 0 };
  PLANETS.slice(0, 10).forEach(([k]) => { const s = signOf(pos[k].lon); el[ELEM[s % 4]]++; cr[CROSS[s % 3]]++; });
  if (ang) [ang.asc, ang.mc].forEach(l => { const s = signOf(l); el[ELEM[s % 4]]++; cr[CROSS[s % 3]]++; });
  return { inp, known, utc, offset, t, pos, ang, cusps, system, aspects, el, cr };
}

// Transits for the next 12 months: slow planets to key natal points, exact passes found by daily scan.
function transitsYear(ch, from) {
  const X = A(), slow = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const targets = ['sun', 'moon', 'mercury', 'venus', 'mars'].concat(ch.ang ? ['asc', 'mc'] : []);
  const natal = k => k === 'asc' ? ch.ang.asc : k === 'mc' ? ch.ang.mc : ch.pos[k].lon;
  const start = X.MakeTime(from), out = [], open = {};
  for (let day = 0; day <= 366; day += 2) {
    const t = start.AddDays(day);
    slow.forEach(p => { const l = lonOf(p, t); targets.forEach(n => ASPECTS.forEach(([ang, name, g, tone]) => {
      const sep = 180 - Math.abs(((l - natal(n) + 540) % 360) - 180), orb = Math.abs(sep - ang), key = p + n + ang, lim = p === 'jupiter' || p === 'saturn' ? 1.5 : 1.2;
      if (orb <= lim) { const o = open[key]; if (!o) open[key] = { p, n, ang, name, g, tone, start: day, end: day, best: orb, bestDay: day }; else { o.end = day; if (orb < o.best) { o.best = orb; o.bestDay = day; } } }
      else if (open[key]) { out.push(open[key]); delete open[key]; }
    })); });
  }
  Object.values(open).forEach(o => out.push(o));
  out.forEach(o => { o.from = new Date(+from + o.start * 864e5); o.to = new Date(+from + o.end * 864e5); o.peak = new Date(+from + o.bestDay * 864e5); });
  return out.sort((a, b) => a.peak - b.peak);
}

// Astrocartography: longitudes where a planet culminates (MC line) or anti-culminates (IC) at the birth moment.
function mcLines(ch) {
  const X = A(), gast = X.SiderealTime(ch.t) * 15, e = obliquity(ch.t);
  const ra = lon => norm(atan2d(sind(lon) * cosd(e), cosd(lon)));
  const lines = {};
  ['sun', 'venus', 'jupiter', 'moon', 'mars', 'saturn'].forEach(k => { let l = norm(ra(ch.pos[k].lon) - gast); if (l > 180) l -= 360; lines[k] = l; });
  return lines;
}

function profection(ch, when) {
  const b = new Date(ch.inp.date + 'T00:00:00'); let age = when.getFullYear() - b.getFullYear();
  if (when.getMonth() < b.getMonth() || (when.getMonth() === b.getMonth() && when.getDate() < b.getDate())) age--;
  const house = (age % 12) + 1, sign = ch.ang ? (signOf(ch.ang.asc) + house - 1) % 12 : null;
  const next = new Date(b); next.setFullYear(b.getFullYear() + age + 1);
  return { age, house, sign, ruler: sign == null ? null : RULER[sign], next };
}

G.KARTA = { PLANETS, SIGNS, SIGNS_IN, GLYPH, ELEM, CROSS, RULER, ROMAN, ASPECTS, computeChart, transitsYear, mcLines, profection, signOf, fmtDeg, norm, localToUtc };
})(typeof window !== 'undefined' ? window : globalThis);
