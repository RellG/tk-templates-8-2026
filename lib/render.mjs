/** Renders one landing page from a design system's tokens and chosen structure. */

import { contrast, inkOn, mix, luminance } from './tokens.mjs';

export const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

/** Abstract product panel — implies an interface without shipping an image. */
function mock(d, rows = 5) {
  const bars = Array.from({ length: rows }, (_, i) => {
    const w = [92, 64, 78, 45, 86, 58][i % 6];
    const accent = i === 1;
    return `<span class="mk-row" style="width:${w}%;${accent ? 'background:var(--accent);opacity:.55' : ''}"></span>`;
  }).join('');
  return `<div class="mock" aria-hidden="true">
      <div class="mk-bar"><i></i><i></i><i></i></div>
      <div class="mk-body">
        <div class="mk-side"><span></span><span></span><span></span><span></span></div>
        <div class="mk-main">${bars}</div>
      </div>
    </div>`;
}

export function stylesheet(d, plan) {
  const s = d.semantic;
  const onAccent = inkOn(s.accent);
  const onFg = inkOn(s.fg);
  const dark = luminance(s.bg) < 0.4;
  const headingPx = parseInt(d.headingSize) || 48;
  // Some systems specify display type at 200px+; scale to viewport rather than clip.
  const heroMax = Math.max(38, Math.min(headingPx, plan.hero === 'display' ? 132 : 82));

  return `
:root {
  --bg:${s.bg}; --fg:${s.fg}; --accent:${s.accent}; --action:${s.action};
  --on-accent:${onAccent}; --on-fg:${onFg};
  --border:${s.border}; --muted:${s.muted}; --surface:${s.surface}; --alt:${s.alt};
  --r-card:${d.radiusCard}; --r-btn:${d.radiusBtn}; --r-sm:${d.radiusSm};
  --maxw:${d.maxWidth};
  --font-display:${d.fonts.display};
  --font-body:${d.fonts.body};
}
* { box-sizing:border-box; }
html { scroll-behavior:smooth; }
body { margin:0; background:var(--bg); color:var(--fg); font-family:var(--font-body);
  line-height:1.6; -webkit-font-smoothing:antialiased; }
img { max-width:100%; }
.wrap { max-width:var(--maxw); margin:0 auto; padding:0 28px; }
.wide { max-width:calc(var(--maxw) + 240px); margin:0 auto; padding:0 28px; }
h1,h2,h3,h4 { font-family:var(--font-display); font-weight:500; line-height:1.08; margin:0; }
p { margin:0; }
a { color:inherit; }
.muted { color:var(--muted); }

/* toolbar */
.tb { position:sticky; top:0; z-index:50; background:var(--bg); border-bottom:1px solid var(--border); font-size:12.5px; }
.tb .wide { display:flex; align-items:center; gap:14px; height:46px; }
.tb a { text-decoration:none; opacity:.65; }
.tb a:hover { opacity:1; }
.tb .sp { flex:1; }
.tb .tag { border:1px solid var(--border); border-radius:99px; padding:2px 9px; opacity:.65; }

/* nav */
.nav { border-bottom:1px solid ${plan.nav === 'minimal' ? 'transparent' : 'var(--border)'}; }
.nav .wrap { display:flex; align-items:center; gap:30px; height:76px; }
.brand { font-family:var(--font-display); font-size:21px; font-weight:500; letter-spacing:-0.01em; }
.nav-links { display:flex; gap:22px; font-size:14px; color:var(--muted); }
.nav-links span { cursor:default; }
.nav.split .nav-links { margin-left:auto; }
.nav.centered .wrap { justify-content:center; position:relative; }
.nav.centered .brand { position:absolute; left:28px; }
.nav.pill .nav-links { margin-left:auto; background:var(--surface); border:1px solid var(--border);
  border-radius:99px; padding:8px 18px; }
.nav.rule { border-bottom:2px solid var(--fg); }
.nav.minimal .nav-links { margin-left:auto; }
.nav .cta-sm { margin-left:18px; }

/* buttons */
.btn { display:inline-block; padding:13px 26px; border-radius:var(--r-btn); font-size:15px;
  text-decoration:none; border:1px solid var(--action); background:var(--action); color:var(--on-accent);
  transition:opacity .15s; }
.btn:hover { opacity:.86; }
.btn.ghost { background:transparent; color:var(--fg); border-color:var(--border); }
.btn.sm { padding:9px 18px; font-size:13.5px; }
.eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:12px; letter-spacing:.09em;
  text-transform:uppercase; color:var(--muted); }
.eyebrow.badge { color:var(--on-accent); background:var(--accent); padding:5px 12px;
  border-radius:var(--r-btn); letter-spacing:.07em; }

/* hero */
.hero { padding:${plan.hero === 'display' ? '84px 0 64px' : '104px 0 84px'}; }
.hero h1 { font-size:clamp(38px, 8vw, ${heroMax}px); letter-spacing:-0.025em; }
.hero .lede { font-size:19px; color:var(--muted); max-width:56ch; margin:24px 0 34px; }
.btns { display:flex; gap:12px; flex-wrap:wrap; }

.hero.centered { text-align:center; }
.hero.centered h1 { max-width:18ch; margin:18px auto 0; }
.hero.centered .lede { margin:24px auto 34px; }
.hero.centered .btns { justify-content:center; }

.hero.split .wrap { display:grid; grid-template-columns:1.05fr .95fr; gap:56px; align-items:center; }
.hero.editorial .wrap { display:grid; grid-template-columns:1fr; gap:26px; }
.hero.editorial h1 { max-width:14ch; }
.hero.editorial .rule { height:1px; background:var(--border); margin:14px 0 6px; }
.hero.editorial .cols { display:grid; grid-template-columns:1fr 1fr; gap:40px; padding-top:8px;
  border-top:1px solid var(--border); }
.hero.display { text-align:left; }
.hero.display h1 { font-size:clamp(46px, 13vw, ${heroMax}px); letter-spacing:-0.04em; line-height:.92;
  max-width:none; }
.hero.display .lede { max-width:46ch; }
.hero.centered-panel { text-align:center; padding-bottom:0; }
.hero.centered-panel h1 { max-width:17ch; margin:18px auto 0; }
.hero.centered-panel .lede { margin:24px auto 34px; }
.hero.centered-panel .btns { justify-content:center; }
.hero.centered-panel .mock { margin:56px auto -60px; max-width:min(900px, 100%); }

/* mock panel */
.mock { border:1px solid var(--border); border-radius:min(var(--r-card), 14px); background:var(--surface);
  overflow:hidden; box-shadow:0 18px 40px -28px rgba(0,0,0,${dark ? '.9' : '.35'}); }
.mk-bar { display:flex; gap:6px; padding:11px 14px; border-bottom:1px solid var(--border); background:var(--alt); }
.mk-bar i { width:9px; height:9px; border-radius:99px; background:var(--border); }
.mk-body { display:flex; min-height:190px; }
.mk-side { width:23%; border-right:1px solid var(--border); padding:16px 12px; display:flex;
  flex-direction:column; gap:11px; }
.mk-side span { height:7px; border-radius:3px; background:var(--border); }
.mk-side span:nth-child(2) { width:70%; } .mk-side span:nth-child(3) { width:84%; }
.mk-side span:nth-child(4) { width:56%; }
.mk-main { flex:1; padding:18px 18px; display:flex; flex-direction:column; gap:13px; }
.mk-row { height:9px; border-radius:4px; background:var(--border); display:block; }

/* sections */
section { padding:76px 0; }
section.hair { border-top:1px solid var(--border); }
.sec-head { max-width:60ch; margin-bottom:38px; }
.sec-head h2 { font-size:clamp(26px, 3.6vw, 40px); letter-spacing:-0.02em; }
.sec-head p { color:var(--muted); margin-top:14px; font-size:17px; }

.grid { display:grid; gap:20px; }
.g3 { grid-template-columns:repeat(auto-fit, minmax(250px,1fr)); }
.g4 { grid-template-columns:repeat(auto-fit, minmax(200px,1fr)); }
.card { background:var(--surface); border:1px solid var(--border);
  border-radius:min(var(--r-card), 26px); padding:26px; }
.card h3 { font-size:17px; margin-bottom:9px; }
.card p { color:var(--muted); font-size:14.5px; }

/* logos */
.logos { display:flex; flex-wrap:wrap; gap:14px 40px; align-items:center; justify-content:center;
  opacity:.62; font-family:var(--font-display); font-size:19px; }
.logos.band { border-block:1px solid var(--border); padding:26px 0; }

/* stats */
.stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(150px,1fr)); gap:26px; }
.stat b { display:block; font-family:var(--font-display); font-size:clamp(30px,4.4vw,46px);
  font-weight:500; letter-spacing:-0.02em; line-height:1; }
.stat span { display:block; color:var(--muted); font-size:13.5px; margin-top:9px; }

/* alternating */
.alt-row { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; padding:34px 0; }
.alt-row:nth-child(even) .alt-text { order:2; }
.alt-text h3 { font-size:clamp(22px,2.6vw,29px); letter-spacing:-0.015em; margin-bottom:14px; }
.alt-text p { color:var(--muted); }

/* bento */
.bento { display:grid; gap:16px; grid-template-columns:repeat(4,1fr); grid-auto-rows:158px; }
.bento .card { display:flex; flex-direction:column; justify-content:flex-end; }
.bento .card:nth-child(1) { grid-column:span 2; grid-row:span 2; }
.bento .card:nth-child(2) { grid-column:span 2; }
.bento .card:nth-child(3) { grid-column:span 1; }
.bento .card:nth-child(4) { grid-column:span 1; }
.bento .card:nth-child(5) { grid-column:span 2; }
.bento .card:nth-child(6) { grid-column:span 2; }

/* tabs */
.tabs { display:flex; gap:2px; border-bottom:1px solid var(--border); margin-bottom:30px; flex-wrap:wrap; }
.tab { padding:13px 20px; font-size:14.5px; color:var(--muted); border-bottom:2px solid transparent; }
.tab.on { color:var(--fg); border-bottom-color:var(--accent); }

/* showcase */
.tiles { display:grid; gap:16px; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); }
.tile { border:1px solid var(--border); border-radius:min(var(--r-card),20px); overflow:hidden;
  background:var(--surface); }
.tile .swatch { height:112px; }
.tile .lab { padding:13px 15px; font-size:13.5px; display:flex; justify-content:space-between; gap:10px; }
.tile .lab span { color:var(--muted); font-family:ui-monospace,Menlo,monospace; font-size:11.5px; }

/* band */
.band-sec { background:var(--fg); color:var(--on-fg); padding:74px 0; }
.band-sec h2 { font-size:clamp(26px,3.6vw,40px); letter-spacing:-0.02em; max-width:20ch; }
.band-sec p { color:var(--on-fg); opacity:.72; margin-top:16px; max-width:56ch; }

/* quotes */
.quotes { display:grid; gap:20px; grid-template-columns:repeat(auto-fit,minmax(290px,1fr)); }
.quote { border:1px solid var(--border); border-radius:min(var(--r-card),24px); padding:30px;
  background:var(--surface); }
.quote blockquote { margin:0 0 20px; font-family:var(--font-display); font-size:19px; line-height:1.42;
  letter-spacing:-0.01em; }
.quote .who { font-size:13px; color:var(--muted); }
.quote .who b { color:var(--fg); font-weight:500; }

/* pricing */
.tiers { display:grid; gap:18px; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }
.tier { border:1px solid var(--border); border-radius:min(var(--r-card),24px); padding:30px;
  display:flex; flex-direction:column; gap:16px; }
.tier.on { border-color:var(--accent); border-width:2px; }
.tier .price { font-family:var(--font-display); font-size:40px; letter-spacing:-0.02em; }
.tier ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px;
  color:var(--muted); font-size:14.5px; flex:1; }
.tier li::before { content:"—"; margin-right:9px; opacity:.5; }

/* faq */
.faq { border-top:1px solid var(--border); }
.faq .q { border-bottom:1px solid var(--border); padding:24px 0; display:grid;
  grid-template-columns:1fr 1.3fr; gap:36px; }
.faq h3 { font-size:18px; letter-spacing:-0.01em; }
.faq p { color:var(--muted); font-size:15px; }

/* cta */
.cta-box { background:var(--accent); color:var(--on-accent); border-radius:min(var(--r-card),34px);
  padding:64px 44px; text-align:center; }
.cta-box h2 { font-size:clamp(27px,4vw,44px); letter-spacing:-0.025em; max-width:20ch; margin:0 auto; }
.cta-box p { opacity:.82; margin:18px auto 30px; max-width:52ch; }
.cta-box .btn { background:var(--on-accent); color:var(--accent); border-color:var(--on-accent); }

/* footer */
footer { border-top:1px solid var(--border); padding:56px 0 40px; font-size:14px; }
.f-cols { display:grid; gap:34px; grid-template-columns:1.6fr repeat(3,1fr); margin-bottom:44px; }
.f-cols h4 { font-family:var(--font-body); font-size:12px; letter-spacing:.08em; text-transform:uppercase;
  color:var(--muted); margin-bottom:14px; font-weight:600; }
.f-cols ul { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px;
  color:var(--muted); }
.f-big .brand { font-size:clamp(42px,10vw,110px); letter-spacing:-0.04em; line-height:1;
  margin-bottom:34px; display:block; }
.note { border-top:1px solid var(--border); padding-top:22px; color:var(--muted); font-size:12.5px;
  display:flex; gap:18px; flex-wrap:wrap; justify-content:space-between; }

@media (max-width:860px) {
  .hero.split .wrap, .alt-row, .faq .q, .hero.editorial .cols { grid-template-columns:1fr; gap:30px; }
  .alt-row:nth-child(even) .alt-text { order:0; }
  .bento { grid-template-columns:repeat(2,1fr); }
  .bento .card:nth-child(n) { grid-column:span 2; grid-row:span 1; }
  .f-cols { grid-template-columns:1fr 1fr; }
  .nav-links { display:none; }
}`;
}

