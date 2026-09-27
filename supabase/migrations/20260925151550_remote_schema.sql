CREATE TABLE "public"."play" (
  "name"   character varying           NOT NULL,
  "artist" character varying           NOT NULL,
  "date"   timestamp without time zone NOT NULL,
  "user"   character varying           NOT NULL,
  CONSTRAINT "play_pkey" PRIMARY KEY (name, artist, date, "user")
);

ALTER TABLE "public"."play"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."users" (
  "user"           character varying           NOT NULL,
  "created_at"     timestamp without time zone NOT NULL DEFAULT now(),
  "last_refreshed" timestamp without time zone,
  "url"            character varying           NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("user")
);

ALTER TABLE "public"."play"
  ADD CONSTRAINT "play_user_fkey" FOREIGN KEY ("user") REFERENCES public.users("user") ON UPDATE CASCADE ON DELETE CASCADE;

COMMENT ON TABLE "public"."play" IS 'A single play of a track';

COMMENT ON TABLE "public"."users" IS 'The User Table';

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."play" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."users" TO "anon", "authenticated", "postgres", "service_role";

