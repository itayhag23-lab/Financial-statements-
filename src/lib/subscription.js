import { supabase } from './supabase';

// Koala Pro — the paid plan that unlocks the AI features (AI Advisor +
// Build-from-description). Everything else in the app stays free forever.
//
// Rollout switch: the paywall only *enforces* when REACT_APP_STRIPE_ENABLED is
// "1" (client) and STRIPE_SECRET_KEY is set (server). Until then the app behaves
// exactly as before — AI just requires sign-in — so nothing breaks before Stripe
// is fully wired up.

export const AI_PAYWALL_ENABLED = process.env.REACT_APP_STRIPE_ENABLED === '1';

// Free signed-in users get a taste of the AI before the upgrade prompt.
export const FREE_AI_CREDITS = 3;

// Prices are display-only here (the real charge amount lives in the Stripe Price
// objects referenced by STRIPE_PRICE_MONTHLY / STRIPE_PRICE_YEARLY on the
// server). Keep these in sync with your Stripe dashboard.
//   $9/mo, or $90/yr  →  $90 = 10 × $9, i.e. "2 months free".
export const PRICING = {
  currency: 'USD',
  symbol: '$',
  monthly: { amount: 9, per: 'month', interval: 'month' },
  yearly:  { amount: 90, per: 'year', interval: 'year', perMonth: 7.5, monthsFree: 2, savePct: 17 },
};

export const PRO_FEATURES = [
  'Unlimited AI Advisor: ask anything about your model and apply changes instantly',
  'Unlimited Build-from-description: a full 3-statement model from a sentence',
  'Priority AI model access',
  'Everything in Free: unlimited models, scenarios, benchmarks, Excel and sharing',
];

// ── Reading the current plan ────────────────────────────────────────────────

const FREE = { plan: 'free', status: null, aiCreditsUsed: 0, currentPeriodEnd: null, cancelAtPeriodEnd: false };

// Reads the signed-in user's subscription row. Returns a normalized object, or
// null when there's no Supabase (local-only mode) or no signed-in user.
export async function fetchSubscription() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan,status,interval,current_period_end,cancel_at_period_end,ai_credits_used')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !data) return { ...FREE };
  return {
    plan: data.plan || 'free',
    status: data.status || null,
    interval: data.interval || null,
    aiCreditsUsed: data.ai_credits_used || 0,
    currentPeriodEnd: data.current_period_end || null,
    cancelAtPeriodEnd: !!data.cancel_at_period_end,
  };
}

export function isPro(sub) {
  return !!sub && sub.plan === 'pro' && (sub.status === 'active' || sub.status === 'trialing');
}

export function remainingFreeCredits(sub) {
  if (!sub) return 0;
  return Math.max(0, FREE_AI_CREDITS - (sub.aiCreditsUsed || 0));
}

// True when the user is allowed to fire an AI action right now. When the paywall
// is disabled everyone with an account passes; otherwise Pro or leftover credits.
export function canUseAI(sub) {
  if (!AI_PAYWALL_ENABLED) return true;
  return isPro(sub) || remainingFreeCredits(sub) > 0;
}

// ── Checkout + billing portal (redirect flows) ──────────────────────────────

async function authedFetch(path, body) {
  if (!supabase) throw new Error('Sign in required.');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Sign in required.');
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body || {}),
  });
  let json = {};
  try { json = await res.json(); } catch {}
  if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
  return json;
}

// Kicks off Stripe Checkout for the chosen interval and redirects the browser.
export async function startCheckout(interval = 'month') {
  const { url } = await authedFetch('/api/create-checkout-session', {
    interval,
    returnUrl: window.location.origin + window.location.pathname,
  });
  if (url) window.location.assign(url);
}

// Opens the Stripe billing portal so a Pro user can manage or cancel.
export async function openBillingPortal() {
  const { url } = await authedFetch('/api/create-portal-session', {
    returnUrl: window.location.origin + window.location.pathname,
  });
  if (url) window.location.assign(url);
}
