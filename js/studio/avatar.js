// Layered SVG avatar renderer.
//
// renderAvatar(avatar, items, opts) -> SVG markup string
//   avatar: { species, hair, top, ..., skin, eyes, hair_color, mode, custom_path }
//   items:  Map<id, catalogue item>  (item.art drives the drawing)
//   opts:   { view: 'full'|'head'|'body'|'legs', customUrl, animate, title }
//
// Every slot is drawn by a "shape" function keyed by item.art.shape, so new
// catalogue items can reuse shapes with new colours without code changes.
// To add a brand new shape, add a function to the matching table below.

const OL = '#3b2f5c';                 // outline colour
const SW = 2.5;                       // outline width
const st = `stroke="${OL}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let seq = 0;

// ---------- colour helpers ----------
function hexToRgb(h) { const n = parseInt(String(h || '#ffffff').slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function mix(a, b, t) { const x = hexToRgb(a), y = hexToRgb(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const shade = (c, t = 0.18) => mix(c, '#3b2f5c', t);
const tint = (c, t = 0.45) => mix(c, '#ffffff', t);

// ---------- small reusable shapes ----------
const heartPath = (x, y, s) => `M${x} ${y + s * 0.9} C${x - s * 1.6} ${y - s * 0.1} ${x - s * 0.8} ${y - s * 1.3} ${x} ${y - s * 0.45} C${x + s * 0.8} ${y - s * 1.3} ${x + s * 1.6} ${y - s * 0.1} ${x} ${y + s * 0.9} Z`;
function starPath(x, y, r, inner = 0.45, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * inner : r;
    d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1);
  }
  return d + 'Z';
}
const sparkle = (x, y, r) => `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z`;
const cloud = (x, y, s, fill = '#ffffff', op = 0.9) =>
  `<g opacity="${op}" fill="${fill}"><ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${9 * s}"/><circle cx="${x - 7 * s}" cy="${y - 5 * s}" r="${8 * s}"/><circle cx="${x + 6 * s}" cy="${y - 7 * s}" r="${10 * s}"/></g>`;

// ---------- geometry of the base body ----------
const HEAD = { cx: 100, cy: 92, r: 44 };
const SHOULDER_L = [80, 136], SHOULDER_R = [120, 136];
const TORSO = 'M78 133 Q100 125 122 133 L126 172 Q100 178 74 172 Z';

// Arm curves per pose: [shoulder, control, hand] for left and right arms.
const POSES = {
  stand: { l: [SHOULDER_L, [70, 156], [71, 174]], r: [SHOULDER_R, [130, 156], [129, 174]] },
  wave:  { l: [SHOULDER_L, [70, 156], [71, 174]], r: [SHOULDER_R, [150, 132], [156, 106]] },
  hold:  { l: [SHOULDER_L, [70, 156], [71, 174]], r: [SHOULDER_R, [138, 150], [146, 134]] },
  cheer: { l: [SHOULDER_L, [50, 132], [44, 104]], r: [SHOULDER_R, [150, 132], [156, 104]] },
  heart: { l: [SHOULDER_L, [80, 160], [95, 150]], r: [SHOULDER_R, [120, 160], [105, 150]] },
  hop:   { l: [SHOULDER_L, [50, 132], [44, 104]], r: [SHOULDER_R, [150, 132], [156, 104]], lift: -10 },
};
const qpt = ([a, c, b], t) => [0, 1].map(i => (1 - t) ** 2 * a[i] + 2 * (1 - t) * t * c[i] + t * t * b[i]);

