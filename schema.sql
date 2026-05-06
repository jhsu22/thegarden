-- The Garden — D1 schema
-- Run: wrangler d1 execute thegarden-db --file=schema.sql

CREATE TABLE IF NOT EXISTS entries (
  id       TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name     TEXT NOT NULL,
  date     TEXT NOT NULL,     -- YYYY-MM-DD
  notes    TEXT,
  score    REAL,              -- NULL for cafes (derived from me/sammy ratings)
  metadata TEXT NOT NULL DEFAULT '{}'  -- JSON: all category-specific fields
);

CREATE INDEX IF NOT EXISTS idx_entries_category ON entries(category);
CREATE INDEX IF NOT EXISTS idx_entries_date     ON entries(date DESC);
