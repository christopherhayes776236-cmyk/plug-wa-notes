const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'thumbnails');
fs.mkdirSync(dir, { recursive: true });

const themes = {
  comp102: { code: 'COMP 102', accent: '#1E40AF', motif: 'sets' },
  soen201: { code: 'SOEN 201', accent: '#1E40AF', motif: 'uml' },
  soen202: { code: 'SOEN 202', accent: '#0D9488', motif: 'web' },
  soen203: { code: 'SOEN 203', accent: '#1E40AF', motif: 'db' },
  soen220: { code: 'SOEN 220', accent: '#0D9488', motif: 'net' },
  soen240: { code: 'SOEN 240', accent: '#1E40AF', motif: 'java' },
};

function motifShapes(motif, accent) {
  if (motif === 'sets') {
    return [
      `<circle cx="380" cy="160" r="70" fill="none" stroke="${accent}" stroke-width="3" opacity="0.55"/>`,
      `<circle cx="460" cy="160" r="70" fill="none" stroke="#0D9488" stroke-width="3" opacity="0.55"/>`,
      `<circle cx="520" cy="210" r="8" fill="${accent}"/>`,
      `<circle cx="340" cy="210" r="8" fill="#0D9488"/>`,
      `<path d="M320 280 L360 240 L400 300 L440 230 L480 290" fill="none" stroke="#0F172A" stroke-width="2.5" opacity="0.35"/>`,
    ].join('');
  }
  if (motif === 'uml') {
    return [
      `<rect x="340" y="100" width="110" height="70" rx="4" fill="#fff" stroke="${accent}" stroke-width="2.5"/>`,
      `<line x1="340" y1="124" x2="450" y2="124" stroke="${accent}" stroke-width="2"/>`,
      `<rect x="470" y="180" width="110" height="70" rx="4" fill="#fff" stroke="#0D9488" stroke-width="2.5"/>`,
      `<line x1="470" y1="204" x2="580" y2="204" stroke="#0D9488" stroke-width="2"/>`,
      `<path d="M395 170 L395 200 L470 215" fill="none" stroke="#0F172A" stroke-width="2" opacity="0.45"/>`,
    ].join('');
  }
  if (motif === 'web') {
    return [
      `<rect x="330" y="95" width="250" height="160" rx="8" fill="#fff" stroke="${accent}" stroke-width="2.5"/>`,
      `<rect x="330" y="95" width="250" height="28" rx="8" fill="${accent}" opacity="0.15"/>`,
      `<circle cx="350" cy="109" r="4" fill="#ef4444"/><circle cx="364" cy="109" r="4" fill="#eab308"/><circle cx="378" cy="109" r="4" fill="#22c55e"/>`,
      `<rect x="350" y="145" width="90" height="12" rx="2" fill="${accent}" opacity="0.35"/>`,
      `<rect x="350" y="170" width="180" height="10" rx="2" fill="#0F172A" opacity="0.15"/>`,
      `<rect x="350" y="190" width="140" height="10" rx="2" fill="#0F172A" opacity="0.12"/>`,
      `<rect x="350" y="215" width="70" height="22" rx="4" fill="#0D9488"/>`,
    ].join('');
  }
  if (motif === 'db') {
    return [
      `<ellipse cx="450" cy="120" rx="90" ry="28" fill="#fff" stroke="${accent}" stroke-width="2.5"/>`,
      `<path d="M360 120 V220 C360 240 540 240 540 220 V120" fill="#fff" stroke="${accent}" stroke-width="2.5"/>`,
      `<ellipse cx="450" cy="160" rx="90" ry="22" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>`,
      `<ellipse cx="450" cy="200" rx="90" ry="22" fill="none" stroke="#0D9488" stroke-width="2" opacity="0.5"/>`,
    ].join('');
  }
  if (motif === 'net') {
    return [
      `<circle cx="400" cy="160" r="14" fill="${accent}"/>`,
      `<circle cx="340" cy="110" r="10" fill="#0D9488"/>`,
      `<circle cx="470" cy="110" r="10" fill="#0D9488"/>`,
      `<circle cx="340" cy="220" r="10" fill="#0F172A" opacity="0.5"/>`,
      `<circle cx="470" cy="220" r="10" fill="#0F172A" opacity="0.5"/>`,
      `<line x1="400" y1="160" x2="340" y2="110" stroke="#0F172A" stroke-width="2" opacity="0.4"/>`,
      `<line x1="400" y1="160" x2="470" y2="110" stroke="#0F172A" stroke-width="2" opacity="0.4"/>`,
      `<line x1="400" y1="160" x2="340" y2="220" stroke="#0F172A" stroke-width="2" opacity="0.4"/>`,
      `<line x1="400" y1="160" x2="470" y2="220" stroke="#0F172A" stroke-width="2" opacity="0.4"/>`,
      `<rect x="520" y="100" width="70" height="14" rx="2" fill="${accent}" opacity="0.7"/>`,
      `<rect x="520" y="122" width="70" height="14" rx="2" fill="${accent}" opacity="0.5"/>`,
      `<rect x="520" y="144" width="70" height="14" rx="2" fill="${accent}" opacity="0.35"/>`,
      `<rect x="520" y="166" width="70" height="14" rx="2" fill="#0D9488" opacity="0.5"/>`,
    ].join('');
  }
  return [
    `<rect x="360" y="100" width="100" height="55" rx="4" fill="#fff" stroke="${accent}" stroke-width="2.5"/>`,
    `<rect x="380" y="175" width="100" height="55" rx="4" fill="#fff" stroke="#0D9488" stroke-width="2.5"/>`,
    `<rect x="480" y="175" width="100" height="55" rx="4" fill="#fff" stroke="#0F172A" stroke-width="2" opacity="0.6"/>`,
    `<path d="M410 155 L410 175" fill="none" stroke="#0F172A" stroke-width="2" opacity="0.45"/>`,
    `<path d="M430 155 L530 175" fill="none" stroke="#0F172A" stroke-width="2" opacity="0.35"/>`,
    `<text x="520" y="140" font-family="Georgia, serif" font-size="42" fill="${accent}" opacity="0.25">{ }</text>`,
  ].join('');
}

