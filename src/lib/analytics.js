import posthog from 'posthog-js';

const key  = process.env.REACT_APP_POSTHOG_KEY;
const host = process.env.REACT_APP_POSTHOG_HOST || 'https://us.i.posthog.com';

let ready = false;
if (key) {
  posthog.init(key, {
    api_host: host,
    capture_pageview: false,         // we fire these manually on route change
    capture_pageleave: true,
    autocapture: false,              // opt-in only; avoids capturing financial values
    disable_session_recording: true, // enable in PostHog dashboard when ready
    loaded: () => { ready = true; },
  });
}

export function capture(event, props = {}) {
  if (key) posthog.capture(event, props);
}

export function identify(userId, props = {}) {
  if (key) posthog.identify(userId, props);
}

export function page(name) {
  if (key) posthog.capture('$pageview', { $current_url: window.location.href, page: name });
}

export function reset() {
  if (key) posthog.reset();
}
