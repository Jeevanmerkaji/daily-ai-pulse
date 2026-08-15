-- Migration 003: adds Pro plan billing (Phase 2c) on top of the topics
-- schema. Run this ONCE, by hand, against your existing database (paste
-- into Neon's SQL Editor and run). A brand-new database should use
-- db/schema.sql instead and skip this file entirely.

-- Every user starts on the free plan. The Stripe ids stay NULL until
-- someone actually completes a checkout — see
-- app/api/webhooks/stripe/route.js, the only place that ever sets them.
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT UNIQUE;
