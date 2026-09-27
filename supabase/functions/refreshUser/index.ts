import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import type { Database } from "@db-types";
import * as zod from "zod";
import {
  type GetUserResponse,
  RefreshUserRequest,
  type RefreshUserResponse,
  type UserInfo,
} from "shared/User.ts";
import { LastFmApi } from "lastfm/api.ts";

export default {
  fetch: withSupabase<Database>({ auth: "none" }, async (req, ctx) => {
    try {
      const result = RefreshUserRequest.safeParse(
        Object.fromEntries(new URL(req.url).searchParams.entries()),
      );
      if (!result.success) {
        const response: RefreshUserResponse = {
          error: zod.treeifyError(result.error),
        };
        return Response.json(response, { status: 400 });
      }
      const { name: requestName } = result.data;

      const client = ctx.supabase;
      const data = await client.from("users")
        .select("user, last_refreshed").eq("user", requestName)
        .maybeSingle();

      if (data.error) {
        const response: RefreshUserResponse = {
          error: data.error,
        };
        return Response.json(response, { status: 500 });
      }

      const { error: updateError } = await client.from("users").update({
        last_refreshed: new Date().toISOString(),
      }).eq("user", requestName);
      if (updateError) {
        const response: RefreshUserResponse = {
          error: updateError,
        };
        return Response.json(response, { status: 500 });
      }

      const userData = data.data;
      if (userData === null) {
        const response: RefreshUserResponse = {
          error: `User ${requestName} not found`,
        };
        return Response.json(response, { status: 404 });
      }
      const lastFmClient = createLastFmClient();

      let currentPage = 1;
      let pageCount;
      do {
        await sleep(1000);
        const pageResponse = await lastFmClient.request(
          "user.getRecentTracks",
          {
            user: userData.user,
            page: currentPage,
          },
        );
        if (pageResponse.lfm.error !== undefined) {
          const response: RefreshUserResponse = {
            error: pageResponse.lfm.error,
          };
          return Response.json(response, { status: 500 });
        }
        const tracks = pageResponse.lfm.recenttracks.track;

        pageCount = Number(pageResponse.lfm.recenttracks["@_totalPages"]);
        currentPage += 1;
      } while (false && currentPage <= pageCount);

      return Response.json({ success: true });
    } catch (e) {
      const response: RefreshUserResponse = {
        error: e instanceof Error ? e.message : String(e),
      };
      return Response.json(response, { status: 500 });
    }
  }),
};

function createLastFmClient(): LastFmApi {
  const apiKey = Deno.env.get("LASTFM_API_KEY");
  if (!apiKey) {
    throw new Error("LASTFM_API_KEY not configured");
  }
  return new LastFmApi(apiKey);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
