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

export const RefreshUserRequest = z.object({
  name: z.string(),
  full: z.stringbool().optional()
});
export type RefreshUserRequest = z.infer<typeof RefreshUserRequest>;

export type RefreshUserResponse = ApiResponse<{ ok: true }>;
