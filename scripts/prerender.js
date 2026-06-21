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

// Only static, public, non-lazy routes. /app, /dashboard, /r/* are private or
// dynamic; the privacy/terms pages are lazy-loaded so they'd render their
// Suspense fallback, not content — skip them here.
const ROUTES = ['/'];

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

  const { renderRoute } = require(outfile);
  const template = fs.readFileSync(indexPath, 'utf8');
  const MARKER = '<div id="root"></div>';

  for (const route of ROUTES) {
    const html = renderRoute(route);
    const page = template.replace(MARKER, `<div id="root">${html}</div>`);

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
