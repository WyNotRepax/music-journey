select artist, count(*) as tag_count from
track_tags
group by artist
order by tag_count desc
