-- =============================================
-- Profile Stats Columns
-- Run this in Supabase SQL Editor
-- =============================================

ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS focus_time_minutes INTEGER DEFAULT 0;
ALTER TABLE player_stats ADD COLUMN IF NOT EXISTS quests_completed INTEGER DEFAULT 0;

-- Optional: backfill existing users who have NULL values
UPDATE player_stats SET focus_time_minutes = 0 WHERE focus_time_minutes IS NULL;
UPDATE player_stats SET quests_completed = 0 WHERE quests_completed IS NULL;
