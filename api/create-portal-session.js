const { stripeConfigured, stripeRequest, serviceClient, getAuthedUser } = require('./_stripe');

// Opens the Stripe billing portal so a Pro user can update payment details or
// cancel. Returns the portal URL; the client redirects the browser there.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!stripeConfigured()) {
    return res.status(500).json({ error: 'Billing is not configured yet.' });
  }
  const admin = serviceClient();
  if (!admin) return res.status(500).json({ error: 'Billing is not configured yet.' });

  const user = await getAuthedUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required.' });

  const { returnUrl } = req.body || {};
  const base = (typeof returnUrl === 'string' && returnUrl) || `https://${req.headers.host}/app`;

  try {
    const { data: row } = await admin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!row?.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found for this user.' });
    }
    const session = await stripeRequest('POST', '/billing_portal/sessions', {
      customer: row.stripe_customer_id,
      return_url: base,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not open the billing portal.' });
  }
};
