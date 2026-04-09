alter table public.avatars
  add column if not exists name text,
  add column if not exists display_name text not null default 'Rookie',
  add column if not exists team text,
  add column if not exists team_name text,
  add column if not exists photo_url text,
  add column if not exists speed int not null default 70 check (speed between 40 and 99),
  add column if not exists awareness int not null default 70 check (awareness between 40 and 99),
  add column if not exists consistency int not null default 70 check (consistency between 40 and 99),
  add column if not exists overtaking int not null default 70 check (overtaking between 40 and 99),
  add column if not exists racecraft int not null default 70 check (racecraft between 40 and 99),
  add column if not exists rating int not null default 50 check (rating between 1 and 99),
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.news
  add column if not exists photo_url text,
  add column if not exists content text;

update public.news
set content = coalesce(nullif(content, ''), summary)
where content is null or content = '';

create table if not exists public.site_texts (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_texts enable row level security;

drop policy if exists "site_texts_read_all" on public.site_texts;
create policy "site_texts_read_all"
on public.site_texts for select
to anon, authenticated
using (true);

update public.avatars
set
  display_name = coalesce(nullif(display_name, ''), name, 'Rookie'),
  name = coalesce(nullif(name, ''), display_name, 'Rookie'),
  team_name = coalesce(nullif(team_name, ''), team, 'SCUDERIA FERRARI HP'),
  team = coalesce(nullif(team, ''), team_name, 'SCUDERIA FERRARI HP');

alter table public.avatars
  alter column name set default 'Rookie',
  alter column display_name set default 'Rookie',
  alter column team_name set default 'SCUDERIA FERRARI HP',
  alter column team set default 'SCUDERIA FERRARI HP';

alter table public.avatars
  alter column name set not null,
  alter column display_name set not null,
  alter column team_name set not null,
  alter column team set not null;

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

notify pgrst, 'reload schema';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatar-photos',
  'avatar-photos',
  true,
  1048576,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-images',
  'news-images',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatar_photos_public_read" on storage.objects;
create policy "avatar_photos_public_read"
on storage.objects for select
to public
using (bucket_id = 'avatar-photos');

drop policy if exists "avatar_photos_user_insert_own" on storage.objects;
create policy "avatar_photos_user_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatar-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatar_photos_user_update_own" on storage.objects;
create policy "avatar_photos_user_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatar-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatar-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatar_photos_user_delete_own" on storage.objects;
create policy "avatar_photos_user_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatar-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "news_images_public_read" on storage.objects;
create policy "news_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'news-images');
