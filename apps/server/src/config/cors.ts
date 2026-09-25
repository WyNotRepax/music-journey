import { readEnv } from "./util";

export function cors() {
  return readEnv("CORS_ORIGIN", (value) => {
    if (!value) {
      throw new Error("CORS_ORIGIN must be configured");
    }
    return value;
  });
}
