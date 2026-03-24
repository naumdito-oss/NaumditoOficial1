-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create users table
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  partner_name text,
  photo_url text,
  points integer default 0,
  level integer default 1,
  couple_id uuid,
  couple_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create agreements table
create table public.agreements (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid not null,
  text text not null,
  status text not null default 'active',
  justification text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create exchanges table
create table public.exchanges (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid not null,
  title text not null,
  description text not null,
  type text not null,
  status text not null default 'pending',
  author_name text,
  counter_offer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create wishlist_items table
create table public.wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid not null,
  link text not null,
  title text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create checkin_history table
create table public.checkin_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  date timestamp with time zone not null,
  feeling text not null,
  tags text[] default '{}',
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create weekly_progress table
create table public.weekly_progress (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid not null,
  week_starting timestamp with time zone not null,
  percentage integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create empathy_messages table
create table public.empathy_messages (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid not null,
  text text not null,
  vibe text not null,
  author_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create next_date_plans table
create table public.next_date_plans (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid not null,
  title text not null,
  description text not null,
  location text not null,
  photo text,
  program_type text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.agreements enable row level security;
alter table public.exchanges enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.checkin_history enable row level security;
alter table public.weekly_progress enable row level security;
alter table public.empathy_messages enable row level security;
alter table public.next_date_plans enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.users for update
  using ( auth.uid() = id );

-- For couple_id based tables, allow access if user belongs to that couple
-- This requires a function to get the user's couple_id
create or replace function public.get_user_couple_id()
returns uuid
language sql security definer
as $$
  select couple_id from public.users where id = auth.uid();
$$;

create policy "Users can view their couple's agreements"
  on public.agreements for select
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can insert their couple's agreements"
  on public.agreements for insert
  with check ( couple_id = public.get_user_couple_id() );

create policy "Users can update their couple's agreements"
  on public.agreements for update
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can delete their couple's agreements"
  on public.agreements for delete
  using ( couple_id = public.get_user_couple_id() );

-- Exchanges policies
create policy "Users can view their couple's exchanges"
  on public.exchanges for select
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can insert their couple's exchanges"
  on public.exchanges for insert
  with check ( couple_id = public.get_user_couple_id() );

create policy "Users can update their couple's exchanges"
  on public.exchanges for update
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can delete their couple's exchanges"
  on public.exchanges for delete
  using ( couple_id = public.get_user_couple_id() );

-- Wishlist policies
create policy "Users can view their couple's wishlist"
  on public.wishlist_items for select
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can insert their couple's wishlist"
  on public.wishlist_items for insert
  with check ( couple_id = public.get_user_couple_id() );

create policy "Users can delete their couple's wishlist"
  on public.wishlist_items for delete
  using ( couple_id = public.get_user_couple_id() );

-- Checkin history policies
create policy "Users can view their own checkins"
  on public.checkin_history for select
  using ( user_id = auth.uid() );

create policy "Users can insert their own checkins"
  on public.checkin_history for insert
  with check ( user_id = auth.uid() );

-- Weekly progress policies
create policy "Users can view their couple's weekly progress"
  on public.weekly_progress for select
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can insert their couple's weekly progress"
  on public.weekly_progress for insert
  with check ( couple_id = public.get_user_couple_id() );

create policy "Users can update their couple's weekly progress"
  on public.weekly_progress for update
  using ( couple_id = public.get_user_couple_id() );

-- Empathy messages policies
create policy "Users can view their couple's empathy messages"
  on public.empathy_messages for select
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can insert their couple's empathy messages"
  on public.empathy_messages for insert
  with check ( couple_id = public.get_user_couple_id() );

create policy "Users can delete their couple's empathy messages"
  on public.empathy_messages for delete
  using ( couple_id = public.get_user_couple_id() );

-- Next date plans policies
create policy "Users can view their couple's next date plans"
  on public.next_date_plans for select
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can insert their couple's next date plans"
  on public.next_date_plans for insert
  with check ( couple_id = public.get_user_couple_id() );

create policy "Users can update their couple's next date plans"
  on public.next_date_plans for update
  using ( couple_id = public.get_user_couple_id() );

create policy "Users can delete their couple's next date plans"
  on public.next_date_plans for delete
  using ( couple_id = public.get_user_couple_id() );
