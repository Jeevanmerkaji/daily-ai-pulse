// app/api/billing/portal/route.js
//
// Handles the "Manage billing" button on /account. Sends an existing Pro
// subscriber to Stripe's hosted billing portal, where they can update
// their card, see past invoices, or cancel — none of which this app needs
// to build itself.

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  // Shouldn't normally happen (the button that posts here only shows for
  // Pro users, who always have one), but a stale page or a direct POST
  // could reach here without one.
  if (!user.stripe_customer_id) {
    return NextResponse.redirect(new URL("/account?error=no-billing-account", request.url), 303);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${siteUrl}/account`,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error("Failed to create Stripe billing portal session:", err);
    return NextResponse.redirect(new URL("/account?error=portal-failed", request.url), 303);
  }
}
