/**
 * Chooses a page structure per design system.
 *
 * Structure is read from the doc's own `## Layout` prose and component
 * inventory wherever those say something definite; the seeded RNG only fills
 * gaps, so two systems described the same way still differ, and a system that
 * describes itself precisely gets what it describes.
 */

import { one, some } from './content.mjs';

const has = (re, ...texts) => texts.some(t => re.test(t));

export function detect(d) {
  const layout = (d.layoutText || '').toLowerCase();
  const comps = d.components.join(' | ').toLowerCase();
  const tag = (d.tagline || '').toLowerCase();
  const all = [layout, comps, tag];

  return {
    centered:  has(/centered[- ]headline|centered hero|centered stack|center-aligned/, ...all),
    split:     has(/two[- ]column|2[- ]column|split|text[- ]left|side[- ]by[- ]side/, ...all),
    fullBleed: has(/full[- ]bleed|edge[- ]to[- ]edge|no max[- ]width|full[- ]width hero/, ...all),
    editorial: has(/editorial|magazine|asymmetric|column rule|typeset|spread|catalog/, ...all),
    oversized: has(/oversiz|massive|huge display|260px|display type at \d{3}/, ...all),
    logos:     has(/logo (marquee|wall|strip|mosaic|grid|tile)|marquee/, ...all),
    tabs:      has(/tab (control|strip|navigation)|tabbed/, ...all),
    bento:     has(/bento|mosaic|masonry|collage/, ...all),
    pricing:   has(/pricing|plan card|tier/, ...all),
    stats:     has(/stat|metric|big number|figure/, ...all),
    quotes:    has(/testimonial|quote|customer story/, ...all),
    faq:       has(/faq|accordion|disclosure/, ...all),
    showcase:  has(/gallery|catalog|card grid|tile grid|3-column card|portfolio/, ...all),
    sticky:    has(/sticky/, ...all),
    band:      has(/band|full-bleed section|color block|horizontal band/, ...all),
    screenshot:has(/screenshot|product ui|app window|interface panel|product panel/, ...all),
  };
}

export function chooseHero(sig, rng) {
  if (sig.oversized || (sig.fullBleed && sig.editorial)) return 'display';
  if (sig.editorial) return 'editorial';
  if (sig.split && !sig.centered) return 'split';
  if (sig.centered) return sig.screenshot ? 'centered-panel' : 'centered';
  return one(rng, ['centered', 'split', 'editorial', 'centered-panel', 'display']);
}

export function chooseNav(sig, rng) {
  if (sig.editorial) return one(rng, ['rule', 'minimal']);
  if (sig.centered) return one(rng, ['centered', 'split']);
  return one(rng, ['split', 'split', 'pill', 'rule']);
}

export function chooseSections(sig, rng) {
  const picked = [];
  const add = s => { if (!picked.includes(s)) picked.push(s); };

  // Everything the document actually describes.
  if (sig.logos) add('logos');
  if (sig.stats) add('stats');
  if (sig.tabs) add('tabs');
  if (sig.bento) add('bento');
  if (sig.showcase) add('showcase');
  if (sig.band) add('band');
  if (sig.screenshot) add('alternating');
  if (sig.quotes) add('quotes');
  if (sig.pricing) add('pricing');
  if (sig.faq) add('faq');

  // Fill toward a complete page without repeating what is already there.
  const pool = ['features', 'alternating', 'bento', 'stats', 'quotes', 'showcase', 'logos', 'pricing', 'faq', 'band', 'tabs'];
  const target = 4 + Math.floor(rng() * 3);
  for (const s of some(rng, pool, pool.length)) {
    if (picked.length >= target) break;
    add(s);
  }
  if (!picked.includes('features') && !picked.includes('bento')) picked.splice(1, 0, 'features');

  // Order by a stable rhythm rather than detection order.
  const RANK = { logos:1, stats:2, features:3, alternating:4, bento:5, tabs:6, showcase:7, band:8, quotes:9, pricing:10, faq:11 };
  picked.sort((a,b) => (RANK[a]||99) - (RANK[b]||99));
  picked.push('cta');
  return picked;
}

export function chooseFooter(sig, rng) {
  if (sig.editorial) return 'rule';
  return one(rng, ['columns', 'columns', 'big', 'minimal']);
}
