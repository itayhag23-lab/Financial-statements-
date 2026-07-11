const { serviceClient, rowFromSubscription, verifySignature } = require('./_lemonsqueezy');

// Lemon Squeezy webhook receiver. Lemon Squeezy calls this whenever a
// subscription is created or changes; we verify the signature, then update the
// user's subscriptions row (the source of truth the app reads to unlock AI).
//
// Body parsing is disabled so we can verify the signature over the exact raw
// bytes Lemon Squeezy signed.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured.' });

  let raw;
  try { raw = await readRawBody(req); } catch { return res.status(400).json({ error: 'Could not read body.' }); }

  if (!verifySignature(raw, req.headers['x-signature'], secret)) {
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  const admin = serviceClient();
  if (!admin) return res.status(500).json({ error: 'Server not configured.' });

  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ error: 'Bad payload.' }); }

  const name = event?.meta?.event_name || '';
  const userId = event?.meta?.custom_data?.user_id;
  const sub = event?.data;

  try {
    if (name.startsWith('subscription_') && sub && userId) {
      // rowFromSubscription already maps status → plan (cancelled/expired/paused
      // all resolve to a non-active status, i.e. plan 'free').
      await admin.from('subscriptions').upsert(
        { user_id: userId, ...rowFromSubscription(sub) },
        { onConflict: 'user_id' }
      );
    }
    // Acknowledge everything (even unhandled events) so Lemon Squeezy stops retrying.
    return res.status(200).json({ received: true });
  } catch (err) {
    // 500 tells Lemon Squeezy to retry later — appropriate for transient DB errors.
    return res.status(500).json({ error: err.message || 'Handler error.' });
  }
};

// Vercel: don't parse the body, so we can verify the raw signed bytes.
module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
