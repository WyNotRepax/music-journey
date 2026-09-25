import { readEnv } from "./util";

export function port() {
  return readEnv("PORT", (value) => {
    const port = Number(value);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(`PORT must be configured with a valid port number got ${value}`);
    }
    return port;
  });
}
