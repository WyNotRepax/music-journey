import { UserInfo, GetUserResponse } from "shared/User.ts";

const API_URL = new URL(import.meta.env.VITE_SUPABASE_URL);

export async function getUserInfo(userName: string): Promise<UserInfo | null> {
  let requestUrl = new URL(API_URL);
  requestUrl.pathname = "/functions/v1/getUser";
  requestUrl.searchParams.set("name", userName);
  const response = await fetch(requestUrl);
  if (response.status === 404) {
    return null;
  }
  const data = (await response.json()) as GetUserResponse;
  if (data.error !== undefined) {
    throw new Error("Failed to get user info", { cause: data.error });
  }
  return data.data!;
}

export async function refreshUser(userName: string): Promise<void> {
  const requestUrl = new URL(API_URL);
  requestUrl.pathname = "/functions/v1/refreshUser";
  requestUrl.searchParams.set("name", userName);
  requestUrl.searchParams.set("full", "false");

  const response = await fetch(requestUrl);
  const data = (await response.json()) as { error?: unknown };
  if (!response.ok || data.error !== undefined) {
    const message = typeof data.error === "string"
      ? data.error
      : "Failed to refresh user data";
    throw new Error(message, { cause: data.error });
  }
}
