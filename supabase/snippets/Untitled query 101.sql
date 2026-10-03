select hour, count(listening_clock.date), trunc_day
  from listening_clock 
  where listening_clock.user = 'Gnedby' and trunc_day > DATE '2026-05-01'
  group by hour, trunc_day
