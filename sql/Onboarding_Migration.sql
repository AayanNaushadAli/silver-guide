-- =============================================
-- Onboarding Profile Columns Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- Add onboarding profile fields to player_stats
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'cs',
  ADD COLUMN IF NOT EXISTS target_cgpa DECIMAL(3,2) DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS focus_mode TEXT DEFAULT 'exam_performance';

-- Ensure has_completed_onboarding exists (may have been added by AI_Mentor_Migration)
ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Mark existing users as onboarding-complete (they were using the app before this)
-- Comment this out if you want existing users to re-do onboarding
-- UPDATE player_stats SET has_completed_onboarding = true WHERE clerk_user_id IS NOT NULL;
