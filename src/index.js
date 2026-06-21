import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import './index.css';
import './lib/analytics'; // side effect: initialises PostHog
import App from './App';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 0,
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
