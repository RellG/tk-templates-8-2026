/**
 * Builds one landing-page template per extracted design system.
 *
 * Design comes from that system's tokens; page structure from its own
 * `## Layout` prose and component inventory; copy is seeded placeholder text
 * so each template reads as a different fictional product.
 *
 * Usage: node build-templates.js
 */

import fs from 'fs/promises';
import path from 'path';
import { SRC, extract, contrast } from './lib/tokens.mjs';
import { makeRng, buildContent } from './lib/content.mjs';
import { detect, chooseHero, chooseNav, chooseSections, chooseFooter } from './lib/layout.mjs';
import { page, esc } from './lib/render.mjs';

const OUT = path.resolve('./site');

function gallery(items) {
  const cards = items.map(({ d, plan, c }) => {
    const s = d.semantic;
    const strip = d.palette.slice(0, 7).map(p => `<i style="background:${esc(p.hex)}"></i>`).join('');
    return `
  <a class="tile" href="./${esc(d.dir)}.html"
     data-name="${esc(d.title.toLowerCase())}" data-theme="${esc(d.theme)}"
     data-hero="${esc(plan.hero)}" data-kind="${esc(c.kind)}">
    <div class="prev" style="background:${esc(s.bg)};color:${esc(s.fg)};border-color:${esc(s.border)}">
      <div class="p-nav"><span style="font-family:${d.fonts.display}">${esc(d.title)}</span>
        <i style="background:${esc(s.accent)};border-radius:${esc(d.radiusBtn)}"></i></div>
      <div class="p-body p-${esc(plan.hero)}">
        <b style="font-family:${d.fonts.display}">${esc(c.headline)}</b>
        <em>${esc(c.lede.slice(0, 74))}</em>
        <i class="p-btn" style="background:${esc(s.action)};border-radius:${esc(d.radiusBtn)}"></i>
      </div>
    </div>
    <div class="strip">${strip}</div>
    <div class="meta">
      <strong>${esc(d.title)}</strong>
      <span>${esc(plan.hero)} · ${esc(d.theme)} · ${d.palette.length} colors</span>
    </div>
  </a>`;
  }).join('');

  const heroes = [...new Set(items.map(i => i.plan.hero))].sort();
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${items.length} design system templates</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#09090b;color:#f4f4f5;
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{max-width:1500px;margin:0 auto;padding:54px 30px 22px}
h1{font-size:31px;margin:0 0 10px;letter-spacing:-.025em;font-weight:600}
p.sub{color:#9b9ba4;margin:0;max-width:80ch;line-height:1.6;font-size:14px}
.tools{max-width:1500px;margin:0 auto;padding:18px 30px;display:flex;gap:9px;flex-wrap:wrap}
input,select{background:#161619;border:1px solid #2b2b31;color:#f4f4f5;padding:9px 13px;
  border-radius:7px;font:inherit;font-size:14px}
input{flex:1;min-width:200px}
.count{color:#9b9ba4;font-size:13px;align-self:center;margin-left:auto}
.grid{max-width:1500px;margin:0 auto;padding:10px 30px 90px;display:grid;gap:18px;
  grid-template-columns:repeat(auto-fill,minmax(268px,1fr))}
.tile{text-decoration:none;color:inherit;border:1px solid #232329;border-radius:13px;
  overflow:hidden;background:#111114;transition:border-color .15s,transform .15s}
.tile:hover{border-color:#52525b;transform:translateY(-2px)}
.prev{height:176px;border-bottom:1px solid;display:flex;flex-direction:column;overflow:hidden}
.p-nav{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;
  border-bottom:1px solid currentColor;opacity:.92;font-size:13px}
.p-nav i{width:40px;height:15px;display:block;opacity:.9}
.p-body{padding:16px 14px;display:flex;flex-direction:column;gap:7px;flex:1}
.p-body b{font-size:17px;line-height:1.14;font-weight:500}
.p-body em{font-style:normal;font-size:10.5px;opacity:.62;line-height:1.4}
.p-btn{width:62px;height:19px;display:block;margin-top:auto}
.p-centered,.p-centered-panel{text-align:center;align-items:center}
.p-centered .p-btn,.p-centered-panel .p-btn{margin-left:auto;margin-right:auto}
.p-display b{font-size:23px;letter-spacing:-.03em;line-height:.96}
.p-editorial b{font-size:16px}
.p-editorial em{border-top:1px solid currentColor;padding-top:7px}
.strip{display:flex;height:7px}
.strip i{flex:1}
.meta{padding:11px 13px;display:flex;flex-direction:column;gap:3px}
.meta strong{font-size:14px;font-weight:600}
.meta span{font-size:11px;color:#83838d}
</style></head>
<body>
<header>
  <h1>Design system templates</h1>
  <p class="sub">${items.length} landing pages. Colors, type, radii and spacing come from each system's
  own tokens; page structure is chosen from that system's <code>## Layout</code> description and component
  list; copy is seeded placeholder text for a fictional product. None of these reproduce the real sites.</p>
</header>
<div class="tools">
  <input id="q" type="search" placeholder="Filter by name…" autocomplete="off">
  <select id="theme"><option value="">All themes</option><option>light</option><option>dark</option><option>mixed</option></select>
  <select id="hero"><option value="">All layouts</option>${heroes.map(h => `<option>${esc(h)}</option>`).join('')}</select>
  <span class="count" id="count"></span>
</div>
<div class="grid" id="grid">${cards}</div>
<script>
const q=document.getElementById('q'),th=document.getElementById('theme'),hr=document.getElementById('hero');
const tiles=[...document.querySelectorAll('.tile')],count=document.getElementById('count');
function apply(){
  const t=q.value.trim().toLowerCase(),theme=th.value,hero=hr.value;let n=0;
  for(const el of tiles){
    const ok=(!t||el.dataset.name.includes(t))&&(!theme||el.dataset.theme===theme)&&(!hero||el.dataset.hero===hero);
    el.style.display=ok?'':'none';if(ok)n++;
  }
  count.textContent=n+' of '+tiles.length;
}
for(const el of [q,th,hr]) el.addEventListener('input',apply);
apply();
</script>
</body></html>`;
}

/* ---------- main ---------- */

const dirs = (await fs.readdir(SRC, { withFileTypes: true }))
  .filter(e => e.isDirectory()).map(e => e.name).sort();

await fs.mkdir(OUT, { recursive: true });

const items = [];
for (const dir of dirs) {
  try {
    const d = await extract(dir);
    const rng = makeRng(d.title + d.dir);
    const c = buildContent(rng, d.title, d.tagline);
    const sig = detect(d);
    const plan = {
      hero: chooseHero(sig, rng),
      nav: chooseNav(sig, rng),
      sections: chooseSections(sig, rng),
      footer: chooseFooter(sig, rng),
      signals: Object.entries(sig).filter(([, v]) => v).map(([k]) => k),
    };
    items.push({ d, c, plan });
  } catch (err) {
    console.error(`skip ${dir}: ${err.message}`);
  }
}

for (let i = 0; i < items.length; i++) {
  const { d, c, plan } = items[i];
  await fs.writeFile(
    path.join(OUT, `${d.dir}.html`),
    page(d, c, plan, items[i-1]?.d.dir, items[i+1]?.d.dir), 'utf-8'
  );
  await fs.writeFile(
    path.join(SRC, d.dir, 'tokens.json'),
    JSON.stringify({
      title: d.title, theme: d.theme, url: d.url, semantic: d.semantic,
      fonts: d.fonts, palette: d.palette, plan,
    }, null, 2), 'utf-8'
  );
}

await fs.writeFile(path.join(OUT, 'index.html'), gallery(items), 'utf-8');

const heroCount = items.reduce((m,i) => (m[i.plan.hero]=(m[i.plan.hero]||0)+1, m), {});
const kindCount = items.reduce((m,i) => (m[i.c.kind]=(m[i.c.kind]||0)+1, m), {});
const lowContrast = items.filter(i => contrast(i.d.semantic.fg, i.d.semantic.bg) < 4.5);
const uniqueShapes = new Set(items.map(i => i.plan.hero + '|' + i.plan.sections.join(',') + '|' + i.plan.footer));

console.log(`Built ${items.length} templates → ${OUT}`);
console.log('Heroes:', Object.entries(heroCount).map(([k,v]) => `${k} ${v}`).join(', '));
console.log('Products:', Object.entries(kindCount).map(([k,v]) => `${k} ${v}`).join(', '));
console.log(`Distinct page structures: ${uniqueShapes.size}/${items.length}`);
console.log(`Low body contrast: ${lowContrast.length ? lowContrast.map(i=>i.d.dir).join(', ') : 'none'}`);
