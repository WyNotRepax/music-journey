drop view if exists "listening_clock" cascade;

create or replace view listening_clock with (security_invoker = on) as 
  select 
    "plays"."user" as "user",
    count("date") as "count",
    extract('hour' from "date") as "hour",
    date_trunc('day', "date", 'Europe/Berlin') as "trunc_day",
    date_trunc('week', "date", 'Europe/Berlin') as "trunc_week",
    date_trunc('month', "date", 'Europe/Berlin') as "trunc_month"
  from "plays"
  group by 
    "user",
    "hour",
    "trunc_day",
    "trunc_week",
    "trunc_month";
  

create or replace view listening_clock_day with (security_invoker = on) as
  select
    listening_clock.user as user,
    listening_clock.hour as hour,
    listening_clock.trunc_day as date,
    sum(listening_clock.count) as count
  from "listening_clock"
  group by
  listening_clock.user,
  listening_clock.hour,
  listening_clock.trunc_day;
    
create or replace view listening_clock_week with (security_invoker = on) as
  select
    listening_clock.user as user,
    listening_clock.hour as hour,
    listening_clock.trunc_week as date,
    sum(listening_clock.count) as count
  from "listening_clock"
  group by
  listening_clock.user,
  listening_clock.hour,
  listening_clock.trunc_week;

create or replace view listening_clock_month with (security_invoker = on) as
  select
    listening_clock.user as user,
    listening_clock.hour as hour,
    listening_clock.trunc_month as date,
    sum(listening_clock.count) as count
  from "listening_clock"
  group by
  listening_clock.user,
  listening_clock.hour,
  listening_clock.trunc_month;