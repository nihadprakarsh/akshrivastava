#!/usr/bin/env node
/**
 * Generates one page per practice area into practice/<slug>/index.html.
 *
 * Matters are parsed out of index.html so the pages never drift from the
 * canonical case list — re-run this after editing cases:
 *   npm run build:practice
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { AREAS, SITE } from './practice-areas.data.mjs';

const MAX_MATTERS = 24;

/* ---------- parse the real matters out of index.html ---------- */
const home = readFileSync('index.html', 'utf8');

const CASE_RE =
   /<div class="case-card premium-card" data-category="([^"]+)">\s*<h4 class="case-title">([\s\S]*?)<\/h4>\s*<p class="case-court">([\s\S]*?)<\/p>\s*<p class="case-summary">([\s\S]*?)<\/p>\s*<span class="case-tag">([\s\S]*?)<\/span>/g;

const clean = s => s.replace(/\s+/g, ' ').trim();
const cases = [];
for (const m of home.matchAll(CASE_RE)) {
   cases.push({ category: m[1], title: clean(m[2]), court: clean(m[3]), summary: clean(m[4]), tag: clean(m[5]) });
}
if (!cases.length) {
   console.error('No case cards parsed from index.html — aborting rather than writing empty pages.');
   process.exit(1);
}

/* ---------- shared chrome, lifted from index.html so it stays in sync ---------- */
const slice = (start, end) => {
   const a = home.indexOf(start);
   const b = home.indexOf(end, a);
   if (a === -1 || b === -1) throw new Error(`Could not locate "${start}" in index.html`);
   return home.slice(a, b);
};

// Header and footer are reused verbatim; in-page anchors are rewritten to
// absolute so they still resolve from a subdirectory.
const header = slice('<header class="header" id="header">', '</header>') + '</header>';
const footer = slice('<footer class="footer">', '</footer>') + '</footer>';
const modal = slice('<div class="modal hidden" id="consultation-modal">', '<script src=');

const toAbsolute = html =>
   html
      .replace(/href="#([a-z-]+)"/g, 'href="/#$1"')
      // the copied header marks Home active; on a practice page it isn't
      .replace(/ active-link/g, '')
      .replace('href="/#practice" class="nav__link"', 'href="/#practice" class="nav__link active-link"');

const ICONS = {};
for (const m of home.matchAll(/<div class="practice-card__icon">(<svg[\s\S]*?<\/svg>)<\/div>/g)) {
   ICONS[Object.keys(ICONS).length] = m[1];
}
const iconFor = i => Object.values(ICONS)[i] || '';

