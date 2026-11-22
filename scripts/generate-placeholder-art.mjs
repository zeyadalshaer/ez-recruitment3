// Generates the on-brand placeholder graphics used until real photography is uploaded.
// Run with:  npm run art
// Output:    src/assets/uploads/*.svg  and  public/ (favicon + social image)
//
// These are intentionally abstract (navy + teal). Replace any of them with a real photo
// from /admin: the site picks up the new image automatically.

import { writeFileSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const W = 1600, H = 1000;
const OUT = new URL('../src/assets/uploads/', import.meta.url);
const PUB = new URL('../public/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// Small deterministic random generator so re-running produces identical files.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const line = (o = 0.25, w = 1.5, c = '#fff') => `stroke="${c}" stroke-opacity="${o}" stroke-width="${w}" fill="none"`;
const f = (n) => Math.round(n * 10) / 10;

function wrap(inner, glow = [0.8, 0.3]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c3d6b"/><stop offset="1" stop-color="#0c1f38"/></linearGradient>
<radialGradient id="glow" cx="${glow[0]}" cy="${glow[1]}" r=".65"><stop offset="0" stop-color="#159A9A" stop-opacity=".6"/><stop offset="1" stop-color="#159A9A" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
${inner}
</svg>`;
}

function globe(cx = 1050, cy = 500, r = 400, seed = 7) {
  const rand = rng(seed);
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" ${line(0.35, 2)}/>`;
  for (const k of [0.3, 0.6, 0.85]) s += `<ellipse cx="${cx}" cy="${cy}" rx="${f(r * k)}" ry="${r}" ${line(0.18)}/>`;
  for (const t of [-0.66, -0.33, 0, 0.33, 0.66]) {
    const q = Math.sqrt(1 - t * t);
    s += `<ellipse cx="${cx}" cy="${cy + r * t}" rx="${f(r * q)}" ry="${f(r * q * 0.16)}" ${line(0.18)}/>`;
  }
  const pts = Array.from({ length: 9 }, () => {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * r * 0.85;
    return [f(cx + Math.cos(a) * d), f(cy + Math.sin(a) * d)];
  });
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 3) % pts.length];
    s += `<path d="M${x1} ${y1} Q${f((x1 + x2) / 2)} ${f(Math.min(y1, y2) - 90)} ${x2} ${y2}" ${line(0.75, 2, '#4fd1c5')}/>`;
  }
  for (const [x, y] of pts) s += `<circle cx="${x}" cy="${y}" r="9" fill="#159A9A" stroke="#fff" stroke-width="2.5"/>`;
  return s;
}

function network(seed = 3) {
  const rand = rng(seed), fx = 1120, fy = 500;
  let s = '';
  for (let i = 0; i < 46; i++) {
    const x = 90 + rand() * 780, y = 90 + rand() * 820;
    s += `<path d="M${f(x)} ${f(y)} Q${f((x + fx) / 2)} ${f(y + (rand() - 0.5) * 200)} ${fx} ${fy}" ${line(0.16)}/>`;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + rand() * 4)}" fill="#fff" fill-opacity=".55"/>`;
  }
  s += `<circle cx="${fx}" cy="${fy}" r="150" ${line(0.2, 2)}/><circle cx="${fx}" cy="${fy}" r="95" ${line(0.35, 2)}/><circle cx="${fx}" cy="${fy}" r="46" fill="#159A9A" stroke="#fff" stroke-width="3"/>`;
  return s;
}

