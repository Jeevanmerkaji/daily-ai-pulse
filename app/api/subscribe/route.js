// app/api/subscribe/route.js
//
// Handles the signup form on the landing page. The form is a plain HTML
// <form method="POST" action="/api/subscribe"> — no client-side JavaScript
// needed. The browser submits the form, this route saves the email, and
// then redirects the visitor back to the homepage with a "?subscribed=1"
// (or "?error=...") flag so the page can show a friendly message.

import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { addSubscriber } from "@/lib/db";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const formData = await request.formData();
  const email = (formData.get("email") || "").toString().trim().toLowerCase();

  const homeUrl = new URL("/", request.url);

  if (!EMAIL_REGEX.test(email)) {
    homeUrl.searchParams.set("error", "invalid-email");
    return NextResponse.redirect(homeUrl, 303);
  }

  try {
    // Every subscriber gets a random, unguessable token now, up front, so
    // their unsubscribe link is ready as soon as they get their first email.
    const unsubscribeToken = randomUUID();
    await addSubscriber(email, unsubscribeToken);
  } catch (err) {
    console.error("Failed to add subscriber:", err);
    homeUrl.searchParams.set("error", "server-error");
    return NextResponse.redirect(homeUrl, 303);
  }

  homeUrl.searchParams.set("subscribed", "1");
  return NextResponse.redirect(homeUrl, 303);
}
