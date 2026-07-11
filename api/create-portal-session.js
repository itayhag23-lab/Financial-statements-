const { billingConfigured, lsRequest, serviceClient, getAuthedUser } = require('./_lemonsqueezy');

// Returns the Lemon Squeezy customer-portal URL so a Pro user can update payment
// details or cancel. The portal URL is short-lived and signed, so we fetch it
// fresh from the subscription each time rather than storing it.

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!billingConfigured()) return res.status(500).json({ error: 'Billing is not configured yet.' });
  const admin = serviceClient();
  if (!admin) return res.status(500).json({ error: 'Billing is not configured yet.' });

  const user = await getAuthedUser(req);
  if (!user) return res.status(401).json({ error: 'Sign in required.' });

  try {
    const { data: row } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!row?.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found for this user.' });
    }
    const result = await lsRequest('GET', `/subscriptions/${row.stripe_subscription_id}`);
    const url = result?.data?.attributes?.urls?.customer_portal;
    if (!url) return res.status(502).json({ error: 'Portal URL was not returned.' });
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Could not open the billing portal.' });
  }
};
