import { apiClient } from "./client";

export async function health(): Promise<boolean> {
  console.log("Health called");
  try {
    const status = await apiClient.health.$get({});
    return status.ok;
  } catch (e) {
    throw new Error("Health check failed", { cause: e });
  }
}
