create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_emails enable row level security;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self"
on public.admin_users for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admin_emails_select_self" on public.admin_emails;
create policy "admin_emails_select_self"
on public.admin_emails for select
to authenticated
using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.user_id = auth.uid()
  ) or exists (
    select 1
    from public.admin_emails e
    where lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "admin_can_select_avatars" on public.avatars;
create policy "admin_can_select_avatars"
on public.avatars for select
to authenticated
using (public.is_admin());

drop policy if exists "admin_can_insert_avatars" on public.avatars;
create policy "admin_can_insert_avatars"
on public.avatars for insert
to authenticated
with check (public.is_admin());

drop policy if exists "admin_can_update_avatars" on public.avatars;
create policy "admin_can_update_avatars"
on public.avatars for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_can_delete_avatars" on public.avatars;
create policy "admin_can_delete_avatars"
on public.avatars for delete
to authenticated
using (public.is_admin());

drop policy if exists "admin_can_manage_news" on public.news;
create policy "admin_can_manage_news"
on public.news for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_can_manage_site_texts" on public.site_texts;
create policy "admin_can_manage_site_texts"
on public.site_texts for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_can_manage_teams" on public.teams;
create policy "admin_can_manage_teams"
on public.teams for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_can_manage_driver_standings" on public.driver_standings;
create policy "admin_can_manage_driver_standings"
on public.driver_standings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_can_manage_constructor_standings" on public.constructor_standings;
create policy "admin_can_manage_constructor_standings"
on public.constructor_standings for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admin_can_manage_avatar_photos" on storage.objects;
create policy "admin_can_manage_avatar_photos"
on storage.objects for all
to authenticated
using (
  bucket_id = 'avatar-photos'
  and public.is_admin()
)
with check (
  bucket_id = 'avatar-photos'
  and public.is_admin()
);

drop policy if exists "admin_can_manage_news_images" on storage.objects;
create policy "admin_can_manage_news_images"
on storage.objects for all
to authenticated
using (
  bucket_id = 'news-images'
  and public.is_admin()
)
with check (
  bucket_id = 'news-images'
  and public.is_admin()
);
