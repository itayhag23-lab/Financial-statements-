/* eslint-disable */
// Post-deploy IndexNow submission.
//
// Google retired its sitemap-ping endpoint, but Bing, Yandex, Seznam and other
// IndexNow participants crawl submitted URLs within minutes. This reads the
// freshly built sitemap and submits every URL to IndexNow so new/updated pages
// get discovered fast — without waiting for the next organic crawl.
//
// It is opt-in and fail-safe:
//   • Does nothing unless INDEXNOW_KEY is set (a 8–128 char hex-ish token).
//   • Writes build/<key>.txt so the search engines can verify key ownership.
//   • Any network/parse error is swallowed — a submission hiccup must never
//     fail the deploy.
//
// Set INDEXNOW_KEY in the Vercel project env to enable. Generate a key with:
//   node -e "console.log(require('crypto').randomUUID().replace(/-/g,''))"
const fs = require('fs');
const path = require('path');

const HOST = 'koalastatements.com';
const SITE = `https://${HOST}`;
const BUILD_DIR = path.resolve(__dirname, '..', 'build');

async function main() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    console.log('[indexnow] INDEXNOW_KEY not set — skipping submission');
    return;
  }
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    console.warn('[indexnow] INDEXNOW_KEY looks invalid (need 8–128 url-safe chars) — skipping');
    return;
  }

  const sitemapPath = path.join(BUILD_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.warn('[indexnow] build/sitemap.xml not found — skipping');
    return;
  }

  // Publish the key file so IndexNow can verify we own this key/host.
  try {
    fs.writeFileSync(path.join(BUILD_DIR, `${key}.txt`), key);
  } catch (err) {
    console.warn('[indexnow] could not write key file — skipping:', err && err.message);
    return;
  }

  const xml = fs.readFileSync(sitemapPath, 'utf8');
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter(Boolean);
  if (!urlList.length) {
    console.warn('[indexnow] no <loc> URLs parsed from sitemap — skipping');
    return;
  }

  const payload = {
    host: HOST,
    key,
    keyLocation: `${SITE}/${key}.txt`,
    urlList,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });
    // IndexNow returns 200 or 202 on success; treat anything else as a soft warn.
    if (res.ok) console.log(`[indexnow] submitted ${urlList.length} URLs (HTTP ${res.status})`);
    else console.warn(`[indexnow] submission returned HTTP ${res.status} — search engines may retry later`);
  } catch (err) {
    console.warn('[indexnow] submission failed (non-fatal):', err && err.message);
  }
}

main().catch((err) => {
  console.warn('[indexnow] skipped due to error:', err && err.message);
  process.exit(0);
});
