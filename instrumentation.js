// instrumentation.js
//
// Next.js calls onRequestError() whenever a Route Handler, Server
// Component, or Server Action throws without being caught locally (see the
// routes that do their own try/catch + lib/monitoring.js's captureError for
// those cases). This hook catches everything else, e.g. the Stripe webhook
// handler or magic-link verification, which would otherwise only ever show
// up in Vercel's console logs.

export async function onRequestError(err, request, context) {
  if (!process.env.SENTRY_DSN) return;
  const { captureError } = await import("@/lib/monitoring");
  captureError(err, { path: request.path, method: request.method, routeType: context.routeType });
}
