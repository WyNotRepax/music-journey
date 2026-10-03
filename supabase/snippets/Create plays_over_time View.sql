drop view if exists "plays_day";
drop view if exists "plays_week";
drop view if exists "plays_month";

create view plays_day with (security_invoker = on) as
select
  plays.user as user,
  date_trunc('day', plays.date, 'Europe/Berlin') as date,
  count(*) as count
from plays
group by plays.user, date_trunc('day', plays.date, 'Europe/Berlin')
order by date desc;

create view plays_week with (security_invoker = on) as
select
  plays.user as user,
  date_trunc('week', plays.date, 'Europe/Berlin') as date,
  count(*) as count
from plays
group by plays.user, date_trunc('week', plays.date, 'Europe/Berlin')
order by date desc;

create view plays_month with (security_invoker = on) as
select
  plays.user as user,
  date_trunc('month', plays.date, 'Europe/Berlin') as date,
  count(*) as count
from plays
group by plays.user, date_trunc('month', plays.date, 'Europe/Berlin')
order by date desc;
