// app/api/billing/checkout/route.js
//
// Handles the "Upgrade to Pro" button on /account. Creates a Stripe
// Checkout Session for the logged-in user and sends their browser to
// Stripe's own hosted payment page. We don't mark anyone as "pro" here —
// that only happens once Stripe confirms payment via the webhook at
// app/api/webhooks/stripe/route.js, since a webhook Stripe calls directly
// can't be spoofed by just visiting a URL the way a redirect back to our
// own site could be.

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { captureError } from "@/lib/monitoring";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      // Stripe hands this back untouched on the checkout.session.completed
      // webhook event, which is how that handler knows which of our users
      // just paid.
      client_reference_id: String(user.id),
      // Reuse their existing Stripe customer if they've been Pro before
      // (e.g. re-subscribing after a cancellation); otherwise let Stripe
      // create one from their email.
      customer: user.stripe_customer_id || undefined,
      customer_email: user.stripe_customer_id ? undefined : user.email,
      success_url: `${siteUrl}/account?upgrade=success`,
      cancel_url: `${siteUrl}/account?upgrade=canceled`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error("Failed to create Stripe checkout session:", err);
    captureError(err, { route: "billing/checkout", userId: user.id });
    return NextResponse.redirect(new URL("/account?error=checkout-failed", request.url), 303);
  }
}
