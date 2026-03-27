-- Add missing columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS daily_points integer default 0,
ADD COLUMN IF NOT EXISTS weekly_points integer default 0,
ADD COLUMN IF NOT EXISTS checkin_completed boolean default false,
ADD COLUMN IF NOT EXISTS micro_gesture_completed boolean default false;
