// Render slip-angle.html headless to PNG.
// Usage: node render-texture.js <p5.min.js> <out.png> [query-string]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const [p5Path, out, query = ''] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.route('**/p5.min.js', r => r.fulfill({ body: fs.readFileSync(p5Path), contentType: 'text/javascript' }));
  await page.route('**/fonts.googleapis.com/**', r => r.abort());
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto('file://' + path.resolve(__dirname, 'slip-angle.html') + (query ? '?' + query : ''));
  await page.waitForFunction(() => document.querySelector('canvas'), null, { timeout: 120000 });
  const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  // pivot positions (fractions of the canvas) so a layout can sit on them
  fs.writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(await page.evaluate(() => window.slipPivots)));
  await browser.close();
  console.log('wrote', out);
})();