function badge(kind) {
  if (kind === 'video') {
    return [
      `<circle cx="560" cy="250" r="28" fill="#0D9488"/>`,
      `<polygon points="552,236 552,264 574,250" fill="#fff"/>`,
    ].join('');
  }
  if (kind === 'slides') {
    return [
      `<rect x="520" y="220" width="70" height="48" rx="4" fill="#fff" stroke="#1E40AF" stroke-width="2" transform="rotate(-6 555 244)"/>`,
      `<rect x="528" y="228" width="70" height="48" rx="4" fill="#EFF6FF" stroke="#1E40AF" stroke-width="2"/>`,
    ].join('');
  }
  if (kind === 'pack') {
    return [
      `<rect x="510" y="215" width="80" height="55" rx="6" fill="#1E40AF"/>`,
      `<rect x="520" y="225" width="28" height="8" rx="2" fill="#fff" opacity="0.9"/>`,
      `<circle cx="560" cy="248" r="10" fill="#0D9488"/>`,
      `<polygon points="557,243 557,253 566,248" fill="#fff"/>`,
    ].join('');
  }
  return '';
}

const items = [
  ['comp102-notes', 'comp102', 'NOTES', 'notes'],
  ['comp102-video', 'comp102', 'VIDEO', 'video'],
  ['comp102-video-slides', 'comp102', 'SLIDES', 'slides'],
  ['comp102-full-pack', 'comp102', 'FULL PACK', 'pack'],
  ['soen201-notes', 'soen201', 'NOTES', 'notes'],
  ['soen201-video', 'soen201', 'VIDEO', 'video'],
  ['soen201-video-slides', 'soen201', 'SLIDES', 'slides'],
  ['soen201-full-pack', 'soen201', 'FULL PACK', 'pack'],
  ['soen202-notes', 'soen202', 'NOTES', 'notes'],
  ['soen202-video', 'soen202', 'VIDEO', 'video'],
  ['soen202-video-slides', 'soen202', 'SLIDES', 'slides'],
  ['soen202-full-pack', 'soen202', 'FULL PACK', 'pack'],
  ['soen203-notes', 'soen203', 'NOTES', 'notes'],
  ['soen203-video', 'soen203', 'VIDEO', 'video'],
  ['soen203-video-slides', 'soen203', 'SLIDES', 'slides'],
  ['soen203-full-pack', 'soen203', 'FULL PACK', 'pack'],
  ['soen220-notes-w12', 'soen220', 'WEEKS 1-2', 'notes'],
  ['soen220-notes-w3', 'soen220', 'WEEK 3', 'notes'],
  ['soen220-video', 'soen220', 'VIDEO', 'video'],
  ['soen220-video-slides', 'soen220', 'SLIDES', 'slides'],
  ['soen220-full-pack', 'soen220', 'FULL PACK', 'pack'],
  ['soen240-notes', 'soen240', 'NOTES', 'notes'],
  ['soen240-video', 'soen240', 'VIDEO', 'video'],
  ['soen240-video-slides', 'soen240', 'SLIDES', 'slides'],
  ['soen240-full-pack', 'soen240', 'FULL PACK', 'pack'],
];

for (const [id, themeKey, label, kind] of items) {
  const t = themes[themeKey];
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F6F4EF"/>
      <stop offset="100%" stop-color="#EEF2FF"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="url(#bg)"/>
  <rect x="0" y="0" width="8" height="360" fill="${t.accent}"/>
  <text x="36" y="56" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="600" fill="#0F172A">${t.code}</text>
  <rect x="36" y="72" width="48" height="3" fill="${t.accent}"/>
  <text x="36" y="110" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="600" letter-spacing="0.08em" fill="${t.accent}">${label}</text>
  ${motifShapes(t.motif, t.accent)}
  ${badge(kind)}
  <text x="36" y="330" font-family="system-ui, sans-serif" font-size="13" fill="#64748B">Plug Wa Notes · Week 1-3</text>
</svg>`;
  fs.writeFileSync(path.join(dir, `${id}.svg`), svg);
}

console.log(`Wrote ${items.length} thumbnails to ${dir}`);
