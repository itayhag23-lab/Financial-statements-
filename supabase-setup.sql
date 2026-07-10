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
CREATE TABLE IF NOT EXISTS shares (
  id             TEXT        PRIMARY KEY,
  user_id        UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_json  JSONB       NOT NULL DEFAULT '{}',
  meta_json      JSONB,
  model_json     JSONB,
  wizard_answers JSONB,
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

-- ── AI usage limits ───────────────────────────────────────────────────────────
-- Tracks AI (chat) requests per signed-in user per calendar day, so the
-- /api/chat endpoint can cap usage without any external service (no Redis).
CREATE TABLE IF NOT EXISTS user_ai_usage (
  user_id        UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calls_count    INTEGER DEFAULT 0,
  last_call_date DATE    DEFAULT CURRENT_DATE,
  PRIMARY KEY (user_id)
);

ALTER TABLE user_ai_usage ENABLE ROW LEVEL SECURITY;

-- Users may read (only) their own usage — handy for showing "X of Y left" in the
-- UI. All writes go through the SECURITY DEFINER function below, never directly.
CREATE POLICY "Users can read own AI usage"
  ON user_ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Atomically increments today's call count and reports whether the caller is
-- still within p_daily_limit. Resets the counter when last_call_date is not
-- today. Runs as the function owner (SECURITY DEFINER) so it can write to
-- user_ai_usage despite RLS, and derives the user from auth.uid() so a caller
-- can never inflate another user's counter.
CREATE OR REPLACE FUNCTION check_ai_usage_limit(p_daily_limit INTEGER)
RETURNS TABLE (allowed BOOLEAN, used INTEGER, max_allowed INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user  UUID := auth.uid();
  v_count INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO user_ai_usage (user_id, calls_count, last_call_date)
  VALUES (v_user, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    calls_count = CASE
      WHEN user_ai_usage.last_call_date < CURRENT_DATE THEN 1
      ELSE user_ai_usage.calls_count + 1
    END,
    last_call_date = CURRENT_DATE
  RETURNING user_ai_usage.calls_count INTO v_count;

  RETURN QUERY SELECT (v_count <= p_daily_limit), v_count, p_daily_limit;
END;
$$;

-- The /api/chat endpoint calls this as the signed-in user (so auth.uid() works).
-- Explicitly locked to signed-in users only — Postgres grants EXECUTE to
-- PUBLIC by default, which would otherwise let the anon role call it too.
REVOKE EXECUTE ON FUNCTION check_ai_usage_limit(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_ai_usage_limit(INTEGER) TO authenticated;
