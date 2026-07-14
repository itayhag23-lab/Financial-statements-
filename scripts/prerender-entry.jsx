// Server-render entry used by scripts/prerender.js. esbuild bundles this for
// Node, then the orchestrator calls renderRoute() for each public path.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../src/App';
import { ARTICLES } from '../src/lib/learnContent';
import { TEMPLATES } from '../src/lib/templateContent';
import { TOOLS } from '../src/lib/toolsContent';

// Turn an article's human "updated" (e.g. "July 2026") into an ISO date so the
// sitemap can carry a real <lastmod> per article instead of "today" on every
// build (which trains crawlers to distrust the dates). Undefined if unparseable.
const _MONTHS = { january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };
function isoFromUpdated(u) {
  const m = String(u || '').trim().match(/([A-Za-z]+)\s+(\d{4})/);
  if (!m) return undefined;
  const mi = _MONTHS[m[1].toLowerCase()];
  if (mi == null) return undefined;
  return `${m[2]}-${String(mi + 1).padStart(2, '0')}-01`;
}

export function renderRoute(path) {
  return renderToString(
    <StaticRouter location={path}>
      <App />
    </StaticRouter>
  );
}

// Public Learn routes + their <head> metadata, derived from the content library
// so prerender.js never has to hardcode article slugs. The hub plus one page per
// article, each SEO-titled from its own copy.
export const learnRoutes = [
  {
    path: '/learn',
    title: 'Learn Financial Statements in Plain English | Koala Statements',
    description: 'A free, plain-English library on the income statement, balance sheet, and cash flow statement — for founders, students, and anyone learning to read the numbers.',
  },
  ...ARTICLES.map((a) => ({
    path: `/learn/${a.slug}`,
    title: `${a.title} | Koala Statements`,
    description: a.dek,
    lastmod: isoFromUpdated(a.updated),
  })),
];

// Programmatic-SEO growth routes: the Templates hub + one page per industry,
// and the Tools hub + one page per calculator. Each gets its own <head>.
export const templateRoutes = [
  {
    path: '/templates',
    title: 'Financial Model Templates by Industry (Free) | Koala Statements',
    description:
      'Free financial model templates for SaaS, e-commerce, marketplace, agency, restaurant, and subscription businesses. Pick your industry and AI builds a full 3-statement model.',
  },
  ...TEMPLATES.map((t) => ({
    path: `/templates/${t.slug}`,
    title: t.metaTitle,
    description: t.metaDescription,
  })),
];

export const toolRoutes = [
  {
    path: '/tools',
    title: 'Free Startup Finance Calculators | Koala Statements',
    description:
      'Free finance calculators for founders: startup runway, burn rate, and LTV:CAC. Instant answers, no signup — then turn any of them into a full financial model.',
  },
  ...TOOLS.map((t) => ({
    path: `/tools/${t.slug}`,
    title: t.metaTitle,
    description: t.metaDescription,
  })),
];
