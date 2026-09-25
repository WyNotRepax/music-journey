import { hc } from "hono/client";
import type { AppType } from "server";

const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const apiClient = hc<AppType>(baseUrl);
