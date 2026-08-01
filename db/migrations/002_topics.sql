-- Migration 002: adds topic personalization (Phase 2b). Run this ONCE, by
-- hand, against your existing database (paste into Neon's SQL Editor and
-- run). A brand-new database should use db/schema.sql instead and skip
-- this file entirely.

-- Every user gets a topic preference. Existing users all default to
-- "general" — the same single-best-story behavior they already get today,
-- so nobody's experience changes just because this column now exists.
ALTER TABLE users ADD COLUMN topic TEXT NOT NULL DEFAULT 'general';

-- Now there's one story PER TOPIC per day, not one story per day overall.
ALTER TABLE daily_stories ADD COLUMN topic TEXT NOT NULL DEFAULT 'general';

-- The old rule was "one row per date." The new rule is "one row per
-- (date, topic)" — swap the old constraint for the new one. Every existing
-- row is already a distinct date with topic = 'general' (the default), so
-- this can't create a collision.
ALTER TABLE daily_stories DROP CONSTRAINT daily_stories_date_key;
ALTER TABLE daily_stories ADD CONSTRAINT daily_stories_date_topic_key UNIQUE (date, topic);