function lens() {
  let s = '';
  const cx = 1010, cy = 480, r = 250;
  for (let x = 100; x <= 1500; x += 50) for (let y = 100; y <= 900; y += 50) {
    const inside = Math.hypot(x - cx, y - cy) < r;
    s += `<circle cx="${x}" cy="${y}" r="${inside ? 7 : 3.5}" fill="${inside ? '#4fd1c5' : '#fff'}" fill-opacity="${inside ? 0.95 : 0.28}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" ${line(0.8, 5)}/><path d="M${cx + 180} ${cy + 180} L${cx + 380} ${cy + 380}" ${line(0.8, 16)} stroke-linecap="round"/>`;
  return s;
}

function filters() {
  const rand = rng(11);
  let s = '';
  for (let i = 0; i < 36; i++) {
    const x = 380 + i * 22, tx = 800 + (i - 18) * 7;
    s += `<path d="M${x} 90 L${tx} 910" ${line(0.17)}/>`;
  }
  for (const [y, w] of [[250, 620], [430, 470], [610, 320], [790, 190]]) {
    s += `<path d="M${800 - w / 2} ${y} H${800 + w / 2}" ${line(0.8, 3, '#4fd1c5')}/>`;
    for (let k = 0; k < 7; k++) s += `<circle cx="${f(800 - w / 2 + rand() * w)}" cy="${y - 22 - rand() * 60}" r="5" fill="#fff" fill-opacity=".5"/>`;
  }
  s += `<circle cx="800" cy="905" r="26" fill="#159A9A" stroke="#fff" stroke-width="3"/>`;
  return s;
}

function steps() {
  const pts = [[200, 760], [430, 600], [660, 690], [890, 470], [1120, 560], [1380, 300]];
  let s = `<path d="M${pts.map((p) => p.join(' ')).join(' L')}" ${line(0.55, 3, '#4fd1c5')} stroke-dasharray="2 14" stroke-linecap="round"/>`;
  pts.forEach(([x, y], i) => {
    s += `<circle cx="${x}" cy="${y}" r="${46 + i * 3}" ${line(0.2, 2)}/><circle cx="${x}" cy="${y}" r="${i === pts.length - 1 ? 30 : 22}" fill="${i === pts.length - 1 ? '#159A9A' : '#fff'}" fill-opacity="${i === pts.length - 1 ? 1 : 0.85}" stroke="#fff" stroke-width="3"/>`;
  });
  return s;
}

function bars(seed = 5) {
  const rand = rng(seed);
  let s = `<path d="M110 820 H1490" ${line(0.45, 2)}/>`;
  for (let i = 0; i < 9; i++) {
    const h = 150 + i * 62 + rand() * 40, x = 190 + i * 140, hot = i >= 6;
    s += `<rect x="${x}" y="${820 - h}" width="86" height="${h}" fill="${hot ? '#159A9A' : '#fff'}" fill-opacity="${hot ? 0.9 : 0.12}" stroke="#fff" stroke-opacity=".3"/>`;
  }
  s += `<path d="M230 640 L520 560 L800 480 L1080 330 L1380 190" ${line(0.7, 3, '#4fd1c5')}/>`;
  return s;
}

function panels() {
  return `<rect x="820" y="140" width="520" height="660" fill="#fff" fill-opacity=".06" stroke="#fff" stroke-opacity=".3" transform="rotate(-4 1080 470)"/>
<rect x="940" y="220" width="520" height="660" fill="#159A9A" fill-opacity=".55" stroke="#fff" stroke-opacity=".35" transform="rotate(3 1200 550)"/>
<rect x="700" y="300" width="460" height="560" fill="#0c1f38" fill-opacity=".55" stroke="#fff" stroke-opacity=".4"/>` +
    [0, 1, 2, 3, 4].map((i) => `<path d="M750 ${380 + i * 70} H${1050 - (i % 2) * 90}" ${line(0.45, 3)}/>`).join('');
}

function production() {
  let s = `<path d="M0 640 H${W}" ${line(0.5, 3)}/><path d="M0 690 H${W}" ${line(0.3, 2)}/>`;
  for (let x = 40; x < W; x += 80) s += `<circle cx="${x}" cy="715" r="14" ${line(0.3, 2)}/>`;
  [140, 470, 800, 1130, 1420].forEach((x, i) => {
    s += `<rect x="${x}" y="${i % 2 ? 530 : 520}" width="${i % 2 ? 130 : 150}" height="${i % 2 ? 110 : 120}" fill="${i === 2 ? '#159A9A' : '#fff'}" fill-opacity="${i === 2 ? 0.85 : 0.12}" stroke="#fff" stroke-opacity=".4"/>`;
  });
  s += `<circle cx="1180" cy="250" r="190" ${line(0.2, 44)} stroke-dasharray="20 14"/><circle cx="1180" cy="250" r="110" ${line(0.4, 3)}/><circle cx="1180" cy="250" r="34" fill="#159A9A" stroke="#fff" stroke-width="3"/>`;
  s += `<circle cx="640" cy="230" r="110" ${line(0.14, 30)} stroke-dasharray="14 12"/>`;
  return s;
}

function scaffold() {
  let s = '';
  for (let x = 160; x <= 1440; x += 160) s += `<path d="M${x} 80 V920" ${line(0.28, 2)}/>`;
  for (let y = 120; y <= 920; y += 160) s += `<path d="M160 ${y} H1440" ${line(0.28, 2)}/>`;
  [[320, 280], [640, 440], [960, 280], [1120, 600], [480, 600]].forEach(([x, y], i) => {
    s += `<path d="M${x} ${y} l160 160 M${x + 160} ${y} l-160 160" ${line(0.5, 3, '#4fd1c5')}/>`;
    if (i === 1) s += `<rect x="${x}" y="${y}" width="160" height="160" fill="#159A9A" fill-opacity=".55"/>`;
  });
  return s;
}

function routes() {
  let s = '';
  for (let x = 100; x <= 1500; x += 70) for (let y = 100; y <= 900; y += 70) s += `<circle cx="${x}" cy="${y}" r="2.5" fill="#fff" fill-opacity=".22"/>`;
  const paths = [['M180 760 C500 760 520 420 840 420 S1200 240 1440 240', 0.85], ['M240 300 C560 300 640 620 960 620 S1260 760 1460 700', 0.6], ['M180 520 C420 520 620 520 840 420', 0.4]];
  for (const [d, o] of paths) s += `<path d="${d}" ${line(o, 4, '#4fd1c5')} stroke-dasharray="3 14" stroke-linecap="round"/>`;
  for (const [x, y, big] of [[180, 760], [840, 420, 1], [1440, 240], [240, 300], [960, 620], [1460, 700]]) {
    s += `<circle cx="${x}" cy="${y}" r="${big ? 24 : 15}" fill="#159A9A" stroke="#fff" stroke-width="3"/>`;
  }
  return s;
}

function arches() {
  let s = '';
  const cx = 800;
  for (let r = 520; r >= 120; r -= 80) {
    const top = 940 - r * 0.9;
    const d = `M${cx - r} 960 V${top} A${r} ${r} 0 0 1 ${cx + r} ${top} V960`;
    s += `<path d="${d}" ${r === 120 ? `stroke="#fff" stroke-opacity=".3" stroke-width="2.5" fill="#159A9A" fill-opacity=".6"` : line(0.14 + (520 - r) / 1800, 2.5)}/>`;
  }
  return s;
}

function contours() {
  let s = '';
  for (let i = 0; i < 24; i++) {
    const y = 120 + i * 36, a = 50 + (i % 5) * 18, teal = i === 9 || i === 15;
    s += `<path d="M-20 ${y} C 380 ${y - a}, 760 ${y + a}, 1160 ${y - a / 2} S 1500 ${y + a / 2} 1640 ${y}" ${line(teal ? 0.85 : 0.2, teal ? 3 : 1.6, teal ? '#4fd1c5' : '#fff')}/>`;
  }
  return s;
}

function facade() {
  const rand = rng(21);
  let s = '';
  for (let c = 0; c < 9; c++) for (let r = 0; r < 6; r++) {
    const hot = rand() < 0.28;
    s += `<rect x="${180 + c * 140}" y="${110 + r * 135}" width="104" height="100" fill="${hot ? '#159A9A' : '#fff'}" fill-opacity="${hot ? 0.8 : 0.08}" stroke="#fff" stroke-opacity=".3"/>`;
  }
  return s;
}

const art = {
  'hero': wrap(globe(1080, 500, 410, 7) + `<rect x="120" y="760" width="260" height="6" fill="#159A9A"/>`),
  'about': wrap(panels(), [0.75, 0.5]),
  'service-international-recruitment': wrap(globe(1000, 500, 380, 13)),
  'service-workforce-sourcing': wrap(network(3)),
  'service-candidate-identification': wrap(lens(), [0.62, 0.48]),
  'service-screening': wrap(filters(), [0.5, 0.2]),
  'service-coordination': wrap(steps(), [0.85, 0.25]),
  'service-workforce-planning': wrap(bars(5), [0.85, 0.15]),
  'industry-manufacturing': wrap(production()),
  'industry-construction': wrap(scaffold(), [0.5, 0.6]),
  'industry-logistics': wrap(routes(), [0.3, 0.8]),
  'industry-hospitality': wrap(arches(), [0.5, 0.9]),
  'industry-agriculture': wrap(contours(), [0.2, 0.2]),
  'industry-facility-management': wrap(facade(), [0.8, 0.8]),
  'blog-international-hiring': wrap(globe(520, 520, 360, 29), [0.3, 0.4]),
  'blog-requirement-brief': wrap(bars(17), [0.2, 0.2]),
  'blog-recruitment-partner': wrap(filters(), [0.8, 0.8]),
};
for (const [name, svg] of Object.entries(art)) writeFileSync(new URL(`${name}.svg`, OUT), svg);

// ---- Brand mark, favicon and social image ----
const mark = (bg = '#142D4E') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${bg}"/><g fill="#fff"><rect x="14" y="16" width="4" height="32"/><rect x="14" y="16" width="16" height="4"/><rect x="14" y="30" width="12" height="4"/><rect x="14" y="44" width="16" height="4"/></g><g fill="#159A9A"><rect x="34" y="16" width="16" height="4"/><rect x="34" y="44" width="16" height="4"/><polygon points="46,20 50,20 38,44 34,44"/></g></svg>`;
writeFileSync(new URL('favicon.svg', PUB), mark());
await sharp(Buffer.from(mark())).resize(32, 32).png().toFile(new URL('favicon-32.png', PUB).pathname);
await sharp(Buffer.from(mark())).resize(180, 180).png().toFile(new URL('apple-touch-icon.png', PUB).pathname);

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c3d6b"/><stop offset="1" stop-color="#0c1f38"/></linearGradient>
<radialGradient id="o" cx=".85" cy=".3" r=".7"><stop offset="0" stop-color="#159A9A" stop-opacity=".6"/><stop offset="1" stop-color="#159A9A" stop-opacity="0"/></radialGradient></defs>
<rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#o)"/>
<g transform="translate(760 70) scale(.9)" opacity=".9">${globe(300, 300, 280, 7).replace(/stroke-width="1.5"/g, 'stroke-width="1.5"')}</g>
<rect x="80" y="350" width="120" height="6" fill="#159A9A"/>
<text x="80" y="300" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="#7fe0d6" letter-spacing="4">INTERNATIONAL RECRUITMENT &amp; WORKFORCE SOLUTIONS</text>
<text x="80" y="450" font-family="DejaVu Serif, Georgia, serif" font-size="84" fill="#fff" font-weight="bold">EZ Recruitment</text>
<text x="80" y="520" font-family="DejaVu Sans, Arial, sans-serif" font-size="34" fill="#D5DDE7">Your Partner in Workforce Recruitment.</text>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(new URL('og-default.png', PUB).pathname);

console.log(`Generated ${Object.keys(art).length} images, favicon and social image.`);
