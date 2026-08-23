#!/usr/bin/env node
/**
 * Replace the placeholder site URL everywhere it appears.
 *   npm run seo:domain -- https://your-real-domain.in
 * Run this once, before the first deploy. A canonical tag pointing at the
 * wrong host will keep the site out of Google's index.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const PLACEHOLDER = 'https://www.legalaccess.in';

// scripts/practice-areas.data.mjs holds the SITE constant the generator reads,
// so it must be rewritten too — otherwise the next `npm run build:practice`
// puts the placeholder straight back. Generated pages are patched in place so
// an existing tree is correct without needing a regenerate.
const FILES = [
   'index.html',
   'public/robots.txt',
   'public/sitemap.xml',
   'scripts/practice-areas.data.mjs',
   ...(existsSync('practice')
      ? readdirSync('practice', { withFileTypes: true })
           .filter(e => e.isDirectory())
           .map(e => `practice/${e.name}/index.html`)
      : [])
].filter(existsSync);

const raw = process.argv[2];
if (!raw) {
   console.error('Usage: npm run seo:domain -- https://your-real-domain.in');
   process.exit(1);
}

let site;
try {
   site = new URL(raw);
} catch {
   console.error(`"${raw}" is not a valid URL. Include the protocol, e.g. https://example.in`);
   process.exit(1);
}
if (site.protocol !== 'https:') {
   console.error('Use an https:// URL — search engines treat http as a downgrade.');
   process.exit(1);
}

const base = site.origin; // strips any path, query or trailing slash
let total = 0;

for (const file of FILES) {
   const before = readFileSync(file, 'utf8');
   const after = before.replaceAll(PLACEHOLDER, base);
   const hits = before.split(PLACEHOLDER).length - 1;
   if (hits) writeFileSync(file, after);
   total += hits;
   console.log(`${hits.toString().padStart(3)}  ${file}`);
}

if (total === 0) {
   console.log(`\nNothing replaced — the placeholder "${PLACEHOLDER}" was not found.`);
   console.log('It looks like the domain was already set.');
} else {
   console.log(`\nReplaced ${total} references with ${base}`);
   console.log('Next: rebuild (npm run build) and submit the sitemap in Google Search Console.');
}
