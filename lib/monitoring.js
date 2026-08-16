// lib/monitoring.js
//
// Thin wrapper around Sentry so the rest of the app can just call
// captureError(err) without caring whether monitoring is configured. Without
// a SENTRY_DSN (e.g. local dev), this silently no-ops — errors still go to
// console.error at the call site, same as before.

import * as Sentry from "@sentry/node";

let initialized = false;

function ensureInitialized() {
  if (initialized || !process.env.SENTRY_DSN) return;
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0 });
  initialized = true;
}

export function captureError(err, context) {
  ensureInitialized();
  if (!process.env.SENTRY_DSN) return;
  Sentry.captureException(err, context ? { extra: context } : undefined);
}
