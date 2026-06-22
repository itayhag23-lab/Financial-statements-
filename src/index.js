import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// @sentry/react is ~25KB gzipped and only catches errors after it loads, so
// deferring it slightly off the critical path is a worthwhile trade — it
// still loads well before a user could meaningfully interact with the page.
if (process.env.REACT_APP_SENTRY_DSN) {
  window.addEventListener('load', () => {
    import('@sentry/react').then(Sentry => {
      Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        replaysOnErrorSampleRate: 0,
      });
    });
  });
}

const container = document.getElementById('root');
const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If the page was pre-rendered at build time (see scripts/prerender.js), the
// #root already contains server-rendered markup — hydrate it so the existing
// HTML stays put and becomes interactive. Otherwise mount fresh.
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app);
} else {
  ReactDOM.createRoot(container).render(app);
}
