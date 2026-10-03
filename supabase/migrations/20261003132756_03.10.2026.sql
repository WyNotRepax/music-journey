DROP VIEW "public"."dayly_plays";

DROP VIEW "public"."missing_artists";

DROP VIEW "public"."monthly_plays";

DROP VIEW "public"."weekly_plays";

CREATE TABLE "public"."artist_tags" (
  "artist" character varying NOT NULL,
  "tag"    character varying NOT NULL,
  "count"  bigint            NOT NULL,
  CONSTRAINT "artist_tags_count_check" CHECK ((count > 0)),
  CONSTRAINT "artist_tags_pkey" PRIMARY KEY (artist, TAG)
);

ALTER TABLE "public"."artist_tags"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tags" (
  "name" character varying NOT NULL,
  "url"  character varying,
  CONSTRAINT "tags_pkey" PRIMARY KEY (name)
);

ALTER TABLE "public"."tags"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."track_tags" (
  "track"  character varying NOT NULL,
  "artist" character varying NOT NULL,
  "tag"    character varying NOT NULL,
  "count"  bigint,
  CONSTRAINT "track_tags_pkey" PRIMARY KEY (track, artist, TAG)
);

ALTER TABLE "public"."track_tags"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."artists"
  ADD COLUMN "tags_fetched" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."tracks"
  ADD COLUMN "tags_fetched" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."artists"
  ALTER COLUMN "url" DROP NOT NULL;

ALTER TABLE "public"."plays"
  ALTER COLUMN "date" DROP DEFAULT;

ALTER TABLE "public"."plays"
  ALTER COLUMN "date" TYPE timestamp WITH time zone USING "date"::timestamp WITH time zone;

ALTER TABLE "public"."artist_tags"
  ADD CONSTRAINT "artist_tags_artist_fkey" FOREIGN KEY (artist) REFERENCES public.artists(name) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."plays"
  ADD CONSTRAINT "plays_artist_fkey" FOREIGN KEY (artist) REFERENCES public.artists(name) ON UPDATE CASCADE;

ALTER TABLE "public"."plays"
  ADD CONSTRAINT "plays_name_artist_fkey" FOREIGN KEY (name, artist) REFERENCES public.tracks(name, artist) ON UPDATE CASCADE;

ALTER TABLE "public"."artist_tags"
  ADD CONSTRAINT "artist_tags_tag_fkey" FOREIGN KEY (TAG) REFERENCES public.tags(name) ON UPDATE CASCADE;

ALTER TABLE "public"."track_tags"
  ADD CONSTRAINT "tack_tags_name_artist_fkey" FOREIGN KEY (track, artist) REFERENCES public.tracks(name, artist) ON UPDATE CASCADE;

ALTER TABLE "public"."track_tags"
  ADD CONSTRAINT "tack_tags_tag_fkey" FOREIGN KEY (TAG) REFERENCES public.tags(name) ON UPDATE CASCADE;

CREATE VIEW "public"."listening_clock" WITH (security_invoker=on) AS  SELECT "user",
    count(date) AS count,
    EXTRACT(hour FROM date) AS hour,
    date_trunc('day'::text, date, 'Europe/Berlin'::text) AS trunc_day,
    date_trunc('week'::text, date, 'Europe/Berlin'::text) AS trunc_week,
    date_trunc('month'::text, date, 'Europe/Berlin'::text) AS trunc_month
   FROM public.plays
  GROUP BY "user", (EXTRACT(hour FROM date)), (date_trunc('day'::text, date, 'Europe/Berlin'::text)), (date_trunc('week'::text, date, 'Europe/Berlin'::text)), (date_trunc('month'::text, date, 'Europe/Berlin'::text));

CREATE VIEW "public"."listening_clock_day" WITH (security_invoker=on) AS  SELECT "user",
    hour,
    trunc_day AS date,
    sum(count) AS count
   FROM public.listening_clock
  GROUP BY "user", hour, trunc_day;

CREATE VIEW "public"."listening_clock_month" WITH (security_invoker=on) AS  SELECT "user",
    hour,
    trunc_month AS date,
    sum(count) AS count
   FROM public.listening_clock
  GROUP BY "user", hour, trunc_month;

CREATE VIEW "public"."listening_clock_week" WITH (security_invoker=on) AS  SELECT "user",
    hour,
    trunc_week AS date,
    sum(count) AS count
   FROM public.listening_clock
  GROUP BY "user", hour, trunc_week;

CREATE VIEW "public"."play_tags" WITH (security_invoker=on) AS  SELECT "user",
    date,
    tag,
    date_trunc('day'::text, date, 'Europe/Berlin'::text) AS trunc_day,
    date_trunc('week'::text, date, 'Europe/Berlin'::text) AS trunc_week,
    date_trunc('month'::text, date, 'Europe/Berlin'::text) AS trunc_month
   FROM ( SELECT plays."user",
            plays.date,
            track_tags.tag
           FROM (public.plays
             JOIN public.track_tags ON ((((plays.name)::text = (track_tags.track)::text) AND ((plays.artist)::text = (track_tags.artist)::text))))
        UNION
         SELECT plays."user",
            plays.date,
            artist_tags.tag
           FROM (public.plays
             JOIN public.artist_tags ON (((plays.artist)::text = (artist_tags.artist)::text)))) unnamed_subquery;

CREATE VIEW "public"."play_tags_day" WITH (security_invoker=on) AS  SELECT "user",
    trunc_day AS date,
    tag,
    count(*) AS count
   FROM public.play_tags
  GROUP BY "user", trunc_day, tag
  ORDER BY trunc_day DESC, (count(*)) DESC;

CREATE VIEW "public"."play_tags_month" WITH (security_invoker=on) AS  SELECT "user",
    trunc_month AS date,
    tag,
    count(*) AS count
   FROM public.play_tags
  GROUP BY "user", trunc_month, tag
  ORDER BY trunc_month DESC, (count(*)) DESC;

CREATE VIEW "public"."play_tags_week" WITH (security_invoker=on) AS  SELECT "user",
    trunc_week AS date,
    tag,
    count(*) AS count
   FROM public.play_tags
  GROUP BY "user", trunc_week, tag
  ORDER BY trunc_week DESC, (count(*)) DESC;

CREATE VIEW "public"."plays_day" WITH (security_invoker=on) AS  SELECT "user",
    date_trunc('day'::text, date, 'Europe/Berlin'::text) AS date,
    count(*) AS count
   FROM public.plays
  GROUP BY "user", (date_trunc('day'::text, date, 'Europe/Berlin'::text))
  ORDER BY (date_trunc('day'::text, date, 'Europe/Berlin'::text)) DESC;

CREATE VIEW "public"."plays_month" WITH (security_invoker=on) AS  SELECT "user",
    date_trunc('month'::text, date, 'Europe/Berlin'::text) AS date,
    count(*) AS count
   FROM public.plays
  GROUP BY "user", (date_trunc('month'::text, date, 'Europe/Berlin'::text))
  ORDER BY (date_trunc('month'::text, date, 'Europe/Berlin'::text)) DESC;

CREATE VIEW "public"."plays_week" WITH (security_invoker=on) AS  SELECT "user",
    date_trunc('week'::text, date, 'Europe/Berlin'::text) AS date,
    count(*) AS count
   FROM public.plays
  GROUP BY "user", (date_trunc('week'::text, date, 'Europe/Berlin'::text))
  ORDER BY (date_trunc('week'::text, date, 'Europe/Berlin'::text)) DESC;

CREATE POLICY "Enable read access for all users" ON "public"."artist_tags"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."artists"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."tags"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."track_tags"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."tracks"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."artist_tags" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tags" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."track_tags" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."listening_clock" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."listening_clock_day" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."listening_clock_month" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."listening_clock_week" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."play_tags" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."play_tags_day" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."play_tags_month" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."play_tags_week" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plays_day" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plays_month" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plays_week" TO "anon", "authenticated", "postgres", "service_role";
