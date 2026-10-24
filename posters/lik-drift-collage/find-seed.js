// Find a Slip Angle seed whose pivots suit the donut poster: circles inside the
// upper 70% of the sheet, clear of the edges and of each other.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [p5Path] = process.argv.slice(2);
  const b = await chromium.launch(); const page = await b.newPage();
  await page.route('**/p5.min.js', r => r.fulfill({ body: fs.readFileSync(p5Path), contentType: 'text/javascript' }));
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  await page.goto('file://' + path.resolve(__dirname, 'slip-angle.html') + '?w=248&h=351&transparent=1');
  await page.waitForFunction(() => window.slipPivots);
  const W = 1240, H = 1754, best = [];
  const nPivots = parseInt(process.argv[3] || 4), maxSeed = parseInt(process.argv[4] || 400);
  for (let seed = 1; seed <= maxSeed; seed++) {
    const pv = await page.evaluate(s => { params.seed = s.seed; params.pivots = s.n; params.travellers = 1; initializeSystem(); return window.slipPivots; }, { seed, n: nPivots });
    const c = pv.map(p => ({ x: p.x * W, y: p.y * H, r: p.r * W }));
    const ok = c.every(a => a.x - a.r > 50 && a.x + a.r < W - 50 && a.y - a.r > 60 && a.y + a.r < H * 0.72) &&
      c.every((a, i) => c.every((o, j) => i >= j || Math.hypot(a.x - o.x, a.y - o.y) > a.r + o.r + 40));
    if (ok) best.push({ seed, big: Math.max(...c.map(a => a.r)), total: c.reduce((s, a) => s + a.r * a.r, 0) });
  }
  best.sort((a, b) => b.total - a.total);
  console.log(JSON.stringify(best.slice(0, 8)));
  await b.close();
})();
