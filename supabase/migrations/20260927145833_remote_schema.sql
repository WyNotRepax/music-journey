DROP VIEW "public"."dayly_plays";

DROP VIEW "public"."monthly_plays";

DROP VIEW "public"."weekly_plays";

ALTER TABLE "public"."play"
  DROP CONSTRAINT "play_user_fkey";

DROP TABLE "public"."play";

CREATE TABLE "public"."artists" (
  "name" character varying NOT NULL,
  "url"  character varying NOT NULL,
  CONSTRAINT "artists_pkey" PRIMARY KEY (name)
);

ALTER TABLE "public"."artists"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."plays" (
  "name"   character varying           NOT NULL,
  "artist" character varying           NOT NULL,
  "date"   timestamp without time zone NOT NULL,
  "user"   character varying           NOT NULL,
  CONSTRAINT "play_pkey" PRIMARY KEY (name, artist, date, "user")
);

ALTER TABLE "public"."plays"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tracks" (
  "name"   character varying NOT NULL,
  "artist" character varying NOT NULL,
  "album"  character varying NOT NULL,
  CONSTRAINT "tracks_pkey" PRIMARY KEY (name, artist)
);

ALTER TABLE "public"."tracks"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."plays"
  ADD CONSTRAINT "play_user_fkey" FOREIGN KEY ("user") REFERENCES public.users("user") ON UPDATE CASCADE ON DELETE CASCADE;

CREATE VIEW "public"."dayly_plays" WITH (security_invoker=on) AS  SELECT "user",
    count(*) AS count,
    date_trunc('day'::text, date) AS date
   FROM public.plays
  GROUP BY "user", (date_trunc('day'::text, date));

CREATE VIEW "public"."missing_artists" WITH (security_invoker=on) AS  SELECT DISTINCT plays.artist
   FROM (public.plays
     LEFT JOIN public.artists ON (((artists.name)::text = (plays.artist)::text)))
  WHERE (artists.name IS NULL);

CREATE VIEW "public"."monthly_plays" WITH (security_invoker=on) AS  SELECT "user",
    count(*) AS count,
    date_trunc('month'::text, date) AS date
   FROM public.plays
  GROUP BY "user", (date_trunc('month'::text, date));

CREATE VIEW "public"."weekly_plays" WITH (security_invoker=on) AS  SELECT "user",
    count(*) AS count,
    date_trunc('week'::text, date) AS date
   FROM public.plays
  GROUP BY "user", (date_trunc('week'::text, date));

CREATE POLICY "Enable read access for all users" ON "public"."plays"
  FOR SELECT
  TO PUBLIC
  USING (true);

COMMENT ON TABLE "public"."plays" IS 'A single play of a track';

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."artists" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."plays" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tracks" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."dayly_plays" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."missing_artists" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."monthly_plays" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weekly_plays" TO "anon", "authenticated", "postgres", "service_role";

