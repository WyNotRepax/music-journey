drop view if exists dayly_plays;

create view dayly_plays as
  select
    play.user as user,
    count(*) as count,
    date_trunc('day', play.date) as date
  from
    play
  group by
    play.user,
    date_trunc('day', play.date);