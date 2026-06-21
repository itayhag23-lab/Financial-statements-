// Server-render entry used by scripts/prerender.js. esbuild bundles this for
// Node, then the orchestrator calls renderRoute() for each public path.
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from '../src/App';

export function renderRoute(path) {
  return renderToString(
    <StaticRouter location={path}>
      <App />
    </StaticRouter>
  );
}
