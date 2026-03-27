-- Add metadata column to profiles table
alter table public.profiles
add column if not exists metadata jsonb default '{}'::jsonb;
