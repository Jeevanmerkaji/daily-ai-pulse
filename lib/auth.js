// lib/auth.js
//
// Shared pieces for the magic-link login system: the constants both the
// login and verify routes need to agree on, and getCurrentUser(), which is
// how any Server Component (the header nav, the /account page, /login
// itself) finds out who — if anyone — is currently signed in.

import { cookies } from "next/headers";
import { getSessionWithUser } from "./db";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SESSION_COOKIE_NAME = "session_token";
export const LOGIN_TOKEN_TTL_MINUTES = 15;
export const SESSION_TTL_DAYS = 30;

// Reads the session cookie (if any) and looks up who it belongs to. Returns
// null if the visitor isn't logged in, or their session has expired.
//
// Note: this only works in Server Components / Route Handlers, since
// that's the only place `cookies()` is available — it can't be called from
// the RSS/Claude/email job code, which doesn't run in a request context.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return getSessionWithUser(token);
}
