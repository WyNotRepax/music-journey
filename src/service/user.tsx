import { UserInfo, GetUserResponse } from "shared/User.ts";

const API_URL = new URL(import.meta.env.VITE_API_URL);

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
