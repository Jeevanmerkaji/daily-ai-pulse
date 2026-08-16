// app/api/subscribe/route.js
//
// Handles the signup form on the landing page (and the "Subscribe" button
// on /account). The form is a plain HTML <form method="POST"
// action="/api/subscribe"> — no client-side JavaScript needed. The browser
// submits the form, this route saves the email, and then redirects the
// visitor back to wherever they came from with a "?subscribed=1"
// (or "?error=...") flag so that page can show a friendly message.

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { EMAIL_REGEX } from "@/lib/auth";
import { addSubscriber } from "@/lib/db";
import { captureError } from "@/lib/monitoring";

export async function POST(request) {
  const formData = await request.formData();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();

  // Where to send the visitor back to afterwards. Defaults to the homepage,
  // but e.g. /account passes its own path so people land back where they
  // were instead of always bouncing to "/". Only relative paths are
  // allowed, so this can't be abused to redirect somewhere off-site.
  const redirectField = (formData.get("redirect") || "/").toString();
  const redirectPath = redirectField.startsWith("/") ? redirectField : "/";
  const destinationUrl = new URL(redirectPath, request.url);

  if (!EMAIL_REGEX.test(email)) {
    destinationUrl.searchParams.set("error", "invalid-email");
    return NextResponse.redirect(destinationUrl, 303);
  }

  try {
    // Every subscriber gets a random, unguessable token now, up front, so
    // their unsubscribe link is ready as soon as they get their first email.
    const unsubscribeToken = randomUUID();
    await addSubscriber(email, unsubscribeToken);
  } catch (err) {
    console.error("Failed to add subscriber:", err);
    captureError(err, { route: "subscribe" });
    destinationUrl.searchParams.set("error", "server-error");
    return NextResponse.redirect(destinationUrl, 303);
  }

  destinationUrl.searchParams.set("subscribed", "1");
  return NextResponse.redirect(destinationUrl, 303);
}
