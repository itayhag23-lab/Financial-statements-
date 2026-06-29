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
-- Tracks AI (chat) requests per signed-in user using fixed time windows, so the
-- /api/chat endpoint can cap usage without any external service (no Redis).
-- One row per (user, bucket); "bucket" lets us enforce several limits at once,
-- e.g. an hourly anti-burst limit AND a monthly cost cap.
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket        TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  request_count INTEGER     NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, bucket)
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Users may read (only) their own usage — handy for showing "X of Y left" in the
-- UI. All writes go through the SECURITY DEFINER function below, never directly.
CREATE POLICY "Users can read own AI usage"
  ON ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Atomically count one request against a fixed window and report whether it is
-- allowed. The window resets (count → 1) once `p_window_seconds` have elapsed
-- since it started. Runs as the function owner (SECURITY DEFINER) so it can
-- write to ai_usage despite RLS, and derives the user from auth.uid() so a
-- caller can never inflate another user's counter.
CREATE OR REPLACE FUNCTION check_ai_rate_limit(
  p_bucket         TEXT,
  p_limit          INTEGER,
  p_window_seconds INTEGER
)
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

  INSERT INTO ai_usage (user_id, bucket, window_start, request_count)
  VALUES (v_user, p_bucket, NOW(), 1)
  ON CONFLICT (user_id, bucket) DO UPDATE SET
    request_count = CASE
      WHEN ai_usage.window_start < NOW() - make_interval(secs => p_window_seconds)
        THEN 1
      ELSE ai_usage.request_count + 1
    END,
    window_start = CASE
      WHEN ai_usage.window_start < NOW() - make_interval(secs => p_window_seconds)
        THEN NOW()
      ELSE ai_usage.window_start
    END
  RETURNING ai_usage.request_count INTO v_count;

  RETURN QUERY SELECT (v_count <= p_limit), v_count, p_limit;
END;
$$;

-- The /api/chat endpoint calls this as the signed-in user (so auth.uid() works).
GRANT EXECUTE ON FUNCTION check_ai_rate_limit(TEXT, INTEGER, INTEGER) TO authenticated;
