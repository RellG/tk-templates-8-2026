/**
 * Collects style URLs from the index in the site's own "newest" order.
 *
 * The index uses infinite scroll, so this is the one step that needs a real
 * browser. Output feeds scrape-design-tokens.js, which fetches pages directly.
 *
 * Usage: node collect-style-urls.js [count] > style-urls.json
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://styles.refero.design/?sort=newest';
const TARGET = Number(process.argv[2]) || 150;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

const urls = [];
const seen = new Set();
let stagnant = 0;

while (urls.length < TARGET && stagnant < 5) {
  const found = await page.$$eval('a[href*="/style/"]', els => els.map(e => e.href));
  const before = urls.length;
  for (const u of found) {
    if (seen.has(u)) continue;
    seen.add(u);
    urls.push(u);
  }
  if (urls.length === before) stagnant++;
  else stagnant = 0;

  console.error(`collected ${urls.length}/${TARGET}`);
  if (urls.length >= TARGET) break;

  await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
  await page.waitForTimeout(1800);
}

await browser.close();
process.stdout.write(JSON.stringify(urls.slice(0, TARGET), null, 2));