/* ---------- section renderers ---------- */

const S = {};

S.logos = (d, c) => `<section class="hair"><div class="wrap">
  <p class="eyebrow" style="justify-content:center;display:flex;margin-bottom:22px">Trusted by teams at</p>
  <div class="logos">${c.orgs.map(o => `<span>${esc(o)}</span>`).join('')}</div>
</div></section>`;

S.stats = (d, c) => `<section class="hair"><div class="wrap">
  <div class="stats">${c.stats.map(([n,l]) => `
    <div class="stat"><b>${esc(n)}</b><span>${esc(l)}</span></div>`).join('')}</div>
</div></section>`;

S.features = (d, c) => `<section class="hair"><div class="wrap">
  <div class="sec-head"><h2>Built for the way the work actually happens</h2>
    <p>Every capability below is part of the core product — no add-on tier, no separate console.</p></div>
  <div class="grid g3">${c.features.map(([h,b]) => `
    <article class="card"><h3>${esc(h)}</h3><p>${esc(b)}</p></article>`).join('')}</div>
</div></section>`;

S.alternating = (d, c) => `<section class="hair"><div class="wrap">
  ${c.features.slice(0,2).map(([h,b]) => `
  <div class="alt-row">
    <div class="alt-text"><h3>${esc(h)}</h3><p>${esc(b)}</p>
      <p style="margin-top:18px"><a href="#" style="color:var(--accent);text-decoration:none">${esc(c.ctaSecondary)} →</a></p></div>
    <div>${mock(d, 5)}</div>
  </div>`).join('')}
</div></section>`;

