const { billingConfigured, lsRequest, serviceClient, getAuthedUser } = require('./_lemonsqueezy');

// Creates a Lemon Squeezy checkout for a Koala Pro subscription and returns its
// hosted-checkout URL. The client redirects the browser there; Lemon Squeezy
// (Merchant of Record) handles payment + tax, then sends the user back to
// returnUrl, while the webhook (api/lemonsqueezy-webhook.js) flips the plan.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!billingConfigured()) {
    return res.status(500).json({ error: 'Billing is not configured yet (LEMONSQUEEZY_API_KEY missing).' });
  }
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) return res.status(500).json({ error: 'Billing is not configured yet (LEMONSQUEEZY_STORE_ID missing).' });

  const admin = serviceClient();
  if (!admin) return res.status(500).json({ error: 'Billing is not configured yet (SUPABASE_SERVICE_ROLE_KEY missing).' });

  const user = await getAuthedUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required.' });

  const { interval = 'month', returnUrl } = req.body || {};
  const variantId = interval === 'year'
    ? process.env.LEMONSQUEEZY_VARIANT_YEARLY
    : process.env.LEMONSQUEEZY_VARIANT_MONTHLY;
  if (!variantId) {
    return res.status(500).json({ error: `Missing Lemon Squeezy variant id for the ${interval}ly plan.` });
  }

  // Only honor a caller-supplied returnUrl if it points back at our own origin —
  // otherwise the post-payment redirect becomes an open-redirect vector (a
  // crafted checkout could bounce the buyer to an attacker's lookalike page).
  const selfOrigin = `https://${req.headers.host}`;
  let base = `${selfOrigin}/app`;
  if (typeof returnUrl === 'string' && returnUrl) {
    try {
      const u = new URL(returnUrl, selfOrigin);
      if (u.origin === selfOrigin) base = u.href;
    } catch { /* malformed returnUrl → fall back to the default */ }
  }

  try {
    const result = await lsRequest('POST', '/checkouts', {
      data: {
        type: 'checkouts',
        attributes: {
          // Prefill the buyer's email and stash our user id so the webhook can
          // map the resulting subscription back to this account.
          checkout_data: {
            email: user.email || undefined,
            custom: { user_id: user.id },
          },
          product_options: {
            redirect_url: `${base}?checkout=success`,
            receipt_button_text: 'Back to Koala',
            enabled_variants: [Number(variantId)],
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: String(storeId) } },
          variant: { data: { type: 'variants', id: String(variantId) } },
        },
      },
    });
    const url = result?.data?.attributes?.url;
    if (!url) return res.status(502).json({ error: 'Checkout URL was not returned.' });
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not start checkout.' });
  }
};
