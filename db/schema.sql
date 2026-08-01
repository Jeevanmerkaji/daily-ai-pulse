-- Daily AI Pulse — database schema
--
-- How to use this file: run it ONCE against your Postgres database (e.g. Neon)
-- to create the two tables the app needs. You can do this by pasting the whole
-- file into Neon's SQL Editor (in your Neon project dashboard) and clicking Run.
-- You do not need to run this again unless you drop the tables.

-- One row per day: the single story Claude picked, already summarized.
CREATE TABLE IF NOT EXISTS daily_stories (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,        -- the day this story is "for" (one story per day)
  headline TEXT NOT NULL,           -- punchy one-line headline, written by Claude
  summary TEXT NOT NULL,            -- 3-5 sentence plain-English summary
  source_url TEXT NOT NULL,         -- link to the original article
  source_name TEXT NOT NULL,        -- e.g. "TechCrunch"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per person who signed up for the email.
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,      -- flipped to false when they unsubscribe
  unsubscribe_token TEXT NOT NULL UNIQUE     -- random string used in their unsubscribe link
);
