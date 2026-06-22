const key  = process.env.REACT_APP_POSTHOG_KEY;
const host = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

// posthog-js is ~30KB gzipped and isn't needed for first paint, so it's
// code-split out of the main bundle and only fetched once the page is idle.
let posthogPromise = null;
function loadPostHog() {
  if (!key) return Promise.resolve(null);
  if (!posthogPromise) {
    posthogPromise = import('posthog-js').then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: host,
        capture_pageview: false,         // we fire these manually on route change
        capture_pageleave: true,
        autocapture: false,              // opt-in only; avoids capturing financial values
        disable_session_recording: true, // enable in PostHog dashboard when ready
      });
      return posthog;
    });
  }
  return posthogPromise;
}

function whenIdle(fn) {
  if (typeof window === 'undefined') return;
  if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 2000 });
  else setTimeout(fn, 1);
}

// Warm the PostHog chunk once the browser is idle so early events (like the
// first pageview) don't wait on a fresh import() round-trip.
whenIdle(loadPostHog);

export function capture(event, props = {}) {
  if (!key) return;
  loadPostHog().then(posthog => posthog && posthog.capture(event, props));
}

export function identify(userId, props = {}) {
  if (!key) return;
  loadPostHog().then(posthog => posthog && posthog.identify(userId, props));
}

export function page(name) {
  if (!key) return;
  loadPostHog().then(posthog => posthog && posthog.capture('$pageview', { $current_url: window.location.href, page: name }));
}

export function reset() {
  if (!key) return;
  loadPostHog().then(posthog => posthog && posthog.reset());
}
