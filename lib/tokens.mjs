/** Token parsing and color math shared by the template builder. */

import fs from 'fs/promises';
import path from 'path';

export const SRC = path.resolve('./refero-design-systems');

/* ---------- color ---------- */

export function parseHex(h) {
  if (!h) return null;
  let s = String(h).trim().replace(/^#/, '');
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16)];
}

export function luminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r,g,b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126*r + 0.7152*g + 0.0722*b;
}

export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la,lb) + 0.05) / (Math.min(la,lb) + 0.05);
}

export function saturation(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r,g,b] = rgb.map(v => v/255);
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  if (max === min) return 0;
  const l = (max+min)/2;
  return l > 0.5 ? (max-min)/(2-max-min) : (max-min)/(max+min);
}

export function mix(a, b, t) {
  const ra = parseHex(a), rb = parseHex(b);
  if (!ra || !rb) return a;
  return '#' + ra.map((v,i) => Math.round(v + (rb[i]-v)*t).toString(16).padStart(2,'0')).join('');
}

/** Readable ink for a given surface. */
export function inkOn(bg, light = '#ffffff', dark = '#111111') {
  return contrast(light, bg) >= contrast(dark, bg) ? light : dark;
}

/* ---------- markdown ---------- */

const unescape = s => s.replace(/\\n/g, '\n');

export function parseRootBlock(md) {
  const m = md.match(/:root \{([\s\S]*?)\n\}/);
  const tokens = {};
  if (!m) return tokens;
  for (const line of m[1].split('\n')) {
    const t = line.match(/^\s*(--[a-z0-9-]+)\s*:\s*(.+?);\s*$/i);
    if (t) tokens[t[1]] = t[2].trim();
  }
  return tokens;
}

