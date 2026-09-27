import * as z from "zod";
import { ApiResponse } from "./api.ts";

export const GetUserRequest = z.object({
  name: z.string(),
});

export type GetUserRequest = z.infer<typeof GetUserRequest>;

export type GetUserResponse = ApiResponse<UserInfo>;

export type UserInfo = {
  name: string;
  lastRefreshed: string;
  url: string;
};

export const RefreshUserRequest = GetUserRequest;
export type RefreshUserRequest = GetUserRequest;

export type RefreshUserResponse = ApiResponse<{ ok: true }>;
