// app/api/login/verify/route.js
//
// Reached only by submitting the confirm button on /login/verify — a real
// POST from a user action, not something an email scanner's automatic GET
// can trigger. That's what the interstitial page is for: it keeps the
// single-use token alive until the person actually clicks it, rather than
// a security scanner burning it seconds after the email arrives. If the
// token is real and hasn't expired, we log the person in: clear the token
// (so the link can't be used a second time), create a new session, and set
// the session cookie on our way out the door.

import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_TTL_DAYS } from "@/lib/auth";
import { getUserByValidLoginToken, clearLoginToken, createSession } from "@/lib/db";

export async function POST(request) {
  const formData = await request.formData();
  const token = (formData.get("token") || "").toString();
  const loginUrl = new URL("/login", request.url);

  const user = token ? await getUserByValidLoginToken(token) : null;
  if (!user) {
    loginUrl.searchParams.set("error", "invalid-token");
    return NextResponse.redirect(loginUrl, 303);
  }

  await clearLoginToken(user.id);

  const sessionToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await createSession(user.id, sessionToken, expiresAt);

  const response = NextResponse.redirect(new URL("/account", request.url), 303);
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return response;
}
