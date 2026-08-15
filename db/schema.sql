-- Daily AI Pulse — database schema
--
-- This file represents the schema for a brand-new install. If you're setting
-- this project up for the first time, paste the whole file into Neon's SQL
-- Editor and run it once.
--
-- If you already have a live database from an earlier version of this
-- project, don't run this file — run whichever numbered migration(s) in
-- db/migrations/ you haven't applied yet instead, which upgrade your
-- existing data in place without losing anything.

-- One row per topic per day: the story Claude picked for that topic,
-- already summarized. See lib/topics.js for the fixed list of topics.
CREATE TABLE IF NOT EXISTS daily_stories (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,                       -- the day this story is "for"
  topic TEXT NOT NULL DEFAULT 'general',    -- which topic this story was picked for
  headline TEXT NOT NULL,                   -- punchy one-line headline, written by Claude
  summary TEXT NOT NULL,                    -- 3-5 sentence plain-English summary
  source_url TEXT NOT NULL,                 -- link to the original article
  source_name TEXT NOT NULL,                -- e.g. "TechCrunch"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (date, topic)                      -- one story per topic per day
);

-- One row per person: both "gets the daily email" and "has an account" live
-- on the same row, since they're usually (but not always) the same person.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- also doubles as "account created at"
  active BOOLEAN NOT NULL DEFAULT true,               -- true = receives the daily email
  topic TEXT NOT NULL DEFAULT 'general',              -- which topic's story this user gets
  unsubscribe_token TEXT NOT NULL UNIQUE,             -- one-click unsubscribe, no login needed
  login_token TEXT UNIQUE,               -- set while a magic link is pending; NULL otherwise
  login_token_expires_at TIMESTAMPTZ,    -- login_token stops working after this time
  plan TEXT NOT NULL DEFAULT 'free',     -- 'free' or 'pro' — see lib/stripe.js
  stripe_customer_id TEXT UNIQUE,        -- set once they start paying
  stripe_subscription_id TEXT UNIQUE     -- set once they have a subscription
);

-- One row per signed-in browser/device. A user can have several at once
-- (phone, laptop, etc), which is why this is a separate table from `users`
-- rather than another column on it.
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,           -- the value stored in the browser's cookie
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
