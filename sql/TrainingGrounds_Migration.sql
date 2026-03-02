-- =============================================
-- TRAINING GROUNDS MIGRATION
-- Adds tracking columns for the Pomodoro RPG Feature
-- Run this in Supabase SQL Editor
-- =============================================

ALTER TABLE player_stats
  ADD COLUMN IF NOT EXISTS focus_sessions_completed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_focus_minutes INTEGER DEFAULT 0;
