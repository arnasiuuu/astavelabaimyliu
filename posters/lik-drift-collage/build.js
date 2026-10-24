// LIK Drift collage posters: HTML/CSS layouts rendered to 2480×3508 PNG.
// Usage: node build.js <photo_dir> [out_dir]
// Needs build/texture-a.png, build/texture-b.png (+ .json) from render-texture.js.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const FONTS = path.resolve(ROOT, '../../.claude/skills/canvas-design/canvas-fonts');
const [photoDir, outDir = ROOT] = process.argv.slice(2);
const photo = name => 'file://' + path.resolve(photoDir, name);
const local = rel => 'file://' + path.resolve(ROOT, rel);

const PHOTOS = {
  pit: '1af573ea-image.jpg',
  sun: 'c4e26ecc-image.jpg',
  green: 'd2e10786-image.jpg',
  pan: 'cf27b767-image.jpg',
  smoke: '5f666b49-image.jpg',
  hero: '54c363d8-image.jpg',
};

const T = {
  tarmac: '#34352f', haze: '#dcddd5', birch: '#d9a93a',
  pine: '#29402f', tail: '#c8352b', sky: '#a7b6ba',
};

// fractal-noise film grain as an inline SVG
const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>`)}")`;

const base = `
  @font-face { font-family: Boldonse; src: url('file://${FONTS}/Boldonse-Regular.ttf'); }
  @font-face { font-family: Instrument; src: url('file://${FONTS}/InstrumentSans-Regular.ttf'); }
  @font-face { font-family: Instrument; font-style: italic; src: url('file://${FONTS}/InstrumentSans-Italic.ttf'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1240px; height: 1754px; overflow: hidden; }
  body { position: relative; font-family: Instrument, sans-serif; -webkit-font-smoothing: antialiased; }
  .photo { object-fit: cover; display: block; filter: saturate(.92) contrast(1.05); }
  .grain { position: absolute; inset: 0; background: ${GRAIN}; background-size: 300px; mix-blend-mode: overlay; opacity: .5; pointer-events: none; }
  .display { font-family: Boldonse; line-height: .9; letter-spacing: -.01em; }
  .caption { font-size: 25px; line-height: 1.35; }
`;

// A: Šonu. Drift-angle slices down a sky → scrub → tarmac gradient.
function posterA() {
  const slices = [
    [PHOTOS.hero, '30% 62%'],
    [PHOTOS.green, '52% 70%'],
    [PHOTOS.pan, '40% 60%'],
    [PHOTOS.sun, '36% 62%'],
  ];
  const h = 238, gap = 34, top = 520, lean = 74;   // lean = horizontal run of the slanted edge
  const items = slices.map(([src, pos], i) => {
    const left = 64 + (slices.length - 1 - i) * 30;
    return `<img class="photo slice" src="${photo(src)}" style="top:${top + i * (h + gap)}px; left:${left}px; object-position:${pos}">`;
  }).join('');
  return `<style>${base}
    body { background: linear-gradient(180deg, ${T.haze} 0%, #cfcdbd 22%, ${T.birch} 50%, #7a6432 68%, ${T.tarmac} 86%); }
    .texture { position: absolute; inset: 0; width: 100%; height: 100%; mix-blend-mode: multiply; opacity: .75; }
    h1 { position: absolute; left: 58px; top: 96px; font-size: 300px; color: ${T.tarmac}; }
    .slice { position: absolute; width: 1022px; height: ${h}px;
             clip-path: polygon(${lean}px 0, 100% 0, calc(100% - ${lean}px) 100%, 0 100%); }
    .sub { position: absolute; left: 66px; top: 418px; font-size: 34px; color: ${T.tarmac}; font-style: italic; }
    footer { position: absolute; left: 64px; right: 64px; bottom: 60px; display: flex; justify-content: space-between; align-items: flex-end; color: ${T.haze}; }
    footer .display { font-size: 54px; }
    footer .caption { text-align: right; max-width: 30ch; }
  </style>
  <img class="texture" src="${local('build/texture-a.png')}">
  <h1 class="display">Šonu</h1>
  <p class="sub">Šonu, dūmuose, rudenį.</p>
  ${items}
  <footer><span class="display">LIK Drift</span><p class="caption">Lietuvos inžinerijos kolegija</p></footer>
  <div class="grain"></div>`;
}

