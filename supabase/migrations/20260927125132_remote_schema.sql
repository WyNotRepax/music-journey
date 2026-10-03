ALTER TABLE "public"."users"
  ENABLE ROW LEVEL SECURITY;

CREATE VIEW "public"."dayly_plays" WITH (security_invoker=on) AS  SELECT "user",
    count(*) AS count,
    date_trunc('day'::text, date) AS date
   FROM public.play
  GROUP BY "user", (date_trunc('day'::text, date));

CREATE VIEW "public"."monthly_plays" WITH (security_invoker=on) AS  SELECT "user",
    count(*) AS count,
    date_trunc('month'::text, date) AS date
   FROM public.play
  GROUP BY "user", (date_trunc('month'::text, date));

CREATE VIEW "public"."weekly_plays" WITH (security_invoker=on) AS  SELECT "user",
    count(*) AS count,
    date_trunc('week'::text, date) AS date
   FROM public.play
  GROUP BY "user", (date_trunc('week'::text, date));

CREATE POLICY "Enable read access for all users" ON "public"."play"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."users"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."dayly_plays" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."monthly_plays" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."weekly_plays" TO "anon", "authenticated", "postgres", "service_role";

