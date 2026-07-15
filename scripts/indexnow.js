/* eslint-disable */
// Post-deploy IndexNow submission.
//
// Google retired its sitemap-ping endpoint, but Bing, Yandex, Seznam and other
// IndexNow participants crawl submitted URLs within minutes. This reads the
// freshly built sitemap and submits every URL to IndexNow so new/updated pages
// get discovered fast — without waiting for the next organic crawl.
//
// It is opt-in and fail-safe:
//   • Uses INDEXNOW_KEY from the env if set; otherwise auto-discovers the key
//     file committed under public/ (copied to build/ by the CRA build). An
//     IndexNow key is public by design — it's served at /<key>.txt for the
//     search engines to read — so committing it carries no secret, and a key
//     can only ever submit URLs for its own host.
//   • Any network/parse error is swallowed — a submission hiccup must never
//     fail the deploy.
//
// To rotate the key: replace public/<key>.txt with a new one (filename must
// equal its contents). Generate a key with:
//   node -e "console.log(require('crypto').randomUUID().replace(/-/g,''))"
const fs = require('fs');
const path = require('path');

const HOST = 'koalastatements.com';
const SITE = `https://${HOST}`;
const BUILD_DIR = path.resolve(__dirname, '..', 'build');

const KEY_RE = /^[a-zA-Z0-9-]{8,128}$/;

// Finds the committed IndexNow key file in the build output: a "<token>.txt"
// whose contents equal its own basename (the signature of a key file). Returns
// the token, or null if none is present.
function discoverKeyFromBuild() {
  try {
    for (const file of fs.readdirSync(BUILD_DIR)) {
      if (!file.endsWith('.txt')) continue;
      const token = file.slice(0, -4);
      if (!KEY_RE.test(token)) continue;
      const body = fs.readFileSync(path.join(BUILD_DIR, file), 'utf8').trim();
      if (body === token) return token;
    }
  } catch { /* fall through to null */ }
  return null;
}

async function main() {
  const key = process.env.INDEXNOW_KEY || discoverKeyFromBuild();
  if (!key) {
    console.log('[indexnow] no key (env INDEXNOW_KEY or public/<key>.txt) — skipping submission');
    return;
  }
  if (!KEY_RE.test(key)) {
    console.warn('[indexnow] key looks invalid (need 8–128 url-safe chars) — skipping');
    return;
  }

  const sitemapPath = path.join(BUILD_DIR, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.warn('[indexnow] build/sitemap.xml not found — skipping');
    return;
  }

  // Ensure the key file exists in the build output so IndexNow can verify we
  // own this key/host (it's already there when committed under public/, but an
  // env-only key still needs it written).
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