export function parseColorTable(md) {
  const rows = [];
  const section = md.split(/^## Tokens — Colors/m)[1];
  if (!section) return rows;
  for (const line of section.split(/^## /m)[0].split('\n')) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*`(#[0-9a-fA-F]{3,8})`\s*\|\s*`?(--[a-z0-9-]+)`?\s*\|\s*([^|]*)\|/);
    if (m) rows.push({ name: m[1].trim(), hex: m[2].toLowerCase(), token: m[3], role: m[4].trim() });
  }
  return rows;
}

export function parseQuickRef(md) {
  const out = {};
  const idx = md.indexOf('Quick Color Reference');
  if (idx === -1) return out;
  const body = unescape(md.slice(idx)).split(/\n## /)[0];
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('-')) continue;
    const hex = (line.match(/#[0-9a-fA-F]{6}/) || [])[0];
    if (!hex) continue;
    const label = line.slice(1).split(':')[0].toLowerCase();
    const key =
      /background|canvas|surface|page/.test(label) ? 'bg' :
      /text|foreground|ink/.test(label)            ? 'fg' :
      /accent|emphasis|highlight|brand/.test(label)? 'accent' :
      /border|divider|hairline|stroke/.test(label) ? 'border' :
      /action|cta|button/.test(label)              ? 'action' : null;
    // Keep every candidate: systems often name a vivid hero canvas *and* a
    // quiet section background, and only one of them can carry body text.
    if (key) (out[key] ||= []).push(hex.toLowerCase());
  }
  return out;
}

/** Prose layout description — the richest per-site structural signal. */
export function parseSection(md, heading, stopRe) {
  const i = md.indexOf(`## ${heading}`);
  if (i === -1) return '';
  const rest = md.slice(i + heading.length + 3);
  const end = rest.search(stopRe || /\n## /);
  return unescape(end === -1 ? rest : rest.slice(0, end)).trim();
}

export function parseComponentNames(md) {
  const sec = md.split(/^## Components/m)[1];
  if (!sec) return [];
  return (sec.split(/^## /m)[0].match(/^### .+$/gm) || [])
    .map(s => s.replace(/^### /, '').trim());
}

/* ---------- semantics ---------- */

export function deriveSemantics(theme, palette, quick) {
  const hexes = [...new Set(palette.map(p => p.hex))].filter(parseHex);
  const isDark = theme === 'dark';
  const byLum = [...hexes].sort((a,b) => luminance(a) - luminance(b));
  if (!byLum.length) {
    return isDark
      ? { bg:'#111111', fg:'#f5f5f5', accent:'#8a8a8a', action:'#8a8a8a', border:'#333333', muted:'#999999', surface:'#191919', alt:'#1c1c1c' }
      : { bg:'#ffffff', fg:'#111111', accent:'#555555', action:'#555555', border:'#e5e5e5', muted:'#777777', surface:'#fafafa', alt:'#f4f4f4' };
  }
  const first = k => (quick[k] || []).filter(parseHex)[0];

  /** Best text color available for a surface, and how legible it is. */
  const bestFg = bg => [...hexes, '#ffffff', '#111111']
    .reduce((best, h) => (contrast(h, bg) > contrast(best, bg) ? h : best), '#111111');

  // Try each declared background before falling back, and require that the
  // chosen canvas can actually carry body text.
  const candidates = [
    ...(quick.bg || []).filter(parseHex),
    isDark ? byLum[0] : byLum[byLum.length - 1],
    isDark ? '#111111' : '#ffffff',
  ];
  let bg = candidates.find(c => contrast(bestFg(c), c) >= 4.5) || candidates[candidates.length - 1];

  let fg = first('fg');
  if (!fg || contrast(fg, bg) < 4.5) fg = bestFg(bg);

  const rest = hexes.filter(h => h !== bg && h !== fg);
  // A vivid canvas that lost the background role is still the best accent.
  const displaced = (quick.bg || []).filter(parseHex).filter(h => h !== bg);
  let accent = [first('accent'), ...displaced].find(h => h && parseHex(h) && h !== bg && contrast(h, bg) >= 1.6);
  if (!accent) {
    const sat = rest.filter(h => saturation(h) > 0.15).sort((a,b) => saturation(b) - saturation(a));
    accent = sat.find(h => contrast(h, bg) >= 1.6) || sat[0] || rest[0] || fg;
  }
  if (contrast(accent, bg) < 1.6) accent = fg;

  const action = [first('action'), accent].find(h => h && parseHex(h) && contrast(h, bg) >= 1.6) || accent;
  const borderQ = first('border');
  const border = borderQ && borderQ !== bg ? borderQ : mix(bg, fg, 0.16);
  return {
    bg, fg, accent, action, border,
    muted: mix(bg, fg, 0.55),
    surface: mix(bg, fg, isDark ? 0.07 : 0.035),
    alt: mix(bg, fg, isDark ? 0.12 : 0.06),
  };
}

export function pickFonts(tokens) {
  const fonts = Object.entries(tokens)
    .filter(([k]) => /^--font-/.test(k) && !/weight/.test(k))
    .map(([k,v]) => ({ name: k.replace('--font-',''), stack: v }));
  const display = fonts[0]?.stack || 'ui-sans-serif, system-ui, sans-serif';
  return { display, body: fonts[1]?.stack || display, names: fonts.map(f => f.name) };
}

const pick = (tokens, re, fb) => (Object.entries(tokens).find(([k]) => re.test(k)) || [,fb])[1];

export async function extract(dir) {
  const md = await fs.readFile(path.join(SRC, dir, 'DESIGN.md'), 'utf-8');
  const meta = JSON.parse(await fs.readFile(path.join(SRC, dir, 'source.json'), 'utf-8'));

  const theme = (md.match(/^\*\*Theme:\*\*\s*(\w+)/m) || [])[1] || 'light';
  const tagline = (md.match(/^>\s*(.+)$/m) || [])[1] || '';
  const tokens = parseRootBlock(md);
  const palette = parseColorTable(md);
  const semantic = deriveSemantics(theme, palette, parseQuickRef(md));
  const fonts = pickFonts(tokens);

  const heading = pick(tokens, /^--text-(heading|display|h1|hero)/, '48px');
  return {
    dir, title: meta.title, url: meta.url, theme, tagline, semantic, fonts, palette,
    layoutText: parseSection(md, 'Layout'),
    components: parseComponentNames(md),
    radiusCard: pick(tokens, /^--radius-(cards|md|lg)/, '8px'),
    radiusBtn:  pick(tokens, /^--radius-(buttons|full|pill)/, '8px'),
    radiusSm:   pick(tokens, /^--radius-(sm|links|inputs)/, '4px'),
    maxWidth:   pick(tokens, /^--(page-max-width|container|layout-max)/, '1180px'),
    headingSize: heading,
    tokenCount: Object.keys(tokens).length,
    tokens,
  };
}
