-- Migration 003: adds payment/subscription tiers (Phase 2c). Run this ONCE,
-- by hand, against your existing database. A brand-new database should use
-- db/schema.sql instead and skip this file entirely.

-- Every user has a plan. Existing users all default to "free" — the same
-- single-topic behavior they already get today, so nobody's experience
-- changes just because this column now exists. Stripe is the source of
-- truth for *why* someone is on a given plan (a webhook updates this
-- column), but this is the one thing the rest of the app actually checks —
-- no other code needs to know anything about Stripe's own status strings.
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';

-- Set once a user starts paying. Lets us open the Stripe Billing Portal
-- for them later without asking Stripe to look them up by email.
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT UNIQUE;

-- Set once they have a subscription. Lets later webhook events about that
-- subscription (renewed, canceled, payment failed) find the right user,
-- since those events don't carry our own internal user id.
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT UNIQUE;
