alter table public.avatars
  drop constraint if exists check_stats_sum;

alter table public.avatars
  add constraint check_stats_sum
  check (speed + awareness + consistency + overtaking + racecraft <= 360);
