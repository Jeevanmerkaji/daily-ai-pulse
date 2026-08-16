// app/api/login/route.js
//
// Handles the "email me a login link" form on /login. If the email has
// never been seen before, this creates an account for it right here (a new
// account starts inactive — see lib/db.js's setLoginToken for why). Either
// way, we send back the exact same response, so nobody can use this form to
// probe which emails already have an account.

import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { EMAIL_REGEX, LOGIN_TOKEN_TTL_MINUTES } from "@/lib/auth";
import { setLoginToken } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/email";
import { captureError } from "@/lib/monitoring";

export async function POST(request) {
  const formData = await request.formData();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();

  const loginUrl = new URL("/login", request.url);

  if (!EMAIL_REGEX.test(email)) {
    loginUrl.searchParams.set("error", "invalid-email");
    return NextResponse.redirect(loginUrl, 303);
  }

  try {
    const loginToken = randomBytes(32).toString("hex");
    const loginTokenExpiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MINUTES * 60 * 1000);
    // A brand-new account also needs an unsubscribe token ready to go, in
    // case they later choose to subscribe to the daily email from /account.
    const unsubscribeToken = randomBytes(16).toString("hex");

    await setLoginToken(email, { unsubscribeToken, loginToken, loginTokenExpiresAt });

    const verifyUrl = new URL("/login/verify", request.url);
    verifyUrl.searchParams.set("token", loginToken);
    await sendMagicLinkEmail(email, verifyUrl.toString());
  } catch (err) {
    console.error("Failed to send login link:", err);
    captureError(err, { route: "login" });
    loginUrl.searchParams.set("error", "server-error");
    return NextResponse.redirect(loginUrl, 303);
  }

  loginUrl.searchParams.set("sent", "1");
  return NextResponse.redirect(loginUrl, 303);
}
