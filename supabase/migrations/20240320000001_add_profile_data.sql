-- Add profile_data jsonb column to users table
alter table public.users add column if not exists profile_data jsonb default '{}'::jsonb;
