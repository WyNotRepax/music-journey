drop view if exists "play_tags";
drop view if exists "play_tags_day";
drop view if exists "play_tags_week";
drop view if exists "play_tags_month";

create view play_tags with (security_invoker = on) as
select 
  *, 
  date_trunc('day', "date", 'Europe/Berlin') as "trunc_day",
  date_trunc('week', "date", 'Europe/Berlin') as "trunc_week",
  date_trunc('month', "date", 'Europe/Berlin') as "trunc_month"
from (
  select
    plays.user as user,
    plays.date as date,
    track_tags.tag as tag
  from plays
    join track_tags 
    on plays.name = track_tags.track and plays.artist = track_tags.artist
  union
    select
      plays.user as user,
      plays.date as date,
      artist_tags.tag as tag
    from plays
      join artist_tags 
      on plays.artist = artist_tags.artist
);

create view play_tags_day with (security_invoker = on) as 
select 
  play_tags.user,
  trunc_day as date,
  tag as tag,
  count(*) as count
from play_tags group by play_tags.user, trunc_day, tag
order by date desc, count desc;

create view play_tags_week with (security_invoker = on) as 
select 
  play_tags.user,
  trunc_week as date,
  tag as tag,
  count(*) as count
from play_tags group by play_tags.user, trunc_week, tag
order by date desc, count desc;

create view play_tags_month with (security_invoker = on) as 
select 
  play_tags.user,
  trunc_month as date,
  tag as tag,
  count(*) as count
from play_tags group by play_tags.user, trunc_month, tag
order by date desc, count desc;