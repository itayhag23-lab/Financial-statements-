/* eslint-disable */
// Build-time pre-rendering for this Create React App SPA.
//
// CRA ships an empty <div id="root">, so search engines and link-preview bots
// only see a blank shell until JavaScript runs. This script renders the public
// routes to static HTML with react-dom/server (pure Node — no headless browser,
// so it runs reliably in any CI, including Vercel) and injects that markup into
// the built index.html. The client then hydrates it (see src/index.js).
//
// It is intentionally fail-safe: if anything goes wrong the build still
// succeeds and the app falls back to normal client-side rendering, so a
// prerender hiccup can never take the site down.
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT, 'build');

const SITE = 'https://koalastatements.com';

// Static, public, eagerly-imported routes. /app, /dashboard, /r/* are private
// or dynamic (and code-split), so they stay client-rendered. The Learn hub and
// its articles are appended at runtime from the content library (see main).
const BASE_ROUTES = ['/', '/privacy', '/terms'];

// Per-route <head> overrides. "/" uses the defaults already in index.html.
// Learn routes are merged in at runtime from prerender-entry's learnRoutes.
const ROUTE_META = {
  '/privacy': {
    title: 'Privacy Policy | Koala Statements',
    description: 'How Koala Statements collects, uses, stores, and protects your data.',
  },
  '/terms': {
    title: 'Terms of Service | Koala Statements',
    description: 'The terms that govern your use of Koala Statements.',
  },
};

// Rewrites the title, meta description, canonical, and og:url/og:title for a
// given route so each pre-rendered page has its own, accurate <head>.
function applyMeta(html, route) {
  const meta = ROUTE_META[route];
  const canonical = SITE + (route === '/' ? '/' : route);
  let out = html
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
  if (meta) {
    out = out
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${meta.description}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${meta.title}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${meta.description}$2`);
  }
  return out;
}

async function main() {
  const indexPath = path.join(BUILD_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.warn('[prerender] build/index.html not found — skipping');
    return;
  }

  // Bundle the SSR entry for Node. CSS/image imports are stubbed out, and the
  // browser-only analytics SDK is aliased to a no-op.
  const outfile = path.join(ROOT, 'node_modules', '.cache', 'prerender', 'entry.cjs');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'prerender-entry.jsx')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    jsx: 'automatic',
    logLevel: 'error',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: {
      '.css': 'empty', '.svg': 'empty', '.png': 'empty', '.jpg': 'empty',
      '.jpeg': 'empty', '.gif': 'empty', '.webp': 'empty',
    },
    alias: { 'posthog-js': path.join(__dirname, 'stubs', 'posthog.js') },
  });

  const { renderRoute, learnRoutes = [] } = require(outfile);

  // Merge the Learn library's routes + metadata in from the content library.
  const ROUTES = [...BASE_ROUTES, ...learnRoutes.map((r) => r.path)];
  for (const r of learnRoutes) {
    ROUTE_META[r.path] = { title: r.title, description: r.description };
  }

  let template = fs.readFileSync(indexPath, 'utf8');
  const MARKER = '<div id="root"></div>';

  // Inline the app's own stylesheet so the browser never has to make a
  // second, chained request for it (Lighthouse's "render-blocking requests"
  // diagnostic) -- at ~13 KB raw it's cheap enough to ship inline.
  const cssLink = template.match(/<link href="(\/static\/css\/[^"]+\.css)" rel="stylesheet">/);
  if (cssLink) {
    const cssPath = path.join(BUILD_DIR, cssLink[1]);
    if (fs.existsSync(cssPath)) {
      const css = fs.readFileSync(cssPath, 'utf8');
      template = template.replace(cssLink[0], `<style>${css}</style>`);
    }
  }

  for (const route of ROUTES) {
    const html = renderRoute(route);
    const page = applyMeta(template, route).replace(MARKER, `<div id="root">${html}</div>`);

    // "/" overwrites index.html; other routes get their own folder/index.html
    // so Vercel serves the pre-rendered file for that path.
    let outPath;
    if (route === '/') {
      outPath = indexPath;
    } else {
      const dir = path.join(BUILD_DIR, route);
      fs.mkdirSync(dir, { recursive: true });
      outPath = path.join(dir, 'index.html');
    }
    fs.writeFileSync(outPath, page);
    console.log(`[prerender] wrote ${route} (${html.length} bytes of markup)`);
  }
}

main().catch((err) => {
  // Never fail the build over a prerender error — fall back to client render.
  console.warn('[prerender] skipped due to error:', err && err.message);
  process.exit(0);
});