S.bento = (d, c) => `<section class="hair"><div class="wrap">
  <div class="sec-head"><h2>One surface, every moving part</h2></div>
  <div class="bento">${c.features.slice(0,6).map(([h,b]) => `
    <article class="card"><h3>${esc(h)}</h3><p>${esc(b)}</p></article>`).join('')}</div>
</div></section>`;

S.tabs = (d, c) => `<section class="hair"><div class="wrap">
  <div class="sec-head"><h2>However your team works</h2></div>
  <div class="tabs">${c.nav.slice(0,4).map((t,i) => `<span class="tab${i===0?' on':''}">${esc(t)}</span>`).join('')}</div>
  <div class="alt-row" style="padding-top:0">
    <div class="alt-text"><h3>${esc(c.features[0][0])}</h3><p>${esc(c.features[0][1])}</p></div>
    <div>${mock(d, 6)}</div>
  </div>
</div></section>`;

S.showcase = (d, c) => `<section class="hair"><div class="wrap">
  <div class="sec-head"><h2>The palette in use</h2>
    <p>Every swatch below is a real token from this system.</p></div>
  <div class="tiles">${d.palette.slice(0,8).map(p => `
    <div class="tile"><div class="swatch" style="background:${esc(p.hex)}"></div>
      <div class="lab"><b>${esc(p.name)}</b><span>${esc(p.hex)}</span></div></div>`).join('')}</div>
</div></section>`;

