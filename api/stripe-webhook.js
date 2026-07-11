const crypto = require('crypto');
const { stripeRequest, serviceClient, rowFromSubscription } = require('./_stripe');

// Stripe webhook receiver. Stripe calls this after a checkout completes or a
// subscription changes; we verify the signature, then update the user's
// subscriptions row (the source of truth the app reads to unlock AI).
//
// Body parsing is disabled so we can verify the signature over the exact raw
// bytes Stripe signed.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured.' });

  let raw;
  try { raw = await readRawBody(req); } catch { return res.status(400).json({ error: 'Could not read body.' }); }

  const sig = req.headers['stripe-signature'] || '';
  if (!verifySignature(raw, sig, secret)) {
    return res.status(400).json({ error: 'Invalid signature.' });
  }

  const admin = serviceClient();
  if (!admin) return res.status(500).json({ error: 'Server not configured.' });

  let event;
  try { event = JSON.parse(raw.toString('utf8')); } catch { return res.status(400).json({ error: 'Bad payload.' }); }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id || session.client_reference_id;
      if (userId && session.subscription) {
        // Pull the full subscription to learn status/interval/period end.
        const sub = await stripeRequest('GET', `/subscriptions/${session.subscription}`);
        await admin.from('subscriptions').upsert(
          { user_id: userId, stripe_customer_id: session.customer, ...rowFromSubscription(sub) },
          { onConflict: 'user_id' }
        );
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const userId = sub.metadata?.user_id;
      if (userId) {
        const row = event.type === 'customer.subscription.deleted'
          ? { plan: 'free', status: 'canceled', cancel_at_period_end: false, stripe_subscription_id: sub.id }
          : rowFromSubscription(sub);
        await admin.from('subscriptions').upsert(
          { user_id: userId, stripe_customer_id: sub.customer, ...row },
          { onConflict: 'user_id' }
        );
      }
    }
    // Acknowledge everything (even unhandled types) so Stripe stops retrying.
    return res.status(200).json({ received: true });
  } catch (err) {
    // 500 tells Stripe to retry later — appropriate for transient DB errors.
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

// Implements Stripe's signature scheme: header is "t=<ts>,v1=<sig>[,v1=…]" and
// the signed payload is `${t}.${rawBody}` HMAC-SHA256'd with the endpoint secret.
function verifySignature(raw, header, secret) {
  const parts = Object.fromEntries(
    String(header).split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i), kv.slice(i + 1)];
    })
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  // Reject timestamps outside a 5-minute tolerance (replay protection).
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${raw.toString('utf8')}`, 'utf8')
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}
