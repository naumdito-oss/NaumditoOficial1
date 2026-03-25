-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Couples Table
create table public.couples (
  id uuid default uuid_generate_v4() primary key,
  couple_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Users/Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text not null,
  photo_url text,
  points integer default 0,
  level integer default 1,
  couple_id uuid references public.couples(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Agreements Table
create table public.agreements (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  text text not null,
  status text check (status in ('active', 'broken')) default 'active',
  justification text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.profiles(id) on delete cascade not null
);

-- Exchanges Table
create table public.exchanges (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null,
  description text not null,
  type text check (type in ('romantico', 'divertido', 'picante', 'ajuda')) not null,
  status text check (status in ('pending', 'counter_proposed', 'accepted', 'completed')) default 'pending',
  counter_offer text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.profiles(id) on delete cascade not null
);

-- Wishlist Items Table
create table public.wishlist_items (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  link text not null,
  title text,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.profiles(id) on delete cascade not null
);

-- Checkin History Table
create table public.checkins (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  date date not null,
  feeling text not null,
  tags text[] default '{}',
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.profiles(id) on delete cascade not null
);

-- Empathy Messages Table
create table public.empathy_messages (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  text text not null,
  vibe text check (vibe in ('fofo', 'sincero', 'engracado')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.profiles(id) on delete cascade not null
);

-- Next Date Plans Table
create table public.next_date_plans (
  id uuid default uuid_generate_v4() primary key,
  couple_id uuid references public.couples(id) on delete cascade not null,
  title text not null,
  description text not null,
  location text not null,
  photo text,
  program_type text check (program_type in ('pipoca', 'restaurante', 'parque', 'experiencia', 'outro')) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  author_id uuid references public.profiles(id) on delete cascade not null
);

-- Set up Row Level Security (RLS)

-- Profiles
alter table public.profiles enable row level security;
create policy "Users can view their own profile." on public.profiles
  for select using (auth.uid() = id);
create policy "Users can view their partner's profile." on public.profiles
  for select using (couple_id is not null and couple_id = (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Couples
alter table public.couples enable row level security;
create policy "Users can view their own couple data." on public.couples
  for select using (
    id = (select couple_id from public.profiles where id = auth.uid())
  );

-- Agreements
alter table public.agreements enable row level security;
create policy "Users can view their couple's agreements." on public.agreements
  for select using (couple_id = (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can insert agreements for their couple." on public.agreements
  for insert with check (couple_id = (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can update their couple's agreements." on public.agreements
  for update using (couple_id = (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can delete their couple's agreements." on public.agreements
  for delete using (couple_id = (select p.couple_id from public.profiles p where p.id = auth.uid()));

-- Exchanges
alter table public.exchanges enable row level security;
create policy "Users can view their couple's exchanges." on public.exchanges
  for select using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can insert exchanges for their couple." on public.exchanges
  for insert with check (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can update their couple's exchanges." on public.exchanges
  for update using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can delete their couple's exchanges." on public.exchanges
  for delete using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));

-- Wishlist Items
alter table public.wishlist_items enable row level security;
create policy "Users can view their couple's wishlist." on public.wishlist_items
  for select using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can insert wishlist items for their couple." on public.wishlist_items
  for insert with check (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can delete their couple's wishlist items." on public.wishlist_items
  for delete using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));

-- Checkins
alter table public.checkins enable row level security;
create policy "Users can view their couple's checkins." on public.checkins
  for select using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can insert checkins for their couple." on public.checkins
  for insert with check (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));

-- Empathy Messages
alter table public.empathy_messages enable row level security;
create policy "Users can view their couple's empathy messages." on public.empathy_messages
  for select using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can insert empathy messages for their couple." on public.empathy_messages
  for insert with check (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can delete their couple's empathy messages." on public.empathy_messages
  for delete using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));

-- Next Date Plans
alter table public.next_date_plans enable row level security;
create policy "Users can view their couple's next date plans." on public.next_date_plans
  for select using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));
create policy "Users can insert/update next date plans for their couple." on public.next_date_plans
  for all using (couple_id in (select p.couple_id from public.profiles p where p.id = auth.uid()));

-- Trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, photo_url)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'photo_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
