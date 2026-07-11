const { createClient } = require('@supabase/supabase-js');

// Shared helpers for the Stripe endpoints. Files prefixed with "_" are NOT
// exposed as routes by Vercel, so this is a plain module the endpoints require.
//
// We talk to Stripe over its REST API with fetch (form-encoded), exactly like
// api/chat.js talks to Gemini/Upstash — no extra npm dependency, no bundler
// surprises. Webhook signatures are verified with Node's built-in crypto.

const STRIPE_API = 'https://api.stripe.com/v1';

function stripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}

// Encodes params the way Stripe expects: nested objects/arrays become
// bracketed keys, e.g. metadata[user_id]=… and line_items[0][price]=…
function encodeForm(params) {
  const parts = [];
  const add = (key, val) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) val.forEach((v, i) => add(`${key}[${i}]`, v));
    else if (typeof val === 'object') Object.entries(val).forEach(([k, v]) => add(`${key}[${k}]`, v));
    else parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(val)));
  };
  Object.entries(params || {}).forEach(([k, v]) => add(k, v));
  return parts.join('&');
}

async function stripeRequest(method, path, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Stripe is not configured (STRIPE_SECRET_KEY missing).');
  const res = await fetch(STRIPE_API + path, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params ? encodeForm(params) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Stripe request failed (${res.status}).`);
  return data;
}

// Service-role Supabase client — bypasses RLS so the server can write the
// subscriptions table. Returns null when the service key isn't set.
function serviceClient() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Verifies the caller's Supabase bearer token (never trust client-claimed ids).
async function getAuthedUser(req) {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

// Returns the user's Stripe customer id, creating (and storing) one if needed.
async function getOrCreateCustomer(admin, user) {
  const { data: row } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (row?.stripe_customer_id) return row.stripe_customer_id;
  const customer = await stripeRequest('POST', '/customers', {
    email: user.email,
    metadata: { user_id: user.id },
  });
  await admin.from('subscriptions').upsert(
    { user_id: user.id, stripe_customer_id: customer.id },
    { onConflict: 'user_id' }
  );
  return customer.id;
}

// Maps a Stripe subscription object → our subscriptions row shape.
function rowFromSubscription(sub) {
  const active = sub.status === 'active' || sub.status === 'trialing';
  const item = sub.items?.data?.[0];
  return {
    plan: active ? 'pro' : 'free',
    status: sub.status || null,
    interval: item?.price?.recurring?.interval || null,
    stripe_subscription_id: sub.id,
    current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
    cancel_at_period_end: !!sub.cancel_at_period_end,
  };
}

module.exports = {
  STRIPE_API,
  stripeConfigured,
  stripeRequest,
  serviceClient,
  getAuthedUser,
  getOrCreateCustomer,
  rowFromSubscription,
};
