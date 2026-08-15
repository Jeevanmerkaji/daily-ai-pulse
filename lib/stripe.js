// lib/stripe.js
//
// One shared Stripe client, same pattern as lib/claude.js's Anthropic
// client — construct it once here, import { stripe } everywhere else that
// needs to talk to Stripe.

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
