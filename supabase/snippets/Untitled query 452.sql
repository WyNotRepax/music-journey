create or replace view dayliy_ with (security_invoker=on) as
  select
    plays.user as user,
    count(*) as count,
    date_trunc('day', plays.date) as date
  from
    plays
  group by
    plays.user,
    date_trunc('day', plays.date);

select * from daily_plays;