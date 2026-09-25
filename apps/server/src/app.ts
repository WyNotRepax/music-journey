import { Hono } from "hono";
import { cors } from "hono/cors";
import { cors as corsOrigin } from "./config/cors";

// routes must be chained (not reassigned separately) for hc<AppType> to infer them
export const app = new Hono()
  .use(cors({ origin: corsOrigin() }))
  .get("/health", (c) => c.json({ status: "ok" }));

export type AppType = typeof app;
