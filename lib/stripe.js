// lib/stripe.js
//
// One shared Stripe client, same pattern as lib/email.js and lib/claude.js
// (one small file per external service). The secret key must never be
// exposed to the browser — everything that uses this client runs in Route
// Handlers (server-side only), never in a page's client-side code.
//
// IMPORTANT: keep this on TEST MODE keys (starting with sk_test_) until
// you're actually ready to take real payments. A test key can never charge
// a real card, even by accident.

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
