ALTER TABLE "public"."users"
  ALTER COLUMN "created_at" DROP DEFAULT;

ALTER TABLE "public"."users"
  ALTER COLUMN "created_at" TYPE timestamp WITH time zone USING "created_at"::timestamp WITH time zone;

ALTER TABLE "public"."users"
  ALTER COLUMN "created_at" SET DEFAULT now();

ALTER TABLE "public"."users"
  ALTER COLUMN "last_refreshed" DROP DEFAULT;

ALTER TABLE "public"."users"
  ALTER COLUMN "last_refreshed" TYPE timestamp WITH time zone USING "last_refreshed"::timestamp WITH time zone;