// B: Spurgos. Photos sit in circles placed on the tyre-mark field's own pivots.
function posterB() {
  const pivots = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'build/texture-b.json')));
  const order = [...pivots].sort((a, b) => b.r - a.r);            // biggest orbit gets the hero
  const fill = [[PHOTOS.hero, '24% 60%'], [PHOTOS.green, '53% 68%'], [PHOTOS.pit, '52% 46%']];
  const circles = order.map((p, i) => {
    const r = p.r * 1240 * 0.84;                                     // sit just inside the bright orbit
    const [src, pos] = fill[i];
    return `<img class="photo disc" src="${photo(src)}" style="left:${p.x * 1240 - r}px; top:${p.y * 1754 - r}px; width:${2 * r}px; height:${2 * r}px; object-position:${pos}">`;
  }).join('');
  return `<style>${base}
    body { background: radial-gradient(120% 70% at 30% 35%, #3b5a43 0%, ${T.pine} 35%, ${T.tarmac} 70%, #262722 100%); }
    .texture { position: absolute; inset: 0; width: 100%; height: 100%; mix-blend-mode: screen; opacity: .95; }
    .disc { position: absolute; border-radius: 50%; box-shadow: 0 0 0 6px rgba(220,221,213,.12); }
    h1 { position: absolute; left: 58px; bottom: 214px; font-size: 196px; color: ${T.haze}; }
    footer { position: absolute; left: 64px; right: 64px; bottom: 64px; display: flex; justify-content: space-between; align-items: flex-end; color: ${T.haze}; }
    footer .display { font-size: 54px; color: ${T.birch}; }
    footer .caption { text-align: right; max-width: 34ch; opacity: .85; }
  </style>
  <img class="texture" src="${local('build/texture-b.png')}">
  ${circles}
  <h1 class="display">Spurgos</h1>
  <footer><span class="display">LIK Drift</span><p class="caption">Sukam spurgas, kol lieka tik dūmai.<br>Lietuvos inžinerijos kolegija</p></footer>
  <div class="grain"></div>`;
}

// C: Trispalvė. Asymmetric mosaic of all six frames; the tricolour lives only in the gutters.
function posterC() {
  const cells = [
    [PHOTOS.hero, '1/5', '1/4', '30% 60%'],
    [PHOTOS.pit, '5/7', '1/3', '50% 45%'],
    [PHOTOS.sun, '5/7', '3/5', '36% 60%'],
    [PHOTOS.green, '1/3', '4/7', '52% 66%'],
    [PHOTOS.pan, '3/5', '4/7', '38% 58%'],
    [PHOTOS.smoke, '5/7', '5/7', '66% 64%'],
  ].map(([src, col, row, pos]) =>
    `<div class="cell" style="grid-column:${col}; grid-row:${row}"><img class="photo" src="${photo(src)}" style="object-position:${pos}"></div>`).join('');
  return `<style>${base}
    body { background: ${T.tarmac}; }
    .mosaic { position: absolute; left: 64px; top: 64px; width: 1112px; height: 1290px;
              display: grid; grid-template-columns: repeat(6, 1fr); grid-template-rows: repeat(6, 1fr); gap: 26px;
              background: linear-gradient(180deg, #fdb913 0%, #fdb913 22%, #006a44 46%, #006a44 56%, #c1272d 80%, #a8222a 100%); }
    .cell { position: relative; overflow: hidden; background: ${T.tarmac}; }
    .cell img { width: 100%; height: 100%; }
    /* soft halftone over each frame */
    .cell::after { content: ''; position: absolute; inset: 0; mix-blend-mode: soft-light; opacity: .16;
                   background: radial-gradient(circle, rgba(0,0,0,.9) 30%, transparent 34%) 0 0 / 5px 5px; }
    h1 { position: absolute; left: 58px; bottom: 150px; font-size: 168px; color: ${T.haze}; }
    footer { position: absolute; left: 64px; right: 64px; bottom: 64px; display: flex; justify-content: flex-end; color: ${T.haze}; }
    footer .caption { text-align: right; max-width: 30ch; opacity: .85; }
  </style>
  <div class="mosaic">${cells}</div>
  <h1 class="display">LIK Drift</h1>
  <footer><p class="caption">Šonu, dūmuose, rudenį.<br>Lietuvos inžinerijos kolegija</p></footer>
  <div class="grain"></div>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 2 });
  for (const [name, make] of [['a-sonu', posterA], ['b-spurgos', posterB], ['c-trispalve', posterC]]) {
    const html = path.resolve(ROOT, 'build', `${name}.html`);
    fs.writeFileSync(html, `<!doctype html><html lang="lt"><head><meta charset="utf-8"></head><body>${make()}</body></html>`);
    await page.goto('file://' + html);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    const out = path.resolve(outDir, `lik-drift-collage-${name}.png`);
    await page.screenshot({ path: out });
    console.log('wrote', out);
  }
  await browser.close();
})();
