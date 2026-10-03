import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as zod from "zod";
import {
  GetUserRequest,
  type GetUserResponse,
  type UserInfo,
} from "shared/User.ts";
import { LastFmApi } from "lastfm/api.ts";
import { Database } from "shared/Database.ts";

export default {
  fetch: withSupabase<Database>({ auth: "none" }, async (req, ctx) => {
    try {
      const result = GetUserRequest.safeParse(
        Object.fromEntries(new URL(req.url).searchParams.entries()),
      );
      if (!result.success) {
        const response: GetUserResponse = {
          error: zod.treeifyError(result.error),
        };
        return Response.json(response, { status: 400 });
      }
      const { name: requestName } = result.data;

      const data = await ctx.supabase.from("users")
        .select("user, last_refreshed, url").eq("user", requestName)
        .maybeSingle();
      if (data.error) {
        const response: GetUserResponse = {
          error: data.error,
        };
        return Response.json(response, { status: 500 });
      }
      let userData = data.data;
      if (userData === null) {
        const apiKey = Deno.env.get("LASTFM_API_KEY");
        if (!apiKey) {
          throw new Error("LASTFM_API_KEY not configured");
        }
        const lfmClient = new LastFmApi(apiKey);
        const res = await lfmClient.request("user.getInfo", {
          user: requestName,
        });
        if (res.lfm.error !== undefined) {
          const response: GetUserResponse = {
            error: res.lfm.error,
          };
          return Response.json(response, { status: 404 });
        }
        const userInfo = res.lfm.user;

        const insertData = await ctx.supabaseAdmin.from("users").insert({
          user: userInfo.name,
          url: userInfo.url,
        }).select().single();
        if (insertData.error) {
          const response: GetUserResponse = {
            error: insertData.error,
          };
          return Response.json(response, { status: 500 });
        }

        userData = insertData.data;
      }

     
      const name = userData.user;
      const url = userData.url;

      const response: GetUserResponse = {
        data: {
          name,
          lastRefreshed: userData.last_refreshed,
          url,
        } as UserInfo,
      };

      return Response.json(
        response,
      );
    } catch (e) {
      const response: GetUserResponse = {
        error: e instanceof Error ? e.message : String(e),
      };
      return Response.json(response, { status: 500 });
    }
  }),
};
