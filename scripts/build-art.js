'use strict';
// Generates the pixel-art SVGs in assets/. Run: npm run build
const fs = require('fs');
const path = require('path');

const PALETTE = {
  coal: '#14110f',
  iron: '#2b2a33',
  steel: '#5b6070',
  ember: '#e8692c',
  flame: '#f4a340',
  brass: '#d9b45b',
  teal: '#4fd1c5',
  bone: '#efe6d2',
};

// 5x7 bitmap font, rows top to bottom.
const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

function textRects(text, x0, y0, px, fill) {
  let out = '';
  let x = x0;
  for (const ch of text) {
    const g = FONT[ch];
    if (!g) throw new Error(`no glyph: ${ch}`);
    g.forEach((row, r) => [...row].forEach((bit, c) => {
      if (bit === '1') out += `<rect x="${x + c * px}" y="${y0 + r * px}" width="${px}" height="${px}" fill="${fill}"/>`;
    }));
    x += 6 * px;
  }
  return out;
}
const textWidth = (text, px) => text.length * 6 * px - px;

// Sprite: rows of palette keys, '.' = transparent.
function spriteRects(rows, keys, x0, y0, px) {
  let out = '';
  rows.forEach((row, r) => [...row].forEach((k, c) => {
    if (k !== '.') out += `<rect x="${x0 + c * px}" y="${y0 + r * px}" width="${px}" height="${px}" fill="${PALETTE[keys[k]]}"/>`;
  }));
  return out;
}

const ANVIL = [
  '................',
  '................',
  '.........ss.....',
  '........sbbs....',
  '.......sbbs.....',
  '......sbbs......',
  '.....s.s........',
  '....s...........',
  '..iiiiiiiiiiii..',
  'iiwwwwwwwwwwwwi.',
  '.iiiiiiiiiiiiii.',
  '.....iiiiiii....',
  '......iiiii.....',
  '.....iiiiiii....',
  '....iiiiiiiii...',
  '................',
];
const ANVIL_KEYS = { s: 'steel', b: 'brass', i: 'iron', w: 'steel' };

// Owner's 16-bit character from IronBuild, embedded so the banner is one self-contained file.
const AVATAR = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ozzid.png')).toString('base64');

const TITLE = 'DEMIRCRAFTCO';
const TAGLINE = 'WHERE THE MIND MEETS THE CRAFT';

function banner() {
  const W = 840, H = 200, px = 6;
  const tx = 176, ty = 52;
  const sparks = [
    [118, 92, 0], [132, 80, 0.4], [104, 84, 0.8], [140, 98, 1.2], [96, 100, 1.6],
  ].map(([x, y, d]) => `<rect class="spark" style="animation-delay:${d}s" x="${x}" y="${y}" width="4" height="4" fill="${PALETTE.flame}"/>`).join('');
  const swatches = ['coal', 'iron', 'steel', 'ember', 'flame', 'brass', 'teal', 'bone']
    .map((k, i) => `<rect x="${i * (W / 8)}" y="${H - 10}" width="${W / 8}" height="10" fill="${PALETTE[k]}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-label="DemirCraftCo — where the mind meets the craft">
<style>
.spark{animation:rise 2s steps(6) infinite;opacity:0}
@keyframes rise{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(0,-36px)}}
.glow{animation:glow 1.6s steps(2) infinite}
@keyframes glow{50%{fill:${PALETTE.flame}}}
</style>
<rect width="${W}" height="${H}" fill="${PALETTE.coal}"/>
<rect x="8" y="8" width="${W - 16}" height="${H - 26}" fill="none" stroke="${PALETTE.iron}" stroke-width="4"/>
${spriteRects(ANVIL, ANVIL_KEYS, 40, 40, 8)}
<rect class="glow" x="96" y="104" width="40" height="8" fill="${PALETTE.ember}"/>
${sparks}
${textRects(TITLE, tx, ty, px, PALETTE.brass)}
${textRects(TITLE, tx - 3, ty - 3, px, PALETTE.bone)}
${textRects(TAGLINE, tx, ty + 70, 3, PALETTE.teal)}
<image x="${W - 108}" y="20" width="94" height="158" style="image-rendering:pixelated" href="data:image/png;base64,${AVATAR}"/>
${swatches}
</svg>
`;
}

const ICONS = {
  growmanac: { keys: { g: 'teal', s: 'steel' }, rows: [
    '.....gg.', '...gggg.', '..ggggg.', '.gggg.g.', '.ggg.g..', '..s.....', '.s......', '........'] },
  coingarden: { keys: { b: 'brass', f: 'flame' }, rows: [
    '..bbbb..', '.bffffb.', 'bffbbffb', 'bffffffb', 'bffbbffb', '.bffffb.', '..bbbb..', '........'] },
  burr: { keys: { f: 'flame', e: 'ember' }, rows: [
    '...f....', '.f...f..', '...ff...', '..ffff..', 'eeeeeeee', '........', '.e.e.e..', '........'] },
  distillio: { keys: { t: 'teal', s: 'steel' }, rows: [
    '..sss...', '...s....', '...s....', '..tts...', '.tttts..', 'ttttttt.', '.ttttt..', '........'] },
  ironbuild: { keys: { e: 'ember' }, rows: [
    '...ee...', '...ee...', 'e..ee..e', '.eeeeee.', '...ee...', '..e..e..', '.e....e.', '........'] },
};

function icon({ rows, keys }) {
  const px = 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">${spriteRects(rows, keys, 0, 0, px)}</svg>\n`;
}

// File name -> SVG contents for everything this script owns in assets/.
function renderAssets() {
  const files = { 'banner.svg': banner() };
  for (const [name, def] of Object.entries(ICONS)) files[`${name}.svg`] = icon(def);
  return files;
}

module.exports = { PALETTE, FONT, ICONS, BANNER_TEXT: [TITLE, TAGLINE], renderAssets };

if (require.main === module) {
  const out = path.join(__dirname, '..', 'assets');
  for (const [name, svg] of Object.entries(renderAssets())) fs.writeFileSync(path.join(out, name), svg);
  console.log('ok', fs.readdirSync(out).join(' '));
}
