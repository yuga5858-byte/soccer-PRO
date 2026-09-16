-- 安羅夕雅OS — Supabase schema
-- Single-user personal AI soccer coach OS. All tables are scoped to one profile row.
-- Run this in the Supabase SQL editor to provision the backend.

create extension if not exists "uuid-ossp";

create table if not exists profile (
  id text primary key default 'anra_yuga',
  name text not null default '安羅夕雅',
  age int not null default 20,
  target_age int not null default 22,
  university text not null default '大阪経済大学',
  position text not null default 'ボランチ',
  sub_position text not null default 'トップ下',
  dominant_foot text not null default 'right',
  height_cm numeric not null default 177,
  weight_kg numeric not null default 72,
  target_weight_kg numeric not null default 75,
  jersey_number int not null default 10,
  play_style text not null default 'プレイメーカー型ボランチ',
  idol_player text not null default 'ルカ・モドリッチ',
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  injury_history text[] not null default '{}',
  supplements text[] not null default '{}',
  goals text[] not null default '{}',
  sleep_hours numeric not null default 7,
  bed_time text not null default '00:30',
  wake_time text not null default '08:00',
  meals_per_day int not null default 3,
  bench_press_kg numeric not null default 90,
  squat_kg numeric not null default 100,
  grip_strength_kg numeric not null default 40,
  level int not null default 1,
  xp int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists abilities (
  profile_id text primary key references profile(id) on delete cascade,
  pass int not null default 50,
  through_pass int not null default 50,
  kick int not null default 50,
  keep int not null default 50,
  vision int not null default 50,
  tactics int not null default 50,
  defense int not null default 50,
  agility int not null default 50,
  mental int not null default 50,
  resilience int not null default 50,
  updated_at timestamptz not null default now()
);

create table if not exists daily_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  weight_kg numeric,
  sleep_hours numeric,
  pain_level int,
  anxiety_level int,
  mood int,
  note text,
  created_at timestamptz not null default now(),
  unique (profile_id, date)
);

create table if not exists daily_tasks (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  title text not null,
  category text not null check (category in ('soccer','strength','recovery','study','mental','video')),
  reason text not null,
  done boolean not null default false,
  xp_reward int not null default 10,
  created_at timestamptz not null default now()
);

create table if not exists soccer_sessions (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  practice_minutes int not null default 0,
  self_practice_minutes int not null default 0,
  ball_touches int not null default 0,
  video_analysis_minutes int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists strength_sessions (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  sets jsonb not null default '[]',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists acl_logs (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  pain int not null default 0,
  anxiety int not null default 0,
  swelling int not null default 0,
  range_of_motion_deg numeric,
  notes text,
  created_at timestamptz not null default now(),
  unique (profile_id, date)
);

create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  opponent text,
  minutes_played int not null default 0,
  goals int not null default 0,
  assists int not null default 0,
  pass_success_rate numeric not null default 0,
  progressive_passes int not null default 0,
  through_passes_completed int not null default 0,
  key_passes int not null default 0,
  balls_won int not null default 0,
  balls_lost int not null default 0,
  self_rating numeric not null default 0,
  self_evaluation text,
  created_at timestamptz not null default now()
);

create table if not exists video_analyses (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  type text not null check (type in ('squat','match')),
  file_name text not null,
  storage_path text,
  status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
  squat_result jsonb,
  match_result jsonb,
  created_at timestamptz not null default now()
);

create table if not exists coach_messages (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  headline text not null,
  message text not null,
  focus_areas text[] not null default '{}',
  source text not null default 'rule-based',
  created_at timestamptz not null default now()
);

create table if not exists xp_events (
  id uuid primary key default uuid_generate_v4(),
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  source text not null check (source in ('practice','strength','match','study','video_analysis','task')),
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists pro_index_history (
  profile_id text not null references profile(id) on delete cascade,
  date date not null,
  score numeric not null,
  breakdown jsonb not null,
  primary key (profile_id, date)
);

-- Storage bucket for uploaded squat / match videos
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- Seed the single profile row for 安羅夕雅
insert into profile (id) values ('anra_yuga') on conflict (id) do nothing;
insert into abilities (profile_id, pass, through_pass, kick, keep, vision, tactics, defense, agility, mental, resilience)
values ('anra_yuga', 78, 82, 76, 74, 70, 52, 40, 45, 65, 55)
on conflict (profile_id) do nothing;
