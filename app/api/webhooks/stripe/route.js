// app/api/webhooks/stripe/route.js
//
// Stripe calls this URL directly (not the browser) whenever something
// billing-related happens. This — not the success-page redirect after
// checkout — is the actual source of truth for who's paying, because a
// subscription can also later renew, fail to renew, or get canceled at any
// time, completely independent of anyone visiting the website.
//
// IMPORTANT: we read the body with request.text(), NOT request.json().
// Stripe signs the exact raw bytes it sent us, so if we parsed it to JSON
// and back, the signature check below would fail even for a real,
// legitimate request — a Request's body can only be read once, so this
// must be the only place this route touches it.

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { setUserBillingOnCheckoutComplete, updateUserPlanBySubscriptionId } from "@/lib/db";

// Turns Stripe's own subscription status strings into the one thing the
// rest of this app actually checks. "active" and "trialing" both count as
// a paying customer; everything else (past_due, canceled, unpaid, etc.)
// does not.
function planForStatus(status) {
  return status === "active" || status === "trialing" ? "pro" : "free";
}

export async function POST(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = Number(session.client_reference_id);
      if (userId) {
        await setUserBillingOnCheckoutComplete(userId, {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      await updateUserPlanBySubscriptionId(subscription.id, planForStatus(subscription.status));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await updateUserPlanBySubscriptionId(subscription.id, "free");
      break;
    }

    default:
      // Any other event type: nothing to do, but still acknowledge it so
      // Stripe doesn't keep retrying.
      break;
  }

  return NextResponse.json({ received: true });
}
