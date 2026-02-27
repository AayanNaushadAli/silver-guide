CREATE TABLE quests (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  icon TEXT,
  "iconColor" TEXT,
  deadline TEXT,
  "deadlineBg" TEXT,
  "deadlineColor" TEXT,
  "deadlineIcon" TEXT,
  "progressColor" TEXT,
  tasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS must be ENABLED for Supabase + Clerk JWT auth to work
-- (DISABLE blocks authenticated requests on the public schema)
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and modify their own quests
CREATE POLICY "Users can manage own quests"
  ON quests
  FOR ALL
  USING (clerk_user_id = auth.jwt() ->> 'sub')
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');