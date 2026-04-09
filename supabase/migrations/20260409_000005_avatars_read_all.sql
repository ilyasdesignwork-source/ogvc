drop policy if exists "avatars_read_all" on public.avatars;
create policy "avatars_read_all"
on public.avatars for select
to anon, authenticated
using (true);
