// app/api/billing/portal/route.js
//
// Handles the "Manage billing" button on /account. Sends the browser to
// Stripe's own hosted Billing Portal, where they can update their card,
// see invoices, or cancel — we don't build or secure any of that ourselves.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const accountUrl = new URL("/account", request.url);

  // Someone could hit this route without ever having checked out (no
  // Stripe customer exists for them yet) — send them back instead of
  // asking Stripe to open a portal for a customer that doesn't exist.
  if (!user.stripe_customer_id) {
    accountUrl.searchParams.set("error", "no-billing-account");
    return NextResponse.redirect(accountUrl, 303);
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: accountUrl.toString(),
  });

  return NextResponse.redirect(session.url, 303);
}
