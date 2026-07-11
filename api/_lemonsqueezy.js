const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Shared helpers for the Lemon Squeezy billing endpoints. Lemon Squeezy is a
// Merchant of Record: it charges the customer, collects/remits global sales tax
// & VAT, and pays us out — which is why we use it instead of Stripe (Stripe
// doesn't support Israel-based accounts). Files prefixed "_" aren't routed by
// Vercel, so this is a plain shared module.
//
// We talk to the Lemon Squeezy REST API with fetch (JSON:API format) — no extra
// npm dependency — and verify webhook signatures with Node's crypto.

const LS_API = 'https://api.lemonsqueezy.com/v1';

function billingConfigured() {
  return !!process.env.LEMONSQUEEZY_API_KEY;
}

async function lsRequest(method, path, body) {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error('Billing is not configured (LEMONSQUEEZY_API_KEY missing).');
  const res = await fetch(LS_API + path, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.errors?.[0]?.detail || `Lemon Squeezy request failed (${res.status}).`;
    throw new Error(msg);
  }
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

// Which plan interval a variant id corresponds to (from env).
function intervalForVariant(variantId) {
  const v = String(variantId);
  if (v === String(process.env.LEMONSQUEEZY_VARIANT_YEARLY)) return 'year';
  if (v === String(process.env.LEMONSQUEEZY_VARIANT_MONTHLY)) return 'month';
  return null;
}

// Maps a Lemon Squeezy subscription object → our subscriptions row shape.
// (The stripe_* column names are reused as generic provider ids.)
function rowFromSubscription(sub) {
  const a = sub.attributes || {};
  const active = a.status === 'active' || a.status === 'on_trial';
  return {
    plan: active ? 'pro' : 'free',
    status: a.status || null,
    interval: intervalForVariant(a.variant_id),
    stripe_subscription_id: String(sub.id),
    stripe_customer_id: a.customer_id != null ? String(a.customer_id) : null,
    current_period_end: a.renews_at || a.ends_at || null,
    cancel_at_period_end: !!a.cancelled,
  };
}

// Verifies a Lemon Squeezy webhook: HMAC-SHA256 hex of the raw body using the
// signing secret, compared against the X-Signature header.
function verifySignature(raw, header, secret) {
  if (!header || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(header)));
  } catch {
    return false;
  }
}

module.exports = {
  LS_API,
  billingConfigured,
  lsRequest,
  serviceClient,
  getAuthedUser,
  intervalForVariant,
  rowFromSubscription,
  verifySignature,
};
