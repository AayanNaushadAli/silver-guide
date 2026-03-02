-- DEBUG: Temporarily disable RLS on player_stats to test if RLS is blocking inserts
-- Run this in Supabase SQL Editor to test

-- Option 1: Quick test — disable RLS temporarily
ALTER TABLE player_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE quests DISABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions DISABLE ROW LEVEL SECURITY;

-- Now test the app again. If data appears, the problem is RLS policies.
-- If data STILL doesn't appear, the problem is elsewhere (token, network, etc.)

-- AFTER TESTING: Re-enable RLS with fixed policies
-- Run the commands below ONLY after you confirm data flows without RLS:

/*
-- Re-enable RLS
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_sessions ENABLE ROW LEVEL SECURITY;

-- Drop old policies and create fixed ones using 'sub' claim from JWT
DROP POLICY IF EXISTS "Users can manage own stats" ON player_stats;
CREATE POLICY "Users can manage own stats"
  ON player_stats FOR ALL
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  WITH CHECK (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

DROP POLICY IF EXISTS "Users can manage own quests" ON quests;
CREATE POLICY "Users can manage own quests"
  ON quests FOR ALL
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  WITH CHECK (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));

DROP POLICY IF EXISTS "Users can manage own sessions" ON mentor_sessions;
CREATE POLICY "Users can manage own sessions"
  ON mentor_sessions FOR ALL
  USING (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'))
  WITH CHECK (clerk_user_id = (current_setting('request.jwt.claims', true)::json ->> 'sub'));
*/