S.band = (d, c) => `<section class="band-sec"><div class="wrap">
  <h2>${esc(c.headline)}</h2>
  <p>${esc(c.lede)}</p>
</div></section>`;

S.quotes = (d, c) => `<section class="hair"><div class="wrap">
  <div class="sec-head"><h2>What teams say</h2></div>
  <div class="quotes">${c.quotes.map(q => `
    <figure class="quote"><blockquote>“${esc(q.quote)}”</blockquote>
      <figcaption class="who"><b>${esc(q.who[0])}</b> · ${esc(q.who[1])}</figcaption></figure>`).join('')}</div>
</div></section>`;

S.pricing = (d, c) => `<section class="hair"><div class="wrap">
  <div class="sec-head"><h2>Straightforward pricing</h2><p>Per workspace, billed monthly. Cancel whenever.</p></div>
  <div class="tiers">${c.tiers.map(([n,p,feats],i) => `
    <div class="tier${i===1?' on':''}">
      <h3>${esc(n)}</h3>
      <div class="price">${p === 'custom' ? 'Custom' : '$' + esc(p)}</div>
      <ul>${feats.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
      <a class="btn${i===1?'':' ghost'} sm" href="#">${esc(i===2 ? 'Contact sales' : c.ctaPrimary)}</a>
    </div>`).join('')}</div>
</div></section>`;

S.faq = (d, c) => `<section class="hair"><div class="wrap">
  <div class="sec-head"><h2>Questions, answered</h2></div>
  <div class="faq">${c.faqs.map(([q,a]) => `
    <div class="q"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('')}</div>
