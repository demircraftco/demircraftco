'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { PALETTE, FONT, ICONS, BANNER_TEXT, renderAssets } = require('../scripts/build-art.js');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');

test('every icon sprite is 8x8 and uses only palette colors', () => {
  for (const [name, { rows, keys }] of Object.entries(ICONS)) {
    assert.equal(rows.length, 8, `${name}: row count`);
    for (const row of rows) assert.equal(row.length, 8, `${name}: row "${row}"`);
    for (const ch of new Set(rows.join(''))) {
      if (ch === '.') continue;
      assert.ok(ch in keys, `${name}: key "${ch}" has no color`);
      assert.ok(keys[ch] in PALETTE, `${name}: "${keys[ch]}" is not a palette color`);
    }
  }
});

test('every font glyph is 5x7 bits', () => {
  for (const [ch, rows] of Object.entries(FONT)) {
    assert.equal(rows.length, 7, `glyph "${ch}"`);
    for (const row of rows) assert.match(row, /^[01]{5}$/, `glyph "${ch}"`);
  }
});

test('every banner character has a glyph', () => {
  for (const text of BANNER_TEXT) {
    for (const ch of text) assert.ok(ch in FONT, `no glyph for "${ch}" in "${text}"`);
  }
});

test('rendered SVGs are well-formed and the banner embeds the avatar', () => {
  const files = renderAssets();
  assert.deepEqual(Object.keys(files).sort(), ['banner.svg', ...Object.keys(ICONS).map((n) => `${n}.svg`)].sort());
  for (const [name, svg] of Object.entries(files)) {
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*viewBox="0 0 \d+ \d+"/, name);
    assert.match(svg, /<\/svg>\n$/, name);
    assert.equal((svg.match(/<svg[\s>]/g) || []).length, 1, `${name}: one root element`);
  }
  assert.ok(files['banner.svg'].includes('href="data:image/png;base64,'), 'banner embeds avatar');
});

test('committed assets match the generator output', () => {
  for (const [name, svg] of Object.entries(renderAssets())) {
    assert.equal(fs.readFileSync(path.join(ASSETS, name), 'utf8'), svg, `${name} is stale or hand-edited; run npm run build`);
  }
});

test('every assets/ path referenced in the README exists', () => {
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const refs = [...readme.matchAll(/assets\/[\w.-]+/g)].map((m) => m[0]);
  assert.ok(refs.length > 0, 'README has asset references');
  for (const ref of refs) assert.ok(fs.existsSync(path.join(ROOT, ref)), `${ref} missing`);
});