const esc = s => s.replace(/&(?!(amp|lt|gt|quot|#\d+|[a-z]+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/* ---------- emit ---------- */
let written = 0;
const report = [];

AREAS.forEach((area, index) => {
   const matched = cases.filter(area.match);
   const shown = matched.slice(0, MAX_MATTERS);
   const url = `${SITE}/practice/${area.slug}/`;

   const others = AREAS.filter(a => a.slug !== area.slug);

   const jsonld = {
      '@context': 'https://schema.org',
      '@graph': [
         {
            '@type': 'Service',
            '@id': `${url}#service`,
            name: area.name,
            serviceType: area.name,
            description: area.description,
            provider: { '@id': `${SITE}/#firm` },
            areaServed: { '@type': 'Country', name: 'India' },
            audience: { '@type': 'Audience', audienceType: 'Individuals, companies and organisations in India' },
            availableChannel: {
               '@type': 'ServiceChannel',
               serviceUrl: url,
               servicePhone: '+91-33-4063-3220',
               availableLanguage: ['en', 'hi']
            }
         },
         {
            '@type': 'BreadcrumbList',
            '@id': `${url}#breadcrumb`,
            itemListElement: [
               { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
               { '@type': 'ListItem', position: 2, name: 'Practice Areas', item: `${SITE}/#practice` },
               { '@type': 'ListItem', position: 3, name: area.name, item: url }
            ]
         },
         {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: area.title,
            description: area.description,
            inLanguage: 'en-IN',
            isPartOf: { '@id': `${SITE}/#website` },
            about: { '@id': `${url}#service` },
            breadcrumb: { '@id': `${url}#breadcrumb` },
            primaryImageOfPage: { '@id': `${SITE}/#logo` }
         }
      ]
   };

   const matterMarkup = shown.length
      ? `<ol class="matter-list">
${shown
   .map(
      c => `                     <li class="matter">
                        <h3 class="matter__title">${esc(c.title)}</h3>
                        <p class="matter__cite">${esc(c.court)}</p>
                        <p class="matter__note">${esc(c.summary)}</p>
                        <span class="matter__tag">${esc(c.tag)}</span>
                     </li>`
   )
   .join('\n')}
                  </ol>
                  ${
                     matched.length > shown.length
                        ? `<p class="matter-more">Showing ${shown.length} of ${matched.length} matters in this area. <a href="/#notable-cases">See the full case index</a>.</p>`
                        : `<p class="matter-more"><a href="/#notable-cases">See the full case index</a> across all forums.</p>`
                  }`
      : `<p class="matter-empty">Matters in this area are listed in the <a href="/#notable-cases">full case index</a>.</p>`;

   const page = `<!DOCTYPE html>
<html lang="en-IN" data-color-scheme="light">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">

      <title>${attr(area.title)} | Legal Access</title>
      <meta name="description" content="${attr(area.description)}">
      <link rel="canonical" href="${url}">
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
      <meta name="author" content="Advocate Akhilesh Shrivastava">

      <meta property="og:type" content="article">
      <meta property="og:site_name" content="Legal Access &mdash; Layman&rsquo;s Law">
      <meta property="og:locale" content="en_IN">
      <meta property="og:url" content="${url}">
      <meta property="og:title" content="${attr(area.title)}">
      <meta property="og:description" content="${attr(area.description)}">
      <meta property="og:image" content="${SITE}/assets/logo.png">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${attr(area.title)}">
      <meta name="twitter:description" content="${attr(area.description)}">
      <meta name="twitter:image" content="${SITE}/assets/logo.png">

      <meta name="theme-color" content="#EFEAE2" media="(prefers-color-scheme: light)">
      <meta name="theme-color" content="#070C15" media="(prefers-color-scheme: dark)">
      <link rel="icon" href="/assets/logo.png" type="image/png">

      <script>
         (function () {
            var theme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-color-scheme', theme);
         })();
      </script>

      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,SOFT,WONK,wght@9..144,0..100,0..1,300..700&family=Figtree:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
      <link rel="stylesheet" href="/style.css">

      <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)
   .split('\n')
   .map(l => '      ' + l)
   .join('\n')}
      </script>
   </head>
   <body class="page-practice">
      <div class="cursor-light-effect"></div>
${toAbsolute(header)}
      <main>
         <section class="subhero">
            <div class="subhero__bg"></div>
            <div class="container">
               <nav class="crumbs" aria-label="Breadcrumb">
                  <a href="/">Home</a>
                  <span aria-hidden="true">/</span>
                  <a href="/#practice">Practice Areas</a>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page">${esc(area.name)}</span>
               </nav>
               <div class="subhero__icon">${iconFor(index)}</div>
               <h1 class="subhero__title">${esc(area.name)}</h1>
               <p class="subhero__lede">${esc(area.lede)}</p>
               <div class="subhero__cta">
                  <button class="btn btn--primary btn--lg btn--glow consultation-btn">
                  <span>Book a consultation</span>
                  </button>
                  <a href="/#notable-cases" class="btn btn--outline btn--lg btn--glass">See all matters</a>
               </div>
            </div>
         </section>

         <section class="pa-overview">
            <div class="container pa-overview__grid">
               <div class="pa-prose">
                  <h2 class="pa-h2">How we work in this area</h2>
${area.body.map(p => `                  <p>${esc(p)}</p>`).join('\n')}
               </div>
               <aside class="pa-aside">
                  <div class="pa-card">
                     <h2 class="pa-card__title">What we handle</h2>
                     <ul class="pa-card__list">
${area.services.map(s => `                        <li>${esc(s)}</li>`).join('\n')}
                     </ul>
                  </div>
                  <div class="pa-card">
                     <h2 class="pa-card__title">Forums</h2>
                     <ul class="pa-card__forums">
${area.forums.map(f => `                        <li>${esc(f)}</li>`).join('\n')}
                     </ul>
                  </div>
                  <div class="pa-card pa-card--contact">
                     <p class="pa-card__note">Offices in Jamshedpur and Kolkata. Monday to Friday, 10:00&ndash;18:00.</p>
                     <a href="tel:+913340633220" class="pa-card__phone">+91-33-4063-3220</a>
                     <button class="btn btn--primary btn--full-width btn--glow consultation-btn">
                     <span>Request a consultation</span>
                     </button>
                  </div>
               </aside>
            </div>
         </section>

         <section class="pa-matters">
            <div class="container">
               <div class="section-header" data-label="Record">
                  <h2 class="section__title">Matters in this area</h2>
                  <p class="section__subtitle">Drawn from the firm&rsquo;s case index. Listed as a record of practice, not as a representation about any future result.</p>
               </div>
               ${matterMarkup}
            </div>
         </section>

         <section class="pa-related">
            <div class="container">
               <div class="section-header" data-label="Also">
                  <h2 class="section__title">Other practice areas</h2>
               </div>
               <div class="pa-related__grid">
${others
   .map(
      o => `                  <a class="pa-related__card" href="/practice/${o.slug}/">
                     <h3>${esc(o.name)}</h3>
                     <p>${esc(o.lede)}</p>
                     <span class="pa-related__go">Read more &rarr;</span>
                  </a>`
   )
   .join('\n')}
               </div>
            </div>
         </section>

         <section class="cta-banner">
            <div class="container">
               <div class="cta-banner__content">
                  <h2 class="cta-banner__title">Discuss a matter in ${esc(area.name)}</h2>
                  <p class="cta-banner__text">Share the essentials and we will follow up with the next available consultation slot.</p>
                  <button class="btn btn--primary btn--lg btn--glow consultation-btn">
                  <span>Book a consultation</span>
                  </button>
               </div>
            </div>
         </section>
      </main>
${toAbsolute(footer)}
${toAbsolute(modal)}
      <script src="/app.js"></script>
   </body>
</html>
`;

   mkdirSync(`practice/${area.slug}`, { recursive: true });
   writeFileSync(`practice/${area.slug}/index.html`, page);
   written++;
   report.push(`  ${area.slug.padEnd(28)} ${String(shown.length).padStart(2)} matters shown / ${matched.length} matched`);
});

console.log(`Parsed ${cases.length} matters from index.html`);
console.log(report.join('\n'));
console.log(`\nWrote ${written} practice-area pages.`);