// ---------- backgrounds ----------
function background(it, id) {
  const a = it?.art || { c1: '#ffe3ef', c2: '#e3dcff', deco: 'clouds' };
  const g = `${id}-bg`;
  let deco = '';
  const light = '#ffffff';
  switch (a.deco) {
    case 'clouds': deco = cloud(40, 44, 1.1) + cloud(160, 70, 0.9) + cloud(150, 200, 0.8, '#ffffff', 0.6); break;
    case 'dots': for (let y = 14; y < 240; y += 26) for (let x = (y / 26) % 2 ? 14 : 27; x < 200; x += 26) deco += `<circle cx="${x}" cy="${y}" r="3.4" fill="${light}" opacity=".7"/>`; break;
    case 'stripes': for (let x = -240; x < 200; x += 28) deco += `<path d="M${x} 240 L${x + 240} 0 L${x + 254} 0 L${x + 14} 240Z" fill="${light}" opacity=".45"/>`; break;
    case 'hearts': [[26, 30, 7], [168, 46, 9], [36, 190, 8], [172, 182, 6], [150, 120, 5], [24, 112, 5]].forEach(([x, y, s]) => deco += `<path d="${heartPath(x, y, s)}" fill="${light}" opacity=".6"/>`); break;
    case 'sakura': [[30, 36], [160, 30], [176, 140], [22, 150], [140, 210], [60, 215], [110, 24]].forEach(([x, y], i) => deco += `<g transform="translate(${x} ${y}) rotate(${i * 47})"><ellipse rx="5" ry="3" fill="#ffffff" opacity=".85"/><ellipse rx="3" ry="1.6" fill="#ffb3c7" opacity=".9"/></g>`); break;
    case 'stars': [[24, 26, 4], [60, 54, 2.5], [170, 34, 5], [140, 70, 2.5], [30, 120, 3], [176, 128, 3.5], [22, 200, 4], [168, 206, 2.5], [100, 18, 3]].forEach(([x, y, r]) => deco += `<path d="${sparkle(x, y, r)}" fill="#fff6c9"/>`); break;
    case 'stage':
      deco = `<path d="M30 0 L70 0 L118 240 L8 240Z" fill="#fff6c9" opacity=".18"/><path d="M130 0 L170 0 L192 240 L82 240Z" fill="#ffd1e0" opacity=".18"/>` +
        `<rect x="0" y="206" width="200" height="34" fill="#1a1236" opacity=".55"/>` +
        [[20, 214], [52, 220], [148, 218], [180, 212], [100, 226]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ffe27a"/>`).join('');
      break;
    case 'galaxy':
      deco = `<circle cx="160" cy="44" r="18" fill="#ff9fc0" opacity=".85"/><ellipse cx="160" cy="44" rx="30" ry="7" fill="none" stroke="#ffe27a" stroke-width="2.5" opacity=".9" transform="rotate(-18 160 44)"/>` +
        [[24, 30, 3], [56, 80, 2], [20, 150, 3.5], [180, 140, 2.5], [40, 210, 2], [170, 210, 3], [110, 16, 2]].map(([x, y, r]) => `<path d="${sparkle(x, y, r * 1.4)}" fill="#ffffff"/>`).join('') +
        `<ellipse cx="60" cy="200" rx="70" ry="22" fill="#9a7bff" opacity=".22"/>`;
      break;
  }
  return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${a.c1}"/><stop offset="1" stop-color="${a.c2}"/></linearGradient></defs>` +
    `<rect width="200" height="240" fill="url(#${g})"/>${deco}`;
}

// ---------- patterns for clothes ----------
function patternFill(pattern, base, accent, id) {
  if (!pattern) return { fill: base, defs: '' };
  const pid = `${id}-p${++seq}`;
  let inner = '';
  if (pattern === 'stripes') inner = `<rect width="10" height="10" fill="${base}"/><rect width="10" height="4" fill="${accent}"/>`;
  if (pattern === 'dots') inner = `<rect width="10" height="10" fill="${base}"/><circle cx="5" cy="5" r="2" fill="#ffffff"/>`;
  if (pattern === 'star') inner = `<rect width="16" height="16" fill="${base}"/><path d="${starPath(8, 8, 3.6)}" fill="${accent}"/>`;
  if (pattern === 'heart') return { fill: base, defs: '', heart: accent };
  const size = pattern === 'star' ? 16 : 10;
  return { fill: `url(#${pid})`, defs: `<defs><pattern id="${pid}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${inner}</pattern></defs>` };
}

// ---------- species: ears/features behind & on the head ----------
const SPECIES = {
  human: (fur) => ({ back: '', head: `<circle cx="56" cy="96" r="7" fill="${fur}" ${st}/><circle cx="144" cy="96" r="7" fill="${fur}" ${st}/>`, face: '' }),
  bunny: (fur) => ({
    back: `<g><ellipse cx="80" cy="44" rx="11" ry="30" fill="${fur}" ${st} transform="rotate(-10 80 44)"/><ellipse cx="80" cy="46" rx="5" ry="20" fill="#ffc2d4" transform="rotate(-10 80 46)"/>` +
          `<ellipse cx="120" cy="44" rx="11" ry="30" fill="${fur}" ${st} transform="rotate(10 120 44)"/><ellipse cx="120" cy="46" rx="5" ry="20" fill="#ffc2d4" transform="rotate(10 120 46)"/></g>`,
    head: '', face: `<path d="M97 104 Q100 107 103 104" fill="none" ${st}/>` }),
  cat: (fur) => ({
    back: `<path d="M60 70 L64 30 L92 52Z" fill="${fur}" ${st}/><path d="M66 60 L68 40 L84 52Z" fill="#ffc2d4"/>` +
          `<path d="M140 70 L136 30 L108 52Z" fill="${fur}" ${st}/><path d="M134 60 L132 40 L116 52Z" fill="#ffc2d4"/>`,
    head: '', face: `<path d="M60 104 L74 106 M60 112 L74 110 M140 104 L126 106 M140 112 L126 110" ${st} stroke-width="1.6"/><path d="M98 103 L102 103 L100 106Z" fill="#ff8fb1"/>` }),
  bear: (fur) => ({
    back: `<circle cx="62" cy="58" r="15" fill="${fur}" ${st}/><circle cx="62" cy="58" r="7" fill="${shade(fur, 0.12)}"/>` +
          `<circle cx="138" cy="58" r="15" fill="${fur}" ${st}/><circle cx="138" cy="58" r="7" fill="${shade(fur, 0.12)}"/>`,
    head: '', face: `<ellipse cx="100" cy="108" rx="16" ry="11" fill="${tint(fur, 0.5)}" ${st} stroke-width="2"/><ellipse cx="100" cy="103" rx="4.5" ry="3" fill="${OL}"/>` }),
  fox: (fur) => ({
    back: `<path d="M58 72 L56 26 L94 54Z" fill="${fur}" ${st}/><path d="M56 26 L58 40 L66 34Z" fill="#5a3b2e"/>` +
          `<path d="M142 72 L144 26 L106 54Z" fill="${fur}" ${st}/><path d="M144 26 L142 40 L134 34Z" fill="#5a3b2e"/>`,
    head: '', face: `<path d="M74 106 Q88 118 100 114 Q112 118 126 106 Q122 126 100 128 Q78 126 74 106Z" fill="#fffaf2"/><ellipse cx="100" cy="106" rx="4" ry="3" fill="${OL}"/>` }),
  panda: (fur) => ({
    back: `<circle cx="62" cy="58" r="15" fill="#3b3550" ${st}/><circle cx="138" cy="58" r="15" fill="#3b3550" ${st}/>`,
    head: '', face: `<ellipse cx="83" cy="96" rx="12" ry="10" fill="#3b3550" transform="rotate(-25 83 96)"/><ellipse cx="117" cy="96" rx="12" ry="10" fill="#3b3550" transform="rotate(25 117 96)"/><ellipse cx="100" cy="106" rx="4" ry="3" fill="${OL}"/>`, eyeLight: true }),
  frog: (fur) => ({
    back: `<circle cx="76" cy="54" r="15" fill="${fur}" ${st}/><circle cx="124" cy="54" r="15" fill="${fur}" ${st}/>` +
          `<circle cx="76" cy="54" r="8" fill="#ffffff"/><circle cx="124" cy="54" r="8" fill="#ffffff"/><circle cx="77" cy="55" r="4" fill="${OL}"/><circle cx="125" cy="55" r="4" fill="${OL}"/>`,
    head: '', face: '' }),
  sheep: (fur) => ({
    back: `<ellipse cx="54" cy="88" rx="16" ry="8" fill="${shade(fur, 0.1)}" ${st} transform="rotate(25 54 88)"/><ellipse cx="146" cy="88" rx="16" ry="8" fill="${shade(fur, 0.1)}" ${st} transform="rotate(-25 146 88)"/>`,
    head: '', top: [[76, 54], [90, 46], [104, 44], [118, 48], [128, 58], [66, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="#fffdf6" ${st}/>`).join(''), face: '' }),
  penguin: (fur) => ({
    back: '', head: '', face: '', headFill: '#3d4270', facePatch: `<path d="M100 74 C112 62 136 70 136 96 C136 120 118 130 100 130 C82 130 64 120 64 96 C64 70 88 62 100 74Z" fill="${fur}"/>`,
    beak: `<path d="M94 106 L106 106 L100 113Z" fill="#ffb347" ${st} stroke-width="1.8"/>` }),
  chick: (fur) => ({
    back: `<path d="M94 50 Q92 36 100 40 Q104 30 108 42 Q116 38 110 52Z" fill="${fur}" ${st}/>`,
    head: '', face: `<path d="M95 104 L105 104 L100 110Z" fill="#ffb347" ${st} stroke-width="1.8"/>` }),
  unicorn: (fur) => ({
    back: `<path d="M64 70 L68 38 L88 56Z" fill="${fur}" ${st}/><path d="M136 70 L132 38 L112 56Z" fill="${fur}" ${st}/>`,
    head: '', top: `<path d="M92 52 L100 14 L108 52Z" fill="#ffe27a" ${st}/><path d="M95 42 L105 38 M96 32 L104 28" ${st} stroke-width="1.6"/>`, face: '' }),
  dragon: (fur) => ({
    back: `<path d="M70 58 Q60 34 74 28 Q72 44 84 52Z" fill="#ffe27a" ${st}/><path d="M130 58 Q140 34 126 28 Q128 44 116 52Z" fill="#ffe27a" ${st}/>` +
          `<path d="M52 92 L40 80 L46 98 L38 100 L54 106Z" fill="${shade(fur, 0.12)}" ${st}/><path d="M148 92 L160 80 L154 98 L162 100 L146 106Z" fill="${shade(fur, 0.12)}" ${st}/>`,
    head: '', face: `<circle cx="96" cy="106" r="1.4" fill="${OL}"/><circle cx="104" cy="106" r="1.4" fill="${OL}"/>` }),
};

// ---------- hair ----------
const FRINGE = {
  round: 'M56 94 C52 50 80 38 100 38 C120 38 148 50 144 94 C138 82 128 74 118 76 C112 70 104 70 98 76 C90 70 80 72 74 80 C66 82 60 86 56 94Z',
  spiky: 'M56 94 C52 50 80 36 100 36 C122 36 148 50 144 94 L134 76 L126 86 L118 70 L108 82 L100 66 L92 82 L82 70 L74 86 L66 76Z',
  side: 'M56 96 C50 50 84 36 104 38 C126 40 148 54 144 92 C134 70 112 62 86 76 C74 82 62 88 56 96Z',
};
const HAIR = {
  none: () => ({ back: '', front: '' }),
  bob: c => ({ back: `<path d="M50 94 C46 40 154 40 150 94 L150 124 C140 132 130 128 126 120 L74 120 C70 128 60 132 50 124Z" fill="${c}" ${st}/>`, front: `<path d="${FRINGE.round}" fill="${c}" ${st}/>` }),
  long: c => ({ back: `<path d="M50 94 C46 40 154 40 150 94 L154 168 C140 176 128 170 126 160 L74 160 C72 170 60 176 46 168Z" fill="${c}" ${st}/>`, front: `<path d="${FRINGE.round}" fill="${c}" ${st}/>` }),
  spiky: c => ({ back: '', front: `<path d="${FRINGE.spiky}" fill="${c}" ${st}/>` }),
  twintails: c => ({
    back: `<path d="M56 74 C30 80 28 130 40 156 C46 140 54 120 62 96Z" fill="${c}" ${st}/><path d="M144 74 C170 80 172 130 160 156 C154 140 146 120 138 96Z" fill="${c}" ${st}/>` +
          `<circle cx="58" cy="78" r="5" fill="#ff8fb1" ${st} stroke-width="2"/><circle cx="142" cy="78" r="5" fill="#ff8fb1" ${st} stroke-width="2"/>`,
    front: `<path d="${FRINGE.round}" fill="${c}" ${st}/>` }),
  bun: c => ({ back: `<circle cx="64" cy="52" r="16" fill="${c}" ${st}/><circle cx="136" cy="52" r="16" fill="${c}" ${st}/>`, front: `<path d="${FRINGE.round}" fill="${c}" ${st}/>` }),
  wavy: c => ({ back: `<path d="M50 94 C46 40 154 40 150 94 C158 110 146 120 154 134 C160 148 146 156 148 164 C136 170 128 162 126 156 L74 156 C72 162 64 170 52 164 C54 156 40 148 46 134 C54 120 42 110 50 94Z" fill="${c}" ${st}/>`, front: `<path d="${FRINGE.side}" fill="${c}" ${st}/>` }),
  ponytail: c => ({ back: `<path d="M120 50 C160 40 172 80 160 120 C156 136 150 150 140 160 C146 130 150 100 132 70Z" fill="${c}" ${st}/><circle cx="128" cy="52" r="6" fill="#b9a5ee" ${st} stroke-width="2"/>`, front: `<path d="${FRINGE.round}" fill="${c}" ${st}/>` }),
  pixie: c => ({ back: `<path d="M52 96 C46 44 154 44 148 96 L146 108 C140 112 136 106 136 100 L64 100 C64 106 60 112 54 108Z" fill="${c}" ${st}/>`, front: `<path d="${FRINGE.side}" fill="${c}" ${st}/>` }),
  princess: c => ({
    back: `<path d="M50 94 C46 40 154 40 150 94 L154 156 C140 164 128 160 126 152 L74 152 C72 160 60 164 46 156Z" fill="${c}" ${st}/>` +
          [[48, 160], [60, 168], [140, 168], [152, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" ${st}/>`).join(''),
    front: `<path d="${FRINGE.round}" fill="${c}" ${st}/><path d="M74 60 Q84 54 92 58" fill="none" stroke="${tint(c, 0.5)}" stroke-width="3" stroke-linecap="round"/>` }),
};

// ---------- clothing ----------
function sleeves(pose, color) {
  return ['l', 'r'].map(k => { const [x, y] = qpt(pose[k], 0.22); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.5" fill="${color}" ${st}/>`; }).join('');
}
const TOPS = {
  tee: (a, id) => { const p = patternFill(a.pattern, a.color, a.accent, id);
    return { body: `${p.defs}<path d="${TORSO}" fill="${p.fill}" ${st}/><path d="M90 130 Q100 138 110 130" fill="none" stroke="${a.accent}" stroke-width="3" stroke-linecap="round"/>` +
      (p.heart ? `<path d="${heartPath(100, 152, 8)}" fill="${p.heart}" ${st} stroke-width="2"/>` : ''), sleeve: a.color }; },
  hoodie: (a, id) => { const p = patternFill(a.pattern, a.color, a.accent, id);
    return { back: `<path d="M74 136 Q100 112 126 136 Q100 128 74 136Z" fill="${shade(a.color, 0.1)}" ${st}/>`,
      body: `${p.defs}<path d="${TORSO}" fill="${p.fill}" ${st}/><path d="M86 156 L114 156 L116 168 L84 168Z" fill="${a.accent}" ${st} stroke-width="2"/><path d="M95 132 L94 146 M105 132 L106 146" ${st} stroke-width="1.8"/>`, sleeve: a.color }; },
  sailor: a => ({ body: `<path d="${TORSO}" fill="${a.color}" ${st}/><path d="M80 132 L100 156 L120 132 L126 146 L100 162 L74 146Z" fill="${a.accent}" ${st} stroke-width="2"/><path d="M95 152 L105 152 L100 164Z" fill="#ff6f8f" ${st} stroke-width="1.8"/>`, sleeve: a.color }),
  sweater: a => ({ body: `<path d="${TORSO}" fill="${a.color}" ${st}/><path d="M75 166 Q100 172 125 166 L126 172 Q100 178 74 172Z" fill="${a.accent}"/><path d="M92 138 Q96 150 92 162 M108 138 Q104 150 108 162" fill="none" stroke="${a.accent}" stroke-width="2.4"/><path d="M90 130 Q100 136 110 130" fill="none" stroke="${a.accent}" stroke-width="4" stroke-linecap="round"/>`, sleeve: a.color }),
  jacket: a => ({ body: `<path d="${TORSO}" fill="${a.color}" ${st}/><path d="M100 130 L100 176" ${st} stroke-width="2"/><circle cx="104" cy="146" r="2" fill="${a.accent}"/><circle cx="104" cy="158" r="2" fill="${a.accent}"/><path d="M84 130 L100 144 L116 130" fill="none" stroke="${a.accent}" stroke-width="3"/><path d="M75 166 Q100 172 125 166" fill="none" stroke="${a.accent}" stroke-width="3"/>`, sleeve: a.color, sleeveStripe: a.accent }),
};
const BOTTOMS = {
  skirt: (a, id) => { const p = patternFill(a.pattern, a.color, '#ffffff', id); return `${p.defs}<path d="M76 168 L124 168 L134 196 Q100 204 66 196Z" fill="${p.fill}" ${st}/>`; },
  pleated: a => `<path d="M76 168 L124 168 L134 196 Q100 204 66 196Z" fill="${a.color}" ${st}/><path d="M88 170 L84 199 M100 170 L100 201 M112 170 L116 199" stroke="${shade(a.color, 0.25)}" stroke-width="2"/>`,
  shorts: a => `<path d="M76 168 L124 168 L127 190 L104 192 L100 180 L96 192 L73 190Z" fill="${a.color}" ${st}/>`,
  pants: a => `<path d="M76 168 L124 168 L122 206 L104 206 L100 184 L96 206 L78 206Z" fill="${a.color}" ${st}/>`,
};
const DRESSES = {
  sundress: a => ({ body: `<path d="M80 132 Q100 126 120 132 L122 164 L138 202 Q100 212 62 202 L78 164Z" fill="${a.color}" ${st}/><path d="M78 164 Q100 170 122 164" fill="none" stroke="${a.accent}" stroke-width="4"/><circle cx="100" cy="166" r="4" fill="${a.accent}" ${st} stroke-width="1.6"/>`, sleeve: null }),
  sailor_dress: a => ({ body: `<path d="M78 133 Q100 125 122 133 L124 164 L138 202 Q100 212 62 202 L76 164Z" fill="${a.color}" ${st}/><path d="M80 132 L100 156 L120 132 L126 146 L100 162 L74 146Z" fill="${a.accent}" ${st} stroke-width="2"/><path d="M66 194 Q100 204 134 194" fill="none" stroke="${a.accent}" stroke-width="3"/>`, sleeve: a.color }),
  puffy: a => ({ body: `<path d="M80 132 Q100 126 120 132 L122 162 L140 196 Q100 208 60 196 L78 162Z" fill="${a.color}" ${st}/>` +
      [64, 78, 92, 106, 120, 134].map(x => `<circle cx="${x + 1}" cy="${x < 70 || x > 130 ? 197 : 202}" r="7" fill="${a.accent}" ${st} stroke-width="2"/>`).join('') +
      `<path d="M92 142 L100 148 L108 142 L108 154 L100 148 L92 154Z" fill="${a.accent}" ${st} stroke-width="1.8"/>`, sleeve: a.color }),
  gown: (a, id) => { const p = patternFill(a.pattern, a.color, a.accent, id);
    return { body: `${p.defs}<path d="M82 132 Q100 126 118 132 L120 160 L146 216 Q100 226 54 216 L80 160Z" fill="${p.fill}" ${st}/><path d="M80 160 Q100 166 120 160" fill="none" stroke="${a.accent}" stroke-width="3.5"/>` +
      [[86, 190], [112, 200], [100, 178], [126, 208], [72, 206]].map(([x, y]) => `<path d="${sparkle(x, y, 3.5)}" fill="${a.accent}"/>`).join(''), sleeve: null, long: true }; },
};
const OUTFITS = {
  idol: a => ({ body: `<path d="${TORSO}" fill="${a.color}" ${st}/><path d="M76 168 L124 168 L136 196 Q100 204 64 196Z" fill="${shade(a.color, 0.08)}" ${st}/>` +
      `<path d="M86 132 L100 150 L114 132" fill="none" stroke="${a.accent}" stroke-width="3.5"/><path d="${starPath(100, 158, 7)}" fill="${a.accent}" ${st} stroke-width="1.8"/>` +
      [70, 84, 100, 116, 130].map(x => `<circle cx="${x}" cy="196" r="2.5" fill="${a.accent}"/>`).join(''), sleeve: a.accent }),
  magical: a => ({ body: `<path d="M80 132 Q100 126 120 132 L122 162 L140 198 Q100 210 60 198 L78 162Z" fill="${a.color}" ${st}/><path d="M64 192 Q100 204 136 192 L140 198 Q100 210 60 198Z" fill="${a.accent}" ${st} stroke-width="2"/>` +
      `<path d="M84 140 L100 150 L116 140 L116 160 L100 150 L84 160Z" fill="#ff6f9c" ${st} stroke-width="2"/><circle cx="100" cy="150" r="4" fill="#ffe27a" ${st} stroke-width="1.6"/>`, sleeve: a.accent }),
  astronaut: a => ({ body: `<path d="M74 132 Q100 122 126 132 L128 176 L124 208 L104 208 L100 186 L96 208 L76 208 L72 176Z" fill="${a.color}" ${st}/>` +
      `<rect x="88" y="142" width="24" height="16" rx="4" fill="#cfd8ff" ${st} stroke-width="2"/><circle cx="94" cy="150" r="2.5" fill="#ff6f6f"/><circle cx="102" cy="150" r="2.5" fill="#ffd23f"/><circle cx="110" cy="150" r="0"/>` +
      `<path d="M73 170 L127 170" stroke="${a.accent}" stroke-width="5"/>`, sleeve: a.color, legs: true }),
  prince: a => ({ body: `<path d="M76 133 Q100 124 124 133 L128 184 Q100 190 72 184Z" fill="${a.color}" ${st}/><path d="M80 182 L120 182 L118 206 L104 206 L100 190 L96 206 L82 206Z" fill="#ffffff" ${st}/>` +
      `<path d="M80 134 L120 176" stroke="${a.accent}" stroke-width="5"/>` + [146, 158, 170].map(y => `<circle cx="96" cy="${y}" r="2" fill="${a.accent}"/>`).join(''), sleeve: a.color, legs: true }),
  kimono: a => ({ body: `<path d="M78 133 Q100 125 122 133 L126 214 Q100 220 74 214Z" fill="${a.color}" ${st}/><path d="M86 130 L112 170 M114 130 L100 152" stroke="${a.accent}" stroke-width="3" fill="none"/>` +
      `<rect x="75" y="160" width="50" height="12" fill="${a.accent}" ${st} stroke-width="2"/>` +
      [[86, 190], [112, 198], [96, 206], [118, 180]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ff9fc0"/>`).join(''), sleeve: a.color, long: true }),
};
const SHOES = {
  sneakers: a => [88, 112].map(x => `<path d="M${x - 11} 216 Q${x - 11} 204 ${x} 204 Q${x + 12} 204 ${x + 12} 216Z" fill="${a.color}" ${st}/><path d="M${x - 11} 213 L${x + 12} 213" stroke="${a.accent || '#ff9fc0'}" stroke-width="2.5"/>`).join(''),
  maryjane: a => [88, 112].map(x => `<path d="M${x - 10} 216 Q${x - 10} 206 ${x} 206 Q${x + 11} 206 ${x + 11} 216Z" fill="${a.color}" ${st}/><path d="M${x - 7} 208 L${x + 8} 208" stroke="${tint(a.color, 0.5)}" stroke-width="2"/>`).join(''),
  boots: a => [88, 112].map(x => `<path d="M${x - 8} 194 L${x + 8} 194 L${x + 9} 206 Q${x + 13} 208 ${x + 12} 217 L${x - 10} 217Z" fill="${a.color}" ${st}/><path d="M${x - 9} 198 L${x + 9} 198" stroke="#fff6ea" stroke-width="4" stroke-linecap="round"/>`).join(''),
  slippers: a => [88, 112].map(x => `<ellipse cx="${x - 4}" cy="200" rx="3.5" ry="8" fill="${a.color}" ${st} stroke-width="2"/><ellipse cx="${x + 4}" cy="200" rx="3.5" ry="8" fill="${a.color}" ${st} stroke-width="2"/><ellipse cx="${x}" cy="211" rx="13" ry="7.5" fill="${a.color}" ${st}/><circle cx="${x - 4}" cy="210" r="1.2" fill="${OL}"/><circle cx="${x + 4}" cy="210" r="1.2" fill="${OL}"/>`).join(''),
};
const HATS = {
  bow: a => `<g transform="translate(128 52) rotate(18)"><path d="M0 0 L-16 -10 L-16 10Z" fill="${a.color}" ${st}/><path d="M0 0 L16 -10 L16 10Z" fill="${a.color}" ${st}/><circle r="5" fill="${shade(a.color, 0.1)}" ${st}/></g>`,
  beret: a => `<ellipse cx="96" cy="50" rx="40" ry="14" fill="${a.color}" ${st} transform="rotate(-10 96 50)"/><path d="M98 37 L100 30" ${st} stroke-width="3"/>`,
  cap: a => `<path d="M60 66 C60 34 140 34 140 66Z" fill="${a.color}" ${st}/><path d="M118 62 Q150 60 158 70 L120 70Z" fill="${shade(a.color, 0.12)}" ${st}/><circle cx="100" cy="38" r="3" fill="${shade(a.color, 0.2)}"/>`,
  beanie: a => `<path d="M56 74 C54 30 146 30 144 74Z" fill="${a.color}" ${st}/><rect x="54" y="66" width="92" height="12" rx="6" fill="${shade(a.color, 0.12)}" ${st}/><circle cx="100" cy="32" r="8" fill="#ffffff" ${st}/>`,
  flowers: a => [[64, 64], [78, 52], [94, 46], [110, 46], [124, 52], [136, 64]].map(([x, y], i) =>
      `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(r => `<ellipse cx="0" cy="-4.5" rx="3.6" ry="4.6" fill="${i % 2 ? '#ffffff' : a.color}" transform="rotate(${r})" stroke="${OL}" stroke-width="1.4"/>`).join('')}<circle r="2.4" fill="#ffd23f"/></g>`).join(''),
  headphones: a => `<path d="M54 96 C50 30 150 30 146 96" fill="none" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M54 96 C50 30 150 30 146 96" fill="none" stroke="${a.color}" stroke-width="5" stroke-linecap="round"/>` +
      `<rect x="44" y="84" width="16" height="26" rx="7" fill="${a.color}" ${st}/><rect x="140" y="84" width="16" height="26" rx="7" fill="${a.color}" ${st}/>`,
  witch: a => `<ellipse cx="100" cy="58" rx="56" ry="10" fill="${a.color}" ${st}/><path d="M72 56 L106 2 Q112 -2 112 8 L128 56Z" fill="${a.color}" ${st}/><path d="M74 50 L126 50" stroke="#ffd76a" stroke-width="5"/><path d="${starPath(116, 24, 5)}" fill="#ffd76a"/>`,
  crown: a => `<path d="M72 56 L74 28 L88 42 L100 22 L112 42 L126 28 L128 56Z" fill="${a.color}" ${st}/><circle cx="100" cy="46" r="4" fill="#ff6f9c"/><circle cx="84" cy="50" r="2.5" fill="#8fb8f5"/><circle cx="116" cy="50" r="2.5" fill="#8fb8f5"/>`,
  tiara: a => `<path d="M70 58 Q100 40 130 58" fill="none" stroke="${a.color}" stroke-width="5" stroke-linecap="round"/><path d="${starPath(100, 40, 9)}" fill="#ffe27a" ${st} stroke-width="2"/><circle cx="82" cy="50" r="3" fill="#ffffff" ${st} stroke-width="1.5"/><circle cx="118" cy="50" r="3" fill="#ffffff" ${st} stroke-width="1.5"/>`,
  halo: a => `<ellipse cx="100" cy="30" rx="30" ry="8" fill="none" stroke="${OL}" stroke-width="8"/><ellipse cx="100" cy="30" rx="30" ry="8" fill="none" stroke="${a.color}" stroke-width="5"/>`,
};
const GLASSES = {
  round: a => `<circle cx="84" cy="96" r="11" fill="#ffffff" fill-opacity=".25" stroke="${a.color}" stroke-width="3"/><circle cx="116" cy="96" r="11" fill="#ffffff" fill-opacity=".25" stroke="${a.color}" stroke-width="3"/><path d="M95 95 Q100 92 105 95" fill="none" stroke="${a.color}" stroke-width="3"/>`,
  square: a => `<rect x="72" y="87" width="24" height="18" rx="5" fill="#ffffff" fill-opacity=".25" stroke="${a.color}" stroke-width="3"/><rect x="104" y="87" width="24" height="18" rx="5" fill="#ffffff" fill-opacity=".25" stroke="${a.color}" stroke-width="3"/><path d="M96 95 L104 95" stroke="${a.color}" stroke-width="3"/>`,
  heart: a => `<path d="${heartPath(84, 97, 9)}" fill="${a.color}" fill-opacity=".9" ${st}/><path d="${heartPath(116, 97, 9)}" fill="${a.color}" fill-opacity=".9" ${st}/><path d="M94 94 L106 94" ${st}/>`,
  star: a => `<path d="${starPath(84, 96, 13, 0.5)}" fill="${a.color}" fill-opacity=".92" ${st}/><path d="${starPath(116, 96, 13, 0.5)}" fill="${a.color}" fill-opacity=".92" ${st}/><path d="M95 95 L105 95" ${st}/>`,
};
const JEWELRY = {
  pearls: a => [76, 83, 90, 97, 104, 111, 118, 125].map((x, i) => `<circle cx="${x - 1}" cy="${134 + Math.sin((i / 7) * Math.PI) * 7}" r="3" fill="${a.color}" stroke="${OL}" stroke-width="1.3"/>`).join(''),
  pendant: a => `<path d="M82 132 Q100 148 118 132" fill="none" stroke="#ffd76a" stroke-width="2"/><path d="${heartPath(100, 143, 5)}" fill="${a.color}" ${st} stroke-width="1.8"/>`,
  choker: a => `<path d="M84 130 Q100 136 116 130" fill="none" stroke="${a.color}" stroke-width="5" stroke-linecap="round"/><path d="${starPath(100, 138, 5)}" fill="#ffe27a" ${st} stroke-width="1.5"/>`,
  bowtie: a => `<path d="M100 134 L88 127 L88 141Z M100 134 L112 127 L112 141Z" fill="${a.color}" ${st} stroke-width="2"/><circle cx="100" cy="134" r="3" fill="${shade(a.color, 0.15)}" ${st} stroke-width="1.5"/>`,
  pin: a => `<path d="${starPath(112, 148, 6)}" fill="${a.color}" ${st} stroke-width="1.8"/>`,
};
const WINGS = {
  fairy: a => [[64, 128, -30, 26, 16], [136, 128, 30, 26, 16], [70, 160, -60, 16, 11], [130, 160, 60, 16, 11]].map(([x, y, r, rx, ry]) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${a.color}" fill-opacity=".75" ${st} transform="rotate(${r} ${x} ${y})"/>`).join(''),
  angel: a => ['', 'scale(-1 1) translate(-200 0)'].map(tr => `<g transform="${tr}"><path d="M84 138 C60 110 30 110 22 124 C34 124 30 132 40 134 C34 138 36 146 46 146 C42 152 50 160 60 156 C66 162 78 158 84 150Z" fill="${a.color}" ${st}/>` +
      (a.pattern === 'star' ? `<path d="${starPath(46, 134, 4)}" fill="#ffe27a"/><path d="${starPath(62, 148, 3)}" fill="#ffe27a"/>` : '') + '</g>').join(''),
  bat: a => ['', 'scale(-1 1) translate(-200 0)'].map(tr => `<path transform="${tr}" d="M84 140 C70 112 40 108 24 118 C32 126 30 134 38 138 C40 132 48 134 50 142 C54 136 62 138 62 148 C68 142 78 146 84 152Z" fill="${a.color}" ${st}/>`).join(''),
  butterfly: a => ['', 'scale(-1 1) translate(-200 0)'].map(tr => `<g transform="${tr}"><path d="M86 140 C64 100 28 108 34 132 C38 146 60 148 86 146Z" fill="${a.color}" ${st}/><path d="M86 148 C64 150 46 166 58 176 C70 184 82 166 88 154Z" fill="${a.accent || a.color}" ${st}/><circle cx="54" cy="128" r="5" fill="#ffffff" opacity=".8"/></g>`).join(''),
};
const BAGS = {
  purse: (a, id) => { const p = patternFill(a.pattern, a.color, '#ffffff', id);
    return { front: `${p.defs}<path d="M82 134 L124 168" stroke="${OL}" stroke-width="4"/><path d="M82 134 L124 168" stroke="${shade(a.color, 0.2)}" stroke-width="2"/><path d="${heartPath(128, 172, 11)}" fill="${p.fill}" ${st}/>` }; },
  backpack: a => ({ back: `<rect x="70" y="128" width="60" height="44" rx="14" fill="${a.color}" ${st}/>`, front: `<path d="M84 134 L82 168 M116 134 L118 168" stroke="${shade(a.color, 0.2)}" stroke-width="5" stroke-linecap="round"/>` }),
  tote: a => ({ front: `<path d="M118 134 Q84 150 76 168" fill="none" stroke="${OL}" stroke-width="3"/><rect x="58" y="164" width="30" height="30" rx="4" fill="${a.color}" ${st}/><path d="${heartPath(73, 179, 6)}" fill="${a.accent}"/>` }),
};
const HELD = {
  lightstick: (a, x, y) => `<g transform="translate(${x} ${y})"><rect x="-3" y="-4" width="6" height="22" rx="3" fill="#ffffff" ${st} stroke-width="2"/><circle cx="0" cy="-12" r="12" fill="${a.color}" opacity=".35"/><circle cx="0" cy="-12" r="9" fill="${tint(a.color, 0.4)}" ${st} stroke-width="2"/><path d="${starPath(0, -12, 5)}" fill="#ffffff"/></g>`,
  boba: (a, x, y) => `<g transform="translate(${x} ${y})"><path d="M2 -26 L6 -6" stroke="#ff8fb1" stroke-width="3" stroke-linecap="round"/><path d="M-9 -12 L9 -12 L7 12 L-7 12Z" fill="${a.color}" ${st} stroke-width="2"/><circle cx="-3" cy="6" r="2" fill="${OL}"/><circle cx="3" cy="8" r="2" fill="${OL}"/><circle cx="0" cy="3" r="2" fill="${OL}"/></g>`,
  balloon: (a, x, y) => `<g transform="translate(${x} ${y})"><path d="M0 0 Q6 -20 0 -40" fill="none" ${st} stroke-width="1.5"/><path d="${heartPath(0, -52, 13)}" fill="${a.color}" ${st}/></g>`,
  flower: (a, x, y) => `<g transform="translate(${x} ${y})"><path d="M0 4 L0 -16" stroke="#6ccf8e" stroke-width="3"/><path d="M-7 -16 L-7 -28 L-3 -24 L0 -30 L3 -24 L7 -28 L7 -16 Q0 -10 -7 -16Z" fill="${a.color}" ${st} stroke-width="2"/></g>`,
  plush: (a, x, y) => `<g transform="translate(${x} ${y - 6})"><ellipse cx="-5" cy="-20" rx="3.5" ry="9" fill="${a.color}" ${st} stroke-width="2"/><ellipse cx="5" cy="-20" rx="3.5" ry="9" fill="${a.color}" ${st} stroke-width="2"/><circle cx="0" cy="-6" r="10" fill="${a.color}" ${st} stroke-width="2"/><circle cx="-3.5" cy="-7" r="1.4" fill="${OL}"/><circle cx="3.5" cy="-7" r="1.4" fill="${OL}"/><circle cx="0" cy="-3" r="1.3" fill="#ff8fb1"/></g>`,
  wand: (a, x, y) => `<g transform="translate(${x} ${y})"><path d="M0 6 L0 -20" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/><path d="M0 6 L0 -20" stroke="${OL}" stroke-width="1.2"/><path d="${starPath(0, -26, 10)}" fill="${a.color}" ${st} stroke-width="2"/></g>`,
  mic: (a, x, y) => `<g transform="translate(${x} ${y})"><path d="M-3 -6 L-2 14 L2 14 L3 -6Z" fill="#3b3550" ${st} stroke-width="1.8"/><circle cx="0" cy="-12" r="8" fill="${a.color}" ${st} stroke-width="2"/><path d="M-6 -14 L6 -14 M-5 -9 L5 -9" stroke="${shade(a.color, 0.25)}" stroke-width="1.4"/></g>`,
};
const EFFECTS = {
  sparkles: a => ({ front: [[34, 60, 7], [166, 54, 9], [150, 160, 6], [42, 170, 5], [176, 110, 4]].map(([x, y, r], i) => `<path class="fq-tw" style="animation-delay:${i * 0.4}s" d="${sparkle(x, y, r)}" fill="${a.color}" stroke="${OL}" stroke-width="1.2"/>`).join('') }),
  hearts: a => ({ front: [[30, 70, 7], [170, 64, 6], [162, 150, 8], [36, 156, 5], [146, 30, 5]].map(([x, y, s], i) => `<path class="fq-fl" style="animation-delay:${i * 0.5}s" d="${heartPath(x, y, s)}" fill="${a.color}" stroke="${OL}" stroke-width="1.4"/>`).join('') }),
  bubbles: a => ({ front: [[30, 80, 8], [168, 70, 6], [160, 160, 9], [40, 170, 5], [176, 120, 4], [24, 130, 4]].map(([x, y, r], i) => `<g class="fq-fl" style="animation-delay:${i * 0.35}s"><circle cx="${x}" cy="${y}" r="${r}" fill="${a.color}" fill-opacity=".25" stroke="${a.color}" stroke-width="2"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 4}" fill="#ffffff"/></g>`).join('') }),
  confetti: a => ({ front: [[30, 40, '#ff9fc0', 20], [60, 26, '#8fb8f5', -30], [150, 30, '#ffd76a', 40], [174, 70, '#a3e3bd', -10], [24, 120, '#b9a5ee', 60], [176, 150, '#ff9fc0', 15], [40, 196, '#ffd76a', -40], [164, 200, '#8fb8f5', 30]].map(([x, y, c, r], i) => `<rect class="fq-tw" style="animation-delay:${i * 0.25}s" x="${x}" y="${y}" width="8" height="4" rx="1" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('') }),
  snow: () => ({ front: [[30, 30], [70, 50], [130, 20], [170, 60], [24, 110], [178, 120], [40, 180], [160, 190], [100, 12]].map(([x, y], i) => `<g class="fq-fall" style="animation-delay:${i * 0.3}s"><circle cx="${x}" cy="${y}" r="3" fill="#ffffff" stroke="#b7c6ff" stroke-width="1"/></g>`).join('') }),
  aura: a => ({ back: `<circle cx="100" cy="120" r="86" fill="${a.color}" opacity=".35"/><circle cx="100" cy="120" r="66" fill="${a.color}" opacity=".35"/>`,
    front: [[40, 60], [160, 60], [30, 150], [170, 150]].map(([x, y], i) => `<path class="fq-tw" style="animation-delay:${i * 0.5}s" d="${starPath(x, y, 6)}" fill="#ffe27a" stroke="${OL}" stroke-width="1.2"/>`).join('') }),
  rainbow: () => ({ back: ['#ff9fc0', '#ffd76a', '#a3e3bd', '#8fb8f5', '#b9a5ee'].map((c, i) => `<path d="M${10 + i * 7} 200 A${90 - i * 7} ${110 - i * 7} 0 0 1 ${190 - i * 7} 200" fill="none" stroke="${c}" stroke-width="7" opacity=".8"/>`).join('') }),
};
function frame(it, id) {
  const a = it?.art || {}; const s = a.shape;
  if (!s || s === 'none') return '';
  const box = `<rect x="4" y="4" width="192" height="232" rx="22" fill="none"`;
  switch (s) {
    case 'round': return `${box} stroke="${OL}" stroke-width="10"/>${box} stroke="${a.color}" stroke-width="6"/>`;
    case 'heart': return `${box} stroke="${OL}" stroke-width="10"/>${box} stroke="${a.color}" stroke-width="6"/>` + [[18, 18], [182, 18], [18, 222], [182, 222]].map(([x, y]) => `<path d="${heartPath(x, y, 9)}" fill="${a.color}" ${st}/>`).join('');
    case 'lace': { let d = ''; for (let x = 12; x <= 188; x += 16) d += `<circle cx="${x}" cy="6" r="7"/><circle cx="${x}" cy="234" r="7"/>`; for (let y = 22; y <= 218; y += 16) d += `<circle cx="6" cy="${y}" r="7"/><circle cx="194" cy="${y}" r="7"/>`;
      return `<g fill="${a.color}" stroke="${OL}" stroke-width="1.6">${d}</g>${box} stroke="${OL}" stroke-width="3"/>`; }
    case 'star': return `${box} stroke="${OL}" stroke-width="10"/>${box} stroke="${a.color}" stroke-width="6"/>` + [[18, 18], [182, 18], [18, 222], [182, 222], [100, 8]].map(([x, y]) => `<path d="${starPath(x, y, 11)}" fill="${a.color}" ${st}/>`).join('');
    case 'gold': return `<defs><linearGradient id="${id}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f6c343"/><stop offset="1" stop-color="#d99a1e"/></linearGradient></defs>${box} stroke="${OL}" stroke-width="14"/>${box} stroke="url(#${id}-gold)" stroke-width="10"/><rect x="14" y="14" width="172" height="212" rx="16" fill="none" stroke="#fff2a8" stroke-width="2"/>`;
    case 'rainbow': return `<defs><linearGradient id="${id}-rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9fc0"/><stop offset=".25" stop-color="#ffd76a"/><stop offset=".5" stop-color="#a3e3bd"/><stop offset=".75" stop-color="#8fb8f5"/><stop offset="1" stop-color="#b9a5ee"/></linearGradient></defs>${box} stroke="${OL}" stroke-width="14"/>${box} stroke="url(#${id}-rb)" stroke-width="10"/>`;
  }
  return '';
}

// ---------- main ----------
export const VIEWBOX = { full: '0 0 200 240', head: '36 10 128 128', body: '36 104 128 128', legs: '46 150 108 80', face: '50 50 100 100' };

export function renderAvatar(av = {}, items = new Map(), opts = {}) {
  const id = `fqa${++seq}`;
  const get = slot => { const it = av[slot] ? items.get(av[slot]) : null; return it && it.slot === slot ? it : null; };
  const vb = VIEWBOX[opts.view || 'full'];
  const cls = `fq-avatar${opts.animate === false ? '' : ' fq-anim'}`;
  const label = esc(opts.title || 'Avatar');
  const bg = background(get('background'), id);
  const fr = frame(get('frame'), id);
  const fx = get('effect') ? (EFFECTS[get('effect').art.shape]?.(get('effect').art) || {}) : {};

  if (av.mode === 'custom' && opts.customUrl) {
    return `<svg class="${cls}" viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs><clipPath id="${id}-clip"><rect x="14" y="14" width="172" height="212" rx="18"/></clipPath></defs>${bg}${fx.back || ''}` +
      `<image href="${esc(opts.customUrl)}" x="14" y="14" width="172" height="212" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-clip)"/>${fx.front || ''}${fr}</svg>`;
  }

  const sp = get('species') || { art: { shape: 'bunny' } };
  const fur = av.skin || sp.art.fur || '#fff3f7';
  const eyes = av.eyes || '#4a3b6b';
  const hc = av.hair_color || '#8a5a44';
  const S = (SPECIES[sp.art.shape] || SPECIES.bunny)(fur);
  const poseKey = get('pose')?.art.shape || 'stand';
  const pose = POSES[poseKey] || POSES.stand;
  const hairIt = get('hair'); const hair = (HAIR[hairIt?.art.shape || 'none'] || HAIR.none)(hc);

  const outfit = get('outfit'), dress = !outfit && get('dress');
  const top = !outfit && !dress && get('top'), bottom = !outfit && !dress && get('bottom');
  const O = outfit ? OUTFITS[outfit.art.shape]?.(outfit.art, id) : null;
  const D = dress ? DRESSES[dress.art.shape]?.(dress.art, id) : null;
  const T = top ? TOPS[top.art.shape]?.(top.art, id) : null;
  const B = bottom ? BOTTOMS[bottom.art.shape]?.(bottom.art, id) : '';
  const wear = O || D || T;
  const bagIt = get('bag'); const BG = bagIt ? (BAGS[bagIt.art.shape]?.(bagIt.art, id) || {}) : {};
  const wings = get('wings') ? WINGS[get('wings').art.shape]?.(get('wings').art) || '' : '';
  const heldIt = get('held');
  const hand = pose.r[2];
  const held = heldIt ? HELD[heldIt.art.shape]?.(heldIt.art, hand[0] + (poseKey === 'heart' ? 0 : 2), hand[1] - 2) || '' : '';
  const hat = get('hat') ? HATS[get('hat').art.shape]?.(get('hat').art) || '' : '';
  const glasses = get('glasses') ? GLASSES[get('glasses').art.shape]?.(get('glasses').art) || '' : '';
  const jewel = get('jewelry') ? JEWELRY[get('jewelry').art.shape]?.(get('jewelry').art) || '' : '';
  const shoes = get('shoes') ? SHOES[get('shoes').art.shape]?.(get('shoes').art) || '' : '';
  const longWear = (O && (O.long || O.legs)) || (D && D.long);

  const arm = p => `<path d="M${p[0][0]} ${p[0][1]} Q${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]}" fill="none" stroke="${OL}" stroke-width="13.5" stroke-linecap="round"/>` +
                   `<path d="M${p[0][0]} ${p[0][1]} Q${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]}" fill="none" stroke="${fur}" stroke-width="8.5" stroke-linecap="round"/>`;
  const sleeveColor = wear?.sleeve;
  const sleeveMarkup = sleeveColor ? sleeves(pose, sleeveColor) + (wear.sleeveStripe ? ['l', 'r'].map(k => { const [x, y] = qpt(pose[k], 0.22); return `<path d="M${x - 6} ${y + 3} L${x + 6} ${y + 3}" stroke="${wear.sleeveStripe}" stroke-width="2.5"/>`; }).join('') : '') : '';

  const headFill = S.headFill || fur;
  const eyeY = 97;
  const eyesSvg = [84, 116].map(x => `<ellipse cx="${x}" cy="${eyeY}" rx="5.6" ry="7" fill="${eyes}"/><circle cx="${x + 2}" cy="${eyeY - 3}" r="2.2" fill="#ffffff"/><circle cx="${x - 1.8}" cy="${eyeY + 2.6}" r="1" fill="#ffffff"/>`).join('');
  const mouth = S.beak || `<path d="M94 ${S.face && sp.art.shape === 'bear' ? 112 : 110} Q97 114 100 110 Q103 114 106 110" fill="none" ${st} stroke-width="2.2"/>`;
  const blush = `<ellipse cx="72" cy="110" rx="7" ry="4.5" fill="#ff9fb8" opacity=".55"/><ellipse cx="128" cy="110" rx="7" ry="4.5" fill="#ff9fb8" opacity=".55"/>`;

  const body =
    `<ellipse cx="100" cy="222" rx="${pose.lift ? 26 : 34}" ry="6" fill="#3b2f5c" opacity=".14"/>` +
    `<g transform="translate(0 ${pose.lift || 0})">` +
      (fx.back || '') + wings + (BG.back || '') + (T?.back || '') + hair.back +
      // legs
      (longWear ? '' : `<rect x="84" y="170" width="13" height="42" rx="6.5" fill="${fur}" ${st}/><rect x="103" y="170" width="13" height="42" rx="6.5" fill="${fur}" ${st}/>`) +
      shoes +
      // torso base
      (wear ? '' : `<path d="${TORSO}" fill="${fur}" ${st}/>`) +
      (B || '') + (wear?.body || '') + jewel +
      arm(pose.l) + arm(pose.r) + sleeveMarkup +
      `<circle cx="${pose.l[2][0]}" cy="${pose.l[2][1]}" r="6.5" fill="${fur}" ${st}/><circle cx="${pose.r[2][0]}" cy="${pose.r[2][1]}" r="6.5" fill="${fur}" ${st}/>` +
      (poseKey === 'heart' ? `<path d="${heartPath(100, 140, 6)}" fill="#ff6f9c" ${st} stroke-width="1.8"/>` : '') +
      held + (BG.front || '') +
      // head
      S.back + `<circle cx="${HEAD.cx}" cy="${HEAD.cy}" r="${HEAD.r}" fill="${headFill}" ${st}/>` + (S.facePatch || '') + (S.head || '') + (S.top || '') +
      blush + (S.face || '') + eyesSvg + mouth +
      hair.front + hat + glasses +
      (fx.front || '') +
    `</g>`;

  return `<svg class="${cls}" viewBox="${vb}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">` +
    `<defs><clipPath id="${id}-c"><rect width="200" height="240" rx="24"/></clipPath></defs>` +
    `<g clip-path="url(#${id}-c)">${bg}${body}</g>${fr}</svg>`;
}

// Which part of the avatar a slot's thumbnail should zoom into.
export const SLOT_VIEW = { species: 'head', hair: 'head', hat: 'head', glasses: 'face', top: 'body', dress: 'full', outfit: 'full',
  bottom: 'legs', shoes: 'legs', jewelry: 'body', wings: 'full', bag: 'body', held: 'full', background: 'full', frame: 'full', pose: 'full', effect: 'full' };

// Preview an item on a given base look (try-on thumbnail).
export function tryOn(base, item) {
  const a = { ...base, mode: 'built', [item.slot]: item.id };
  if (item.slot === 'outfit') { a.dress = null; }
  if (item.slot === 'dress') { a.outfit = null; }
  if (item.slot === 'top' || item.slot === 'bottom') { a.outfit = null; a.dress = null; }
  if (item.slot === 'species') a.skin = item.art.fur || base.skin;
  return a;
}
