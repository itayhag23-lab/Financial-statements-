const { stripeConfigured, stripeRequest, serviceClient, getAuthedUser, getOrCreateCustomer } = require('./_stripe');

// Creates a Stripe Checkout Session for a Koala Pro subscription and returns its
// hosted-checkout URL. The client redirects the browser there; Stripe handles
// the payment and then sends the user back to returnUrl, while the webhook
// (api/stripe-webhook.js) flips the user's plan to "pro".

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!stripeConfigured()) {
    return res.status(500).json({ error: 'Billing is not configured yet (STRIPE_SECRET_KEY missing).' });
  }
  const admin = serviceClient();
  if (!admin) {
    return res.status(500).json({ error: 'Billing is not configured yet (SUPABASE_SERVICE_ROLE_KEY missing).' });
  }

  const user = await getAuthedUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required.' });

  const { interval = 'month', returnUrl } = req.body || {};
  const price = interval === 'year'
    ? process.env.STRIPE_PRICE_YEARLY
    : process.env.STRIPE_PRICE_MONTHLY;
  if (!price) {
    return res.status(500).json({ error: `Missing Stripe price id for the ${interval}ly plan.` });
  }

  const base = (typeof returnUrl === 'string' && returnUrl) || `https://${req.headers.host}/app`;

  try {
    const customer = await getOrCreateCustomer(admin, user);
    const session = await stripeRequest('POST', '/checkout/sessions', {
      mode: 'subscription',
      customer,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      line_items: [{ price, quantity: 1 }],
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${base}?checkout=success`,
      cancel_url: `${base}?checkout=cancel`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not start checkout.' });
  }
};
