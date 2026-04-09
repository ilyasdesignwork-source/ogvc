create table if not exists public.avatars (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Rookie',
  speed int not null check (speed between 40 and 99),
  awareness int not null check (awareness between 40 and 99),
  consistency int not null check (consistency between 40 and 99),
  overtaking int not null check (overtaking between 40 and 99),
  racecraft int not null check (racecraft between 40 and 99),
  rating int not null check (rating between 1 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id bigint generated always as identity primary key,
  title text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id bigint generated always as identity primary key,
  name text not null unique,
  country text not null
);

create table if not exists public.driver_standings (
  id bigint generated always as identity primary key,
  driver_name text not null,
  team_name text not null,
  points int not null default 0
);

create table if not exists public.constructor_standings (
  id bigint generated always as identity primary key,
  team_name text not null unique,
  points int not null default 0
);

alter table public.avatars enable row level security;
alter table public.news enable row level security;
alter table public.teams enable row level security;
alter table public.driver_standings enable row level security;
alter table public.constructor_standings enable row level security;

drop policy if exists "avatars_select_own" on public.avatars;
create policy "avatars_select_own"
on public.avatars for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "avatars_upsert_own" on public.avatars;
create policy "avatars_upsert_own"
on public.avatars for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "avatars_update_own" on public.avatars;
create policy "avatars_update_own"
on public.avatars for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "avatars_delete_own" on public.avatars;
create policy "avatars_delete_own"
on public.avatars for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "news_read_all" on public.news;
create policy "news_read_all"
on public.news for select
to anon, authenticated
using (true);

drop policy if exists "teams_read_all" on public.teams;
create policy "teams_read_all"
on public.teams for select
to anon, authenticated
using (true);

drop policy if exists "driver_standings_read_all" on public.driver_standings;
create policy "driver_standings_read_all"
on public.driver_standings for select
to anon, authenticated
using (true);

drop policy if exists "constructor_standings_read_all" on public.constructor_standings;
create policy "constructor_standings_read_all"
on public.constructor_standings for select
to anon, authenticated
using (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists avatars_set_updated_at on public.avatars;
create trigger avatars_set_updated_at
before update on public.avatars
for each row
execute procedure public.set_updated_at();
