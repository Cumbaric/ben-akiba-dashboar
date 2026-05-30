-- Pokreni ovo u Supabase SQL editoru

create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  performer text not null,
  date date not null,
  time text not null default '20:00',
  price numeric not null default 0,
  capacity integer not null default 120,
  sold integer not null default 0,
  reserved integer not null default 0,
  confirmed integer not null default 0,
  waitlist integer not null default 0,
  phone text,
  note text,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz default now()
);

-- Dozvoli javno čitanje (za repertoar stranicu)
alter table events enable row level security;

create policy "Javno čitanje" on events
  for select using (true);

create policy "Samo authenticated write" on events
  for all using (auth.role() = 'service_role');
