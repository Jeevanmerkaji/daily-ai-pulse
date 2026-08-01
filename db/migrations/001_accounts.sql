-- Migration 001: adds accounts (magic-link login) on top of the original
-- MVP schema. Run this ONCE, by hand, against your existing database (paste
-- into Neon's SQL Editor and run) — it's for upgrading a database that
-- already has real subscriber rows in it. A brand-new database should use
-- db/schema.sql instead and skip this file entirely.

ALTER TABLE subscribers RENAME TO users;

ALTER TABLE users ADD COLUMN login_token TEXT UNIQUE;
ALTER TABLE users ADD COLUMN login_token_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
