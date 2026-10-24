// LIK Drift "hero car showcase" posters, rendered to 2480×3508 PNG.
// Usage: node build.js <photo_dir> [out_dir]
// Needs build/e46-car.png, build/e90-car.png, build/sparkles.png from prep.py.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const FONTS = path.resolve(ROOT, '../../.claude/skills/canvas-design/canvas-fonts');
const [photoDir, outDir = ROOT] = process.argv.slice(2);
const photo = name => 'file://' + path.resolve(photoDir, name);
const asset = name => 'file://' + path.resolve(ROOT, 'build', name);

const FLAG = { yellow: '#fdb913', green: '#00a05a', red: '#d9302f' };

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .6 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>`)}")`;

const base = `
  @font-face { font-family: Boldonse; src: url('file://${FONTS}/Boldonse-Regular.ttf'); }
  @font-face { font-family: Tektur; src: url('file://${FONTS}/Tektur-Medium.ttf'); }
  @font-face { font-family: Script; src: url('file://${FONTS}/NothingYouCouldDo-Regular.ttf'); }
  @font-face { font-family: Work; src: url('file://${FONTS}/WorkSans-Regular.ttf'); }
  @font-face { font-family: Work; font-weight: 700; src: url('file://${FONTS}/WorkSans-Bold.ttf'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1240px; height: 1754px; overflow: hidden; }
  body { position: relative; background: #0a0c0e; color: #fff; font-family: Work, sans-serif; -webkit-font-smoothing: antialiased; }
  .abs { position: absolute; }
  .logo { left: 0; right: 0; top: 64px; text-align: center; font-family: Boldonse; font-size: 30px; font-style: oblique 12deg; letter-spacing: .02em; }
  .model { font-family: Tektur; font-size: 34px; letter-spacing: .06em; }
  .mark { font-family: Boldonse; font-size: 300px; line-height: .9; transform: skewX(-12deg); transform-origin: left bottom;
          text-shadow: 0 6px 30px rgba(0,0,0,.35); }
  .swoosh { pointer-events: none; overflow: visible; }
  .neon { font-family: Script; color: #fffbea; }
  .car { display: block; }
  .reflect { transform: scaleY(-1); opacity: .2; filter: blur(1.5px);
             -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,.9), transparent 45%); }
  .streak { height: 6px; border-radius: 6px; mix-blend-mode: screen; transform-origin: left center; }
  .spec h2 { font-family: Tektur; font-weight: 500; font-size: 30px; letter-spacing: .05em; margin-bottom: 14px; }
  .spec p { font-size: 15.5px; line-height: 1.5; text-align: justify; color: rgba(255,255,255,.86); margin-bottom: 12px; hyphens: auto; }
  .footer { left: 0; right: 0; bottom: 62px; text-align: center; font-size: 15px; letter-spacing: .62em; color: rgba(255,255,255,.9); }
  .sparkles { inset: 0; width: 100%; height: 100%; mix-blend-mode: screen; opacity: .75; }
  .grain { inset: 0; background: ${GRAIN}; background-size: 300px; mix-blend-mode: overlay; opacity: .45; }
  .vignette { inset: 0; background: radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,.55) 100%); }
`;

// a loose hand-drawn loop around the wordmark
const swoosh = (w, h, colour = '#fff') => `
  <svg class="swoosh" width="${w}" height="${h}" viewBox="0 0 1000 320">
    <path d="M 30 250 C 140 110, 520 20, 860 40 C 1010 50, 990 150, 820 200 C 600 265, 260 290, 120 262 C 40 246, 70 190, 190 170"
          fill="none" stroke="${colour}" stroke-width="5" stroke-linecap="round" opacity=".92"/>
    <path d="M 640 300 C 760 290, 900 250, 960 200" fill="none" stroke="${colour}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
  </svg>`;

// three light streaks in flag colours, crossing the sheet
const flagStreaks = (x, y, len, angle) => [FLAG.yellow, FLAG.green, FLAG.red].map((c, i) => `
  <div class="abs streak" style="left:${x}px; top:${y + i * 34}px; width:${len - i * 120}px; transform:rotate(${angle}deg);
       background:linear-gradient(90deg, transparent, ${c} 30%, #fff 50%, ${c} 70%, transparent);
       box-shadow:0 0 24px 6px ${c}88, 0 0 60px 14px ${c}44;"></div>`).join('');

function carBlock(src, { left, top, width, ratio, glow }) {
  const h = Math.round(width * ratio);
  return `
  <div class="abs" style="left:${left + width * 0.08}px; top:${top + h - 34}px; width:${width * 0.86}px; height:60px;
       background:radial-gradient(closest-side, rgba(0,0,0,.75), transparent); filter:blur(6px);"></div>
  <img class="abs car reflect" src="${src}" style="left:${left}px; top:${top + h - 8}px; width:${width}px;">
  <img class="abs car" src="${src}" style="left:${left}px; top:${top}px; width:${width}px;
       filter:brightness(1.1) contrast(1.06) drop-shadow(0 18px 22px rgba(0,0,0,.55)) drop-shadow(0 0 26px ${glow});">`;
}

