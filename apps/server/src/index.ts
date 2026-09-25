import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { port } from "./config/port.js";

serve({ fetch: app.fetch, port: port() }, (info) => {
  console.log(`Server listening on http://localhost:${info.port}`);
});
