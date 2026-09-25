import { Hono } from "hono";
import { cors } from "hono/cors";
const corsOrigin = process.env.CORS_ORIGIN;
if (!corsOrigin) {
    throw new Error("CORS_ORIGIN must be configured");
}
// routes must be chained (not reassigned separately) for hc<AppType> to infer them
export const app = new Hono()
    .use(cors({ origin: corsOrigin }))
    .get("/health", (c) => c.json({ status: "ok" }));