</div></section>`;

S.cta = (d, c) => `<section><div class="wrap">
  <div class="cta-box">
    <h2>${esc(c.headline)}</h2>
    <p>${esc(c.lede)}</p>
    <a class="btn" href="#">${esc(c.ctaPrimary)}</a>
  </div>
</div></section>`;

/* ---------- heroes ---------- */

const HERO = {
  centered: (d, c) => `<header class="hero centered"><div class="wrap">
    <span class="eyebrow badge">${esc(c.eyebrow)}</span>
    <h1>${esc(c.headline)}</h1>
    <p class="lede">${esc(c.lede)}</p>
    <div class="btns"><a class="btn" href="#">${esc(c.ctaPrimary)}</a>
      <a class="btn ghost" href="#">${esc(c.ctaSecondary)}</a></div>
  </div></header>`,

  'centered-panel': (d, c) => `<header class="hero centered-panel"><div class="wrap">
    <span class="eyebrow badge">${esc(c.eyebrow)}</span>
    <h1>${esc(c.headline)}</h1>
    <p class="lede">${esc(c.lede)}</p>
    <div class="btns"><a class="btn" href="#">${esc(c.ctaPrimary)}</a>
      <a class="btn ghost" href="#">${esc(c.ctaSecondary)}</a></div>
    ${mock(d, 6)}
  </div></header>`,

  split: (d, c) => `<header class="hero split"><div class="wrap">
    <div>
      <span class="eyebrow badge">${esc(c.eyebrow)}</span>
      <h1 style="margin-top:18px">${esc(c.headline)}</h1>
      <p class="lede">${esc(c.lede)}</p>
      <div class="btns"><a class="btn" href="#">${esc(c.ctaPrimary)}</a>
        <a class="btn ghost" href="#">${esc(c.ctaSecondary)}</a></div>
    </div>
    <div>${mock(d, 6)}</div>
  </div></header>`,

  editorial: (d, c) => `<header class="hero editorial"><div class="wrap">
    <span class="eyebrow">${esc(c.eyebrow)} — ${esc(c.kind)}</span>
    <h1>${esc(c.headline)}</h1>
    <div class="rule"></div>
    <div class="cols">
      <p class="lede" style="margin:0">${esc(c.lede)}</p>
      <div>
        <p class="muted" style="font-size:15px">${esc(c.tagline)}</p>
        <div class="btns" style="margin-top:24px"><a class="btn" href="#">${esc(c.ctaPrimary)}</a>
          <a class="btn ghost" href="#">${esc(c.ctaSecondary)}</a></div>
      </div>
    </div>
  </div></header>`,

  display: (d, c) => `<header class="hero display"><div class="wide">
    <span class="eyebrow badge">${esc(c.eyebrow)}</span>
    <h1 style="margin-top:22px">${esc(c.headline)}</h1>
    <div style="display:flex;gap:44px;flex-wrap:wrap;align-items:flex-end;margin-top:36px">
      <p class="lede" style="margin:0">${esc(c.lede)}</p>
      <div class="btns"><a class="btn" href="#">${esc(c.ctaPrimary)}</a>
        <a class="btn ghost" href="#">${esc(c.ctaSecondary)}</a></div>
    </div>
  </div></header>`,
};

function navBar(d, c, variant) {
  const links = c.nav.map(n => `<span>${esc(n)}</span>`).join('');
  return `<nav class="nav ${variant}"><div class="wrap">
    <span class="brand">${esc(d.title)}</span>
    <div class="nav-links">${links}</div>
    ${variant === 'centered' ? '' : `<a class="btn sm cta-sm" href="#">${esc(c.ctaPrimary)}</a>`}
  </div></nav>`;
}

function footer(d, c, variant) {
  const cols = c.footerCols.map(([h, items]) => `
    <div><h4>${esc(h)}</h4><ul>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('');
  const note = `<div class="note">
      <span>Generated template · layout and copy are placeholder scaffolding, not ${esc(d.title)}'s real site.</span>
      <span>Tokens: <a href="${esc(d.url)}">refero</a></span>
    </div>`;

  if (variant === 'big') return `<footer><div class="wrap f-big">
    <span class="brand">${esc(d.title)}</span>
    <div class="f-cols" style="grid-template-columns:repeat(3,1fr)">${cols}</div>${note}
  </div></footer>`;
  if (variant === 'minimal') return `<footer><div class="wrap">${note}</div></footer>`;
  if (variant === 'rule') return `<footer><div class="wrap">
    <div class="f-cols">
      <div><span class="brand">${esc(d.title)}</span>
        <p class="muted" style="margin-top:12px;max-width:34ch;font-size:14px">${esc(d.tagline)}</p></div>
      ${cols}
    </div>${note}
  </div></footer>`;
  return `<footer><div class="wrap">
    <div class="f-cols">
      <div><span class="brand">${esc(d.title)}</span>
        <p class="muted" style="margin-top:12px;max-width:34ch;font-size:14px">${esc(c.lede)}</p></div>
      ${cols}
    </div>${note}
  </div></footer>`;
}

export function page(d, c, plan, prev, next) {
  const body = plan.sections.map(k => (S[k] ? S[k](d, c) : '')).join('\n');
  return `<!doctype html>
<html lang="en" data-theme="${esc(d.theme)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.title)} — template</title>
<style>${stylesheet(d, plan)}</style>
</head>
<body>
<div class="tb"><div class="wide">
  <a href="./index.html">← Gallery</a>
  <span class="tag">${esc(plan.hero)}</span>
  <span class="tag">${esc(d.theme)}</span>
  <span class="tag">${esc(c.kind)}</span>
  <span class="sp"></span>
  ${prev ? `<a href="./${esc(prev)}.html">← prev</a>` : ''}
  ${next ? `<a href="./${esc(next)}.html">next →</a>` : ''}
</div></div>
${navBar(d, c, plan.nav)}
${HERO[plan.hero](d, c)}
${body}
${footer(d, c, plan.footer)}
</body>
</html>`;
}
