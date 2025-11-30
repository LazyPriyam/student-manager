-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  level integer default 1,
  xp integer default 0,
  points integer default 0,
  active_theme text default 'theme-dark',
  active_sound text default 'sound-chime',
  active_effect text default 'fx-confetti',
  active_title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create habits table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  streak integer default 0,
  completed_dates text[] default array[]::text[],
  xp_reward integer default 10,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  priority text default 'q1', -- q1, q2, q3, q4
  completed boolean default false,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create inventory table
create table inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_id text not null,
  acquired_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_id)
);

-- Create focus_sessions table (for timer history)
create table focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  duration integer not null, -- in seconds
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table habits enable row level security;
alter table tasks enable row level security;
alter table inventory enable row level security;
alter table focus_sessions enable row level security;

-- Create policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view their own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits" on habits for insert with check (auth.uid() = user_id);
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  level integer default 1,
  xp integer default 0,
  points integer default 0,
  active_theme text default 'theme-dark',
  active_sound text default 'sound-chime',
  active_effect text default 'fx-confetti',
  active_title text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create habits table
create table habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  streak integer default 0,
  completed_dates text[] default array[]::text[],
  xp_reward integer default 10,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  priority text default 'q1', -- q1, q2, q3, q4
  completed boolean default false,
  due_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create inventory table
create table inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  item_id text not null,
  acquired_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, item_id)
);

-- Focus Sessions Table
create table focus_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  duration int not null, -- in minutes
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Journal Entries Table
create table journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  mood text not null, -- 'happy', 'neutral', 'sad', 'stressed', 'focused'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table habits enable row level security;
alter table tasks enable row level security;
alter table inventory enable row level security;
alter table focus_sessions enable row level security;
alter table journal_entries enable row level security;

-- Create policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view their own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert their own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update their own habits" on habits for update using (auth.uid() = user_id);
create policy "Users can delete their own habits" on habits for delete using (auth.uid() = user_id);

create policy "Users can view their own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can insert their own tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update their own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete their own tasks" on tasks for delete using (auth.uid() = user_id);

create policy "Users can view their own inventory" on inventory for select using (auth.uid() = user_id);
create policy "Users can insert their own inventory" on inventory for insert with check (auth.uid() = user_id);

create policy "Users can view own focus sessions"
  on focus_sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own focus sessions"
  on focus_sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can view own journal entries"
  on journal_entries for select
  using ( auth.uid() = user_id );

create policy "Users can insert own journal entries"
  on journal_entries for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own journal entries"
  on journal_entries for delete
  using ( auth.uid() = user_id );

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
