// No-op stand-in for posthog-js used only during the build-time server render.
// Analytics never runs on the server; this just keeps the import resolvable
// without pulling browser-only code into the Node render.
const noop = () => {};
module.exports = {
  __esModule: true,
  default: { init: noop, capture: noop, identify: noop, reset: noop },
};
