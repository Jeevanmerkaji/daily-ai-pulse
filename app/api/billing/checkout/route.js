// app/api/billing/checkout/route.js
//
// Handles the "Upgrade to Pro" button on /account. Creates a Stripe
// Checkout Session (Stripe's own hosted payment page) and sends the
// browser there — this app never touches card details itself.
//
// `client_reference_id` is the important bit: it's how we link this
// checkout back to our own `users.id`. We need this because, for a
// brand-new payer, Stripe hasn't created a Customer object yet at all —
// there's no stripe_customer_id to match on until AFTER checkout succeeds.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const accountUrl = new URL("/account", request.url);
  const successUrl = new URL(accountUrl);
  successUrl.searchParams.set("upgrade", "success");
  const cancelUrl = new URL(accountUrl);
  cancelUrl.searchParams.set("upgrade", "canceled");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    client_reference_id: String(user.id),
    // Reuse their existing Stripe customer if they've paid before (e.g.
    // resubscribing after a cancellation); otherwise let Stripe create a
    // new one from their email.
    ...(user.stripe_customer_id
      ? { customer: user.stripe_customer_id }
      : { customer_email: user.email }),
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
  });

  return NextResponse.redirect(session.url, 303);
}
