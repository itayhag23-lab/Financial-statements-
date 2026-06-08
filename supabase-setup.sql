-- Koala Statements — Supabase schema
-- Run this in your Supabase project: SQL Editor → New query → paste → Run

-- ── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id                 TEXT        PRIMARY KEY,
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name               TEXT        NOT NULL DEFAULT 'Untitled Project',
  sector_key         TEXT,
  region_key         TEXT,
  currency_key       TEXT        DEFAULT 'usd',
  model_json         JSONB       NOT NULL DEFAULT '{}',
  wizard_answers     JSONB,
  enabled_statements JSONB,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access only their own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Shares (publicly readable — enables cross-device share links) ─────────────
-- IMPORTANT: this table is readable by ANYONE with the row's id (see policy
-- below), so it must only ever contain what the public share page displays —
-- the read-only summary snapshot and display metadata. Never store the full
-- editable model or the raw `wizard_answers` business description here; those
-- stay private to the creator's own browser (see src/lib/persistence.js).
CREATE TABLE IF NOT EXISTS shares (
  id             TEXT        PRIMARY KEY,
  user_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_json  JSONB       NOT NULL DEFAULT '{}',
  meta_json      JSONB,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  expires_at     TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '90 days')
);

ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Anyone can read a share by ID (that's the whole point of sharing)
CREATE POLICY "Shares are publicly readable"
  ON shares FOR SELECT
  USING (true);

-- Only authenticated users can create shares
CREATE POLICY "Authenticated users can create shares"
  ON shares FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Users can delete their own shares
CREATE POLICY "Users can delete own shares"
  ON shares FOR DELETE
  USING (auth.uid() = user_id);

-- ── Optional: auto-update updated_at on projects ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Migration for existing deployments ────────────────────────────────────────
-- Earlier versions of this schema stored `model_json` and `wizard_answers` on
-- the publicly-readable `shares` table — anyone with (or guessing) a share id
-- could read the full editable model and the raw business description behind
-- it. Run this once to remove that exposure from any project created before
-- this fix (existing rows are NOT retroactively re-shared; this just deletes
-- the leaked columns and their data).
ALTER TABLE shares DROP COLUMN IF EXISTS model_json;
ALTER TABLE shares DROP COLUMN IF EXISTS wizard_answers;