const COPY = {
  e46: [
    'The E46 is the fourth-generation BMW 3 Series, built from 1998 to 2006. Front engine, rear-wheel drive and close to even weight distribution made it a go-to grassroots drift car: affordable, easy to work on and happy to run sideways.',
    'This one runs with LIK Drift, the team carrying the Lietuvos inžinerijos kolegija name. Shot at an autumn practice day, half hidden in its own tyre smoke, tricolour on the B-pillar.',
  ],
  e90: [
    'The E90 is the fifth-generation BMW 3 Series saloon, built from 2005 to 2011. A longer wheelbase and stiffer body than the car it replaced make it a stable, predictable base for a modern drift build.',
    'Finished in bright green with white wheels, this LIK Drift car wears the Lietuvos inžinerijos kolegija logo on its doors. Photographed mid-slide on cracked autumn tarmac, smoke rolling off the rear tyres.',
  ],
};

// E46: tricolour dusk. Giant background = the pit shot's B-pillar flag.
function posterE46() {
  const ratio = 818 / 2244;
  return `<style>${base}
    body { background: radial-gradient(90% 70% at 55% 38%, #33454c 0%, #172126 48%, #090b0d 100%); }
    .detail { left: -1230px; top: -820px; width: 3400px; height: 3400px; object-fit: cover;
              filter: blur(4px) saturate(1.3) brightness(1.05) contrast(1.08); opacity: .9;
              -webkit-mask-image: linear-gradient(to bottom, #000 40%, transparent 78%); }
    .wash { inset: 0; mix-blend-mode: soft-light;
            background: linear-gradient(180deg, #2a8c99 0%, #164b56 40%, #b8652a 72%, #120d08 100%); }
    .frame { left: 150px; top: 610px; width: 940px; height: 520px; border: 2px solid rgba(255,255,255,.75); }
    .fog { mix-blend-mode: screen; filter: blur(40px); border-radius: 50%; }
    .fade { left: 0; right: 0; bottom: 0; height: 640px; background: linear-gradient(to bottom, transparent, rgba(6,8,9,.94) 55%); }
  </style>
  <img class="abs detail" src="${photo('1af573ea-image.jpg')}">
  <div class="abs wash"></div>
  ${flagStreaks(-120, 980, 1700, -14)}
  <div class="abs frame"></div>
  <div class="abs fog" style="left:640px; top:1010px; width:560px; height:300px; background:rgba(220,225,222,.35)"></div>
  <div class="abs logo">LIK DRIFT</div>
  <div class="abs model" style="left:118px; top:262px; color:${FLAG.yellow}">BMW 3 SERIES</div>
  <div class="abs mark" style="left:104px; top:380px;">E46</div>
  <div class="abs" style="left:60px; top:320px;">${swoosh(860, 276)}</div>
  <div class="abs neon" style="left:720px; top:520px; font-size:170px; transform:rotate(-9deg);
       text-shadow:0 0 8px #fff, 0 0 22px ${FLAG.yellow}, 0 0 48px ${FLAG.red}, 0 0 90px ${FLAG.red};">Šonu</div>
  ${carBlock(asset('e46-car.png'), { left: 50, top: 905, width: 1150, ratio, glow: 'rgba(253,185,19,.22)' })}
  <img class="abs sparkles" src="${asset('sparkles.png')}">
  <div class="abs fade"></div>
  <div class="abs spec" style="left:118px; top:1446px; width:640px;">
    <h2 style="color:#fff">BMW E46 / 3 SERIES</h2>
    ${COPY.e46.map(p => `<p>${p}</p>`).join('')}
  </div>
  <div class="abs footer">LIK DRIFT &nbsp; LIETUVOS INŽINERIJOS KOLEGIJA</div>
  <div class="abs vignette"></div>
  <div class="abs grain"></div>`;
}

