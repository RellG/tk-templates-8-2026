/**
 * Extracts published DESIGN.md documents from styles.refero.design.
 *
 * Each style page server-renders its complete DESIGN.md inside a single
 * <pre><code> block, so no browser automation is needed — the markdown is
 * present in the initial HTML response.
 *
 * Usage: node scrape-design-tokens.js [count]
 */

import fs from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://styles.refero.design/?sort=newest';
const OUTPUT_DIR = path.resolve('./refero-design-systems');
const URL_FILE = path.resolve('./style-urls.json');
const TARGET_COUNT = Number(process.argv[2]) || 10;
const DELAY_MS = 2000;
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const CODE_BLOCK = /<code class="text-foreground whitespace-pre-wrap break-words">([\s\S]*?)<\/code>/;
const H1 = /<h1[^>]*>([\s\S]*?)<\/h1>/;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function decodeEntities(str) {
  return str
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, '')).trim();
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'unnamed_style';
}

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

/**
 * Prefers style-urls.json (written by collect-style-urls.js, which scrolls the
 * index and so sees past the first 20). Falls back to the static index HTML.
 */
async function collectStyleUrls() {
  try {
    const cached = JSON.parse(await fs.readFile(URL_FILE, 'utf-8'));
    if (Array.isArray(cached) && cached.length) {
      console.log(`Using ${URL_FILE} (${cached.length} URLs).`);
      return cached;
    }
  } catch {
    // no cache — fall through to the static index
  }

  const html = await get(BASE_URL);
  const urls = [];
  const seen = new Set();
  for (const m of html.matchAll(/href="(\/style\/[0-9a-f-]+)"/g)) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    urls.push(`https://styles.refero.design${m[1]}`);
  }
  console.log(`Using static index (${urls.length} URLs).`);
  return urls;
}

/** Maps already-extracted URLs to their folder, so a rerun resumes cleanly. */
async function existingUrls() {
  const done = new Set();
  let dirs = [];
  try {
    dirs = await fs.readdir(OUTPUT_DIR);
  } catch {
    return done;
  }
  for (const d of dirs) {
    try {
      const s = JSON.parse(
        await fs.readFile(path.join(OUTPUT_DIR, d, 'source.json'), 'utf-8')
      );
      if (s.url) done.add(s.url);
    } catch {
      // incomplete folder — will be re-fetched
    }
  }
  return done;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Output: ${OUTPUT_DIR}`);

  const urls = await collectStyleUrls();
  const targets = urls.slice(0, TARGET_COUNT);
  const done = await existingUrls();
  const todo = targets.filter(u => !done.has(u));
  console.log(
    `${targets.length} target(s); ${targets.length - todo.length} already present, ${todo.length} to fetch.\n`
  );

  const failures = [];

  for (const url of todo) {
    // Number by position in the full ordering so folders stay stable across runs.
    const index = targets.indexOf(url) + 1;
    let html;
    try {
      html = await get(url);
    } catch (err) {
      console.error(`[${index}/${targets.length}] FAILED ${url}: ${err.message}`);
      failures.push({ url, reason: err.message });
      await sleep(DELAY_MS);
      continue;
    }

    const codeMatch = html.match(CODE_BLOCK);
    const h1Match = html.match(H1);
    const title = h1Match ? stripTags(h1Match[1]) : 'Unknown';

    if (!codeMatch) {
      console.error(`[${index}/${targets.length}] NO DESIGN.md block: ${title}`);
      failures.push({ url, title, reason: 'no <pre><code> block found' });
      await sleep(DELAY_MS);
      continue;
    }

    const markdown = decodeEntities(codeMatch[1]);
    const folder = path.join(
      OUTPUT_DIR,
      `${String(index).padStart(3, '0')}_${slugify(title)}`
    );
    await fs.mkdir(folder, { recursive: true });

    // The published markdown, verbatim.
    await fs.writeFile(path.join(folder, 'DESIGN.md'), markdown, 'utf-8');

    // Provenance, kept separate so DESIGN.md stays byte-faithful to the source.
    await fs.writeFile(
      path.join(folder, 'source.json'),
      JSON.stringify(
        { title, url, retrievedAt: new Date().toISOString(), bytes: markdown.length },
        null,
        2
      ),
      'utf-8'
    );

    console.log(
      `[${index}/${targets.length}] ${title} → ${path.basename(folder)} (${markdown.length} bytes)`
    );
    await sleep(DELAY_MS);
  }

  if (failures.length) {
    console.log(`\n${failures.length} failure(s):`);
    for (const f of failures) console.log(`  - ${f.title || f.url}: ${f.reason}`);
  }
  console.log(`\nDone. ${todo.length - failures.length}/${todo.length} fetched this run; ${targets.length - failures.length}/${targets.length} total.`);
}

main();
