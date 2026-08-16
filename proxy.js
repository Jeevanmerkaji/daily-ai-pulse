// proxy.js
//
// Runs in front of the public, unauthenticated /api/login and /api/subscribe
// forms to blunt scripted abuse (mail-bombing an inbox with magic links, or
// flooding the subscriber list). Counts are kept in memory per serverless
// instance — not perfectly distributed, but this app runs at a scale where
// that's a reasonable trade against needing a separate store like Redis.

import { NextResponse } from "next/server";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;

const hits = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_REQUESTS;
}

export function proxy(request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${ip}:${request.nextUrl.pathname}`;

  if (isRateLimited(key)) {
    const referer = request.headers.get("referer");
    const destinationUrl = new URL(referer || "/", request.url);
    destinationUrl.searchParams.set("error", "rate-limited");
    return NextResponse.redirect(destinationUrl, 303);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/login", "/api/subscribe"],
};