// E90: green on gold. Giant background = the same photo, plus a huge ghost of the car.
function posterE90() {
  const ratio = 874 / 2106;
  return `<style>${base}
    .bgphoto { inset: -60px; width: calc(100% + 120px); height: calc(100% + 120px); object-fit: cover; object-position: 50% 60%;
               filter: blur(5px) saturate(1.35) brightness(.82); transform: scale(1.12); }
    .wash { inset: 0; mix-blend-mode: soft-light;
            background: linear-gradient(170deg, #f7e7a6 0%, #3fae5d 38%, #0d3a22 70%, #050806 100%); }
    .ghost { left: -620px; top: 120px; width: 3300px; opacity: .42; filter: blur(7px) saturate(1.3) brightness(1.1);
             -webkit-mask-image: linear-gradient(100deg, transparent 38%, #000 58%, #000 85%, transparent 100%); }
    .bar { left: 222px; top: 0; width: 82px; height: 1320px; background: linear-gradient(to bottom, rgba(64,214,110,.85), rgba(64,214,110,0)); mix-blend-mode: screen; }
    .line { left: 318px; top: 0; width: 5px; height: 1250px; background: linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,255,255,0)); }
    .frame { left: 330px; top: 590px; width: 790px; height: 560px; border: 2px solid rgba(255,255,255,.8); }
    .road { height: 16px; background: #ffd23a; transform-origin: left center; box-shadow: 0 0 18px rgba(255,210,58,.6); }
    .road2 { height: 4px; background: rgba(255,255,255,.85); transform-origin: left center; }
    .sun { left: 840px; top: 60px; width: 520px; height: 520px; border-radius: 50%; mix-blend-mode: screen;
           background: radial-gradient(closest-side, #fffbe0 0%, rgba(255,230,140,.75) 18%, rgba(255,200,80,.25) 45%, transparent 100%); }
    .flare { left: 520px; top: 318px; width: 920px; height: 3px; mix-blend-mode: screen;
             background: linear-gradient(90deg, transparent, rgba(255,240,200,.9), transparent); filter: blur(1px); }
    .ghostdot { border-radius: 50%; mix-blend-mode: screen; }
    .fade { left: 0; right: 0; bottom: 0; height: 600px; background: linear-gradient(to bottom, transparent, rgba(4,8,5,.92) 55%); }
  </style>
  <img class="abs bgphoto" src="${photo('d2e10786-image.jpg')}">
  <div class="abs wash"></div>
  <img class="abs ghost" src="${asset('e90-car.png')}">
  <div class="abs bar"></div>
  <div class="abs line"></div>
  <div class="abs sun"></div>
  <div class="abs flare"></div>
  <div class="abs ghostdot" style="left:760px; top:470px; width:70px; height:70px; background:radial-gradient(closest-side, rgba(140,255,170,.35), transparent)"></div>
  <div class="abs ghostdot" style="left:640px; top:640px; width:120px; height:120px; background:radial-gradient(closest-side, rgba(255,220,120,.22), transparent)"></div>
  <div class="abs ghostdot" style="left:470px; top:900px; width:46px; height:46px; background:radial-gradient(closest-side, rgba(255,255,255,.3), transparent)"></div>
  <div class="abs frame"></div>
  <div class="abs road" style="left:-40px; top:1610px; width:1500px; transform:rotate(-17deg);"></div>
  <div class="abs road2" style="left:-40px; top:1470px; width:1500px; transform:rotate(-17deg);"></div>
  <div class="abs logo">LIK DRIFT</div>
  <div class="abs model" style="left:118px; top:200px; color:#f2fff5; text-shadow:0 0 18px rgba(25,194,90,.9), 0 2px 8px rgba(0,0,0,.45)">BMW 3 SERIES</div>
  <div class="abs mark" style="left:104px; top:318px;">E90</div>
  <div class="abs" style="left:60px; top:258px;">${swoosh(860, 276)}</div>
  <div class="abs neon" style="left:730px; top:440px; font-size:160px; transform:rotate(-8deg);
       text-shadow:0 0 8px #fff, 0 0 22px #6ff09a, 0 0 50px #19c25a, 0 0 90px #0a8f3c;">Žalia</div>
  ${carBlock(asset('e90-car.png'), { left: 60, top: 880, width: 1120, ratio, glow: 'rgba(111,240,154,.25)' })}
  <img class="abs sparkles" src="${asset('sparkles.png')}" style="opacity:.55">
  <div class="abs fade"></div>
  <div class="abs spec" style="right:118px; top:1446px; width:620px; text-align:right;">
    <h2 style="color:#6ff09a">BMW E90 / 3 SERIES</h2>
    ${COPY.e90.map(p => `<p style="text-align:justify; text-align-last:right">${p}</p>`).join('')}
  </div>
  <div class="abs footer">LIK DRIFT &nbsp; LIETUVOS INŽINERIJOS KOLEGIJA</div>
  <div class="abs vignette"></div>
  <div class="abs grain"></div>`;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 2 });
  for (const [name, make] of [['e46', posterE46], ['e90', posterE90]]) {
    const html = path.resolve(ROOT, 'build', `${name}.html`);
    fs.writeFileSync(html, `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>${make()}</body></html>`);
    await page.goto('file://' + html);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');
    const out = path.resolve(outDir, `lik-drift-showcase-${name}.png`);
    await page.screenshot({ path: out });
    console.log('wrote', out);
  }
  await browser.close();
})();
