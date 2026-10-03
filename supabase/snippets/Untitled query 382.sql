select * from 
  (select count(*) as outstanding_artists from artists where artists.tags_fetched = false), (select count(*) as outstanding_tracks from tracks where tracks.tags_fetched = false)