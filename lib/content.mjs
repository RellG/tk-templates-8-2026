/**
 * Seeded placeholder copy. Each design system gets a different fictional
 * product so the templates read as distinct sites rather than one page
 * recolored. Seeded on the title, so rebuilds are stable.
 */

export function makeRng(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const one = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];
export function some(rng, arr, n) {
  const pool = [...arr], out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

const CATEGORIES = [
  {
    kind: 'analytics', nav: ['Product', 'Metrics', 'Integrations', 'Docs', 'Pricing'],
    heads: ['Every number, one source of truth', 'Know what changed, and why', 'Analytics that answer back', 'Stop arguing about the numbers', 'From question to answer, without a ticket', 'Your data, finally on speaking terms', 'Metrics that mean the same thing twice', 'The dashboard your team actually opens'],
    ledes: ['Warehouse-native dashboards your whole team can read, without waiting on a data request.', 'Query your warehouse directly, define each metric once, and let anyone answer their own question.', 'Governed metrics, self-serve exploration, and alerts that page the person who can actually fix it.'],
    feats: [['Live pipelines','Streaming ingest with schema drift detection and replay.'],
            ['Cohort explorer','Slice retention by any property without writing SQL.'],
            ['Anomaly alerts','Baselines learn your seasonality and page the right owner.'],
            ['Warehouse sync','Reverse ETL back into the tools your team already uses.'],
            ['Audit trail','Every query, dashboard and export is attributable.'],
            ['Semantic layer','Define a metric once; it means the same thing everywhere.']],
    stats: [['2.4B','events / day'],['180ms','p95 query'],['99.99%','uptime'],['40+','connectors']],
  },
  {
    kind: 'payments', nav: ['Payments', 'Billing', 'Payouts', 'Developers', 'Pricing'],
    heads: ['Move money without the moving parts', 'Billing that survives contact with reality', 'Payments infrastructure, minus the plumbing', 'Charge, reconcile, sleep', 'Revenue that reconciles itself', 'One integration, forty markets', 'The ledger that always balances', 'Billing complexity, quietly absorbed'],
    ledes: ['One API for cards, transfers and payouts across 40 markets, with reconciliation that actually balances.', 'Usage billing, retries and payouts on a double-entry ledger you can audit line by line.', 'Take payments in 40 markets on local rails, and close the books without a spreadsheet.'],
    feats: [['Smart retries','Recover failed charges with issuer-aware scheduling.'],
            ['Usage billing','Meter anything and invoice it without a rewrite.'],
            ['Ledger','Double-entry by default, reconciled to the cent.'],
            ['Global payouts','Local rails in 40 markets, one integration.'],
            ['Fraud rules','Composable checks you can read and version.'],
            ['Tax handling','Registration thresholds tracked automatically.']],
    stats: [['$18B','processed'],['0.4%','fraud rate'],['40','markets'],['6 min','to first charge']],
  },
  {
    kind: 'design', nav: ['Product', 'Templates', 'Community', 'Changelog', 'Pricing'],
    heads: ['Design systems that stay in sync', 'From token to production, one hop', 'Your design language, versioned', 'One source, every surface', 'Design decisions that survive handoff', 'Tokens in, products out', 'Stop rebuilding the same button', 'The system behind the system'],
    ledes: ['Define tokens once and ship them to every surface — web, native and docs — from a single source.', 'Author your design language once; publish it to CSS, Swift, Compose and Figma automatically.', 'Version your tokens like code, see what each change touches, and validate contrast on every save.'],
    feats: [['Token pipeline','Author once, publish to CSS, Swift, Compose and Figma.'],
            ['Version diffs','See exactly which surfaces a token change touches.'],
            ['Contrast checks','Every pair validated against WCAG on save.'],
            ['Theme matrices','Light, dark and brand variants from one definition.'],
            ['Component registry','Track adoption across every repo.'],
            ['Handoff','Specs generated from the same source as the code.']],
    stats: [['12k','tokens managed'],['300+','components'],['4','platforms'],['1 source','of truth']],
  },
  {
    kind: 'infra', nav: ['Platform', 'Runtime', 'Security', 'Docs', 'Pricing'],
    heads: ['Ship to the edge, sleep through the night', 'Infrastructure that gets out of the way', 'Deploy in seconds, roll back in one', 'No cluster to babysit', 'Production, minus the pager', 'Global by default, simple on purpose', 'The platform that stops asking for attention', 'From commit to edge in eight seconds'],
    ledes: ['Global runtime with instant rollbacks, preview environments per branch, and no cluster to babysit.', 'Push a branch, get an environment. Merge it, and it disappears. Roll back in one click.', 'Thirty regions, sub-40ms cold starts, and autoscaling to zero between requests.'],
    feats: [['Instant rollback','Every deploy is immutable and one click from reverted.'],
            ['Preview envs','A full environment per pull request, torn down on merge.'],
            ['Edge runtime','Executes in 30 regions, close to whoever is asking.'],
            ['Secrets','Scoped, rotated and never printed to a log.'],
            ['Observability','Traces, logs and metrics correlated by default.'],
            ['Autoscaling','Scales to zero between requests; no idle bill.']],
    stats: [['30','regions'],['<40ms','cold start'],['99.99%','SLA'],['8s','median deploy']],
  },
  {
    kind: 'crm', nav: ['Platform', 'Pipeline', 'Automations', 'Customers', 'Pricing'],
    heads: ['Your pipeline, finally legible', 'Close the loop on every conversation', 'One record per customer, everywhere', 'Know where every deal actually stands', 'The CRM your reps stop avoiding', 'Context, on every call', 'Forecasts that show their working', 'Every touchpoint, one timeline'],
    ledes: ['A customer record that updates itself from the tools your team already lives in.', 'Every email, call and ticket on one timeline, with automations you can read without a consultant.', 'Pipeline hygiene that maintains itself, and forecasts that show exactly how they were built.'],
    feats: [['Unified timeline','Email, calls and tickets on one thread per account.'],
            ['Pipeline rules','Automations you can read without a consultant.'],
            ['Forecasting','Weighted projections that show their working.'],
            ['Enrichment','Firmographics refreshed nightly, sourced and cited.'],
            ['Routing','Assign by territory, load or expertise.'],
            ['Reporting','Board-ready summaries generated from live data.']],
    stats: [['3.1x','pipeline velocity'],['12 hrs','saved / rep / week'],['94%','data coverage'],['5 min','setup']],
  },
  {
    kind: 'scheduling', nav: ['Product', 'Teams', 'Calendars', 'Integrations', 'Pricing'],
    heads: ['The meeting that books itself', 'Time, coordinated', 'Scheduling without the back and forth', 'Find the time, skip the thread', 'Calendars that respect focus', 'Booking, reduced to one link', 'No more 4pm Friday calls', 'Availability that thinks ahead'],
    ledes: ['Availability that respects focus time, time zones and the fact that nobody wants a 4pm Friday call.', 'Share one link. Everyone sees their own clock, buffers appear automatically, nothing double-books.', 'Round-robin that distributes fairly, reminders on the channel each person reads, and no email threads.'],
    feats: [['Focus guard','Protects deep-work blocks from casual bookings.'],
            ['Round robin','Distributes by fairness, not alphabetical order.'],
            ['Time-zone sanity','Everyone sees their own clock, always.'],
            ['Buffers','Automatic gaps so back-to-back never happens.'],
            ['Rescheduling','One link, no email thread.'],
            ['Reminders','Nudges on the channel each person actually reads.']],
    stats: [['1.2M','meetings booked'],['62%','fewer no-shows'],['9 hrs','saved / month'],['0','double bookings']],
  },
  {
    kind: 'security', nav: ['Platform', 'Threats', 'Compliance', 'Reports', 'Pricing'],
    heads: ['See the blast radius before it happens', 'Security posture, continuously proven', 'Evidence, not assurances', 'Audits that stop being fire drills', 'Controls that check themselves', 'Compliance without the scramble', 'Always audit-ready, by construction', 'Proof on demand'],
    ledes: ['Continuous control monitoring with evidence collected automatically, so audits stop being a fire drill.', 'Policies as code, evidence gathered on schedule, and an audit package your assessor accepts.', 'Fourteen hundred controls checked continuously — not once a year, the week before the audit.'],
    feats: [['Control monitoring','Every control checked continuously, not annually.'],
            ['Evidence capture','Screenshots and logs gathered on schedule.'],
            ['Access review','Quarterly reviews that complete themselves.'],
            ['Vendor risk','Track subprocessors and their attestations.'],
            ['Policy engine','Policies as code, versioned and reviewed.'],
            ['Audit export','One package, formatted for your auditor.']],
    stats: [['SOC 2','Type II'],['1,400','controls'],['11 days','to audit-ready'],['24/7','monitoring']],
  },
  {
    kind: 'content', nav: ['Product', 'Editor', 'Workflows', 'Docs', 'Pricing'],
    heads: ['Publishing without the bottleneck', 'Content that ships itself', 'Write once, render anywhere', 'No deploy required', 'Structure over soup', 'The editor your writers requested', 'From draft to edge in one click', 'Content operations, unblocked'],
    ledes: ['A structured editor and a delivery API, so content moves without a deploy or a developer.', 'Blocks with real schemas, workflows with real owners, and publishing that never needs engineering.', 'Localize per field, preview the real page, and invalidate the edge cache the moment you publish.'],
    feats: [['Structured editor','Blocks with real schemas, not soup.'],
            ['Workflow','Draft, review and scheduled publish with a clear owner.'],
            ['Localization','Translate per field with fallbacks that make sense.'],
            ['Delivery API','Cached at the edge, invalidated on publish.'],
            ['Versioning','Every change diffable and revertible.'],
            ['Preview','See the real page before anyone else does.']],
    stats: [['400ms','global TTFB'],['22','locales'],['1M+','documents'],['0','deploys to publish']],
  },
];

const QUOTES = [
  'We replaced four tools with this and nobody has asked for them back.',
  'The rollout took an afternoon. The hard part was telling everyone it was done.',
  'It is the first system our engineers and our designers both open voluntarily.',
  'What used to take a quarter now takes a standup.',
  'The defaults are opinionated in exactly the way we needed.',
  'Our audit went from six weeks of scrambling to a morning of exports.',
];
const PEOPLE = [
  ['A. Marchetti','Head of Platform'], ['R. Okonkwo','VP Engineering'],
  ['S. Lindqvist','Design Lead'], ['J. Ferreira','Director of Ops'],
  ['M. Haddad','Staff Engineer'], ['T. Nakamura','Product Lead'],
];
const ORGS = ['Northwind','Aperture','Meridian','Halcyon','Brightline','Kestrel','Lumen Works','Fathom','Verity','Ostara','Wayfarer','Ironwood'];
const TIERS = [
  ['Starter','0', ['1 workspace','Community support','7-day history']],
  ['Team','29', ['Unlimited workspaces','Priority support','1-year history','SSO']],
  ['Scale','custom',['Dedicated region','99.99% SLA','Audit log export','Named engineer']],
];
const FAQS = [
  ['How long does setup take?','Most teams are live the same day. The longest step is usually deciding who owns it.'],
  ['Can we self-host?','Yes, on the Scale plan. The same build, running in your own account.'],
  ['What happens to our data if we leave?','You export everything in an open format. No retention hold, no exit fee.'],
  ['Do you offer a migration path?','We read from the usual suspects and keep both systems in sync during cutover.'],
];

export function buildContent(rng, title, tagline) {
  const cat = one(rng, CATEGORIES);
  const feats = some(rng, cat.feats, 3 + Math.floor(rng() * 4));
  return {
    kind: cat.kind,
    nav: cat.nav,
    eyebrow: one(rng, ['New', 'Now in beta', 'Introducing', 'Version 3', 'Early access', 'Generally available']),
    headline: one(rng, cat.heads),
    lede: one(rng, cat.ledes),
    tagline,
    ctaPrimary: one(rng, ['Start free', 'Get started', 'Request access', 'Book a demo', 'Try it now']),
    ctaSecondary: one(rng, ['Read the docs', 'See how it works', 'Talk to us', 'View changelog']),
    features: feats,
    stats: cat.stats,
    quotes: some(rng, QUOTES, 2).map((q, i) => ({ quote: q, who: some(rng, PEOPLE, 2)[i] || PEOPLE[0] })),
    orgs: some(rng, ORGS, 6),
    tiers: TIERS,
    faqs: some(rng, FAQS, 3),
    footerCols: [
      ['Product', ['Overview', 'Changelog', 'Roadmap', 'Status']],
      ['Company', ['About', 'Careers', 'Press', 'Contact']],
      ['Resources', ['Docs', 'Guides', 'API', 'Support']],
    ],
  };
}
