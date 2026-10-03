import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import * as zod from "zod";
import { RefreshUserRequest, type RefreshUserResponse } from "shared/User.ts";
import { ApiSuccessResponse, LastFmApi } from "lastfm/api.ts";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Database } from "shared/Database.ts";

export default {
  fetch: withSupabase<Database>({ auth: "none" }, async (req, ctx) => {
    try {
      // Parse and validate the incoming request using Zod
      const result = RefreshUserRequest.safeParse(
        Object.fromEntries(new URL(req.url).searchParams.entries()),
      );
      if (!result.success) {
        const response: RefreshUserResponse = {
          error: zod.treeifyError(result.error),
        };
        return Response.json(response, { status: 400 });
      }
      const { name: requestName, full: requestFull } = result.data;

      // Fetch the user from the database
      const data = await ctx.supabase.from("users")
        .select("user, last_refreshed").eq("user", requestName)
        .maybeSingle();
      if (data.error) {
        const response: RefreshUserResponse = {
          error: data.error,
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

      // Update the last_refreshed timestamp for the user
      unwrapPostgrest(
        await ctx.supabaseAdmin.from("users")
          .update({
            last_refreshed: new Date().toISOString(),
          }).eq("user", requestName),
        `Failed to update last_refreshed for user ${requestName}`,
      );

      const lastFmClient = createLastFmClient();

      let currentPage = 1;
      let pageCount;
      let finalPageToFetch = false;

      do {
        const page = await fetchRecentTracks(
          lastFmClient,
          requestName,
          currentPage,
        );
        const artistsToUpsert = Array.from(
          new Set(
            page.recenttracks.track.map((track) => track.artist["#text"]),
          ),
        ).map((artist) => ({ name: artist }));

        unwrapPostgrest(
          await ctx.supabaseAdmin.from("artists").upsert(
            artistsToUpsert,
          ),
          `Failed to upsert artists for user ${requestName}`,
        );

        let tracksToUpsert = page.recenttracks.track.map((track) => ({
          name: track.name,
          artist: track.artist["#text"],
          album: track.album["#text"],
        }));
        // Remove duplicate tracks based on name, artist, and album
        tracksToUpsert = tracksToUpsert.filter((track, i, self) =>
          i === self.findIndex((t) => (
            t.name === track.name && t.artist === track.artist
          ))
        );
        console.log("Tracks to upsert:", tracksToUpsert);
        unwrapPostgrest(
          await ctx.supabaseAdmin.from("tracks").upsert(
            tracksToUpsert,
          ),
          `Failed to upsert tracks for user ${requestName}`,
        );

        const playsToUpsert = page.recenttracks.track.filter((track) =>
          track.date !== undefined
        ).map((track) => {
          const name = track.name;
          const artist = track.artist["#text"];

          const utcTimestamp = Number(track.date!["@_uts"]);
          const dateObj = new Date(utcTimestamp * 1000);
          const date = dateObj.toISOString();

          const user = requestName;

          return {
            name,
            artist,
            date,
            user,
          };
        });

        finalPageToFetch = false;
        if (!requestFull) {
          const lastPlay = playsToUpsert.findLast(() => true);
          if (lastPlay) {
            const existingLastPlay = unwrapPostgrest(
              await ctx.supabase.from("plays").select(
                "*",
              )
                .eq("user", lastPlay.user).eq("name", lastPlay.name).eq(
                  "artist",
                  lastPlay.artist,
                ).eq("date", lastPlay.date).maybeSingle(),
              `Failed to query existing last play for user ${requestName}`,
            );
            if (existingLastPlay.data) {
              finalPageToFetch = true;
            }
          }
        }

        unwrapPostgrest(
          await ctx.supabaseAdmin.from("plays").upsert(
            playsToUpsert,
          ),
          `Failed to upsert plays for user ${requestName}`,
        );

        pageCount = Number(page.recenttracks["@_totalPages"]);
        currentPage += 1;
      } while (currentPage <= pageCount && !finalPageToFetch);

      // Fetch and upsert tags for artists that haven't had their tags fetched yet
      const artistsToFetchTagsForQuery = unwrapPostgrest(
        await ctx.supabaseAdmin.from("artists")
          .select(
            "name",
          ).eq("tags_fetched", false),
        `Failed to fetch artists to fetch tags for`,
      );
      console.log(
        `Fetching tags for ${artistsToFetchTagsForQuery.data.length} artists`,
      );
      for (const { name: artistName } of artistsToFetchTagsForQuery.data) {
        const tagsRaw = await fetchArtistTags(lastFmClient, artistName);

        if (tagsRaw.toptags.tag !== undefined) {
          let tags = tagsRaw.toptags.tag;
          if (!Array.isArray(tags)) {
            tags = [tags];
          }

          const tagsToUpsert = Object.values(
            Object.fromEntries(tags.map((tag) => [tag.name, {
              name: tag.name,
              url: tag.url,
            }])),
          );
          unwrapPostgrest(
            await ctx.supabaseAdmin.from("tags").upsert(
              tagsToUpsert,
            ),
            `Failed to upsert tags for artist ${artistName}`,
          );
          const artistTagsToUpsert = Object.values(
            Object.fromEntries(tags.map((tag) => [`${tag.name}_${artistName}`, {
              artist: artistName,
              tag: tag.name,
              count: tag.count,
            }])),
          );
          unwrapPostgrest(
            await ctx.supabaseAdmin.from("artist_tags")
              .upsert(
                artistTagsToUpsert,
              ),
            `Failed to upsert artist tags for artist ${artistName}`,
          );
        } else {
          console.log(`No tags found for artist ${artistName}`);
        }
        unwrapPostgrest(
          await ctx.supabaseAdmin.from("artists").update({
            tags_fetched: true,
          }).eq("name", artistName),
          `Failed to update tags_fetched for artist ${artistName}`,
        );
      }

      // Fetch and upsert tags for tracks that haven't had their tags fetched yet
      const tracksToFetchTagsForQuery = unwrapPostgrest(
        await ctx.supabaseAdmin.from("tracks")
          .select(
            "name, artist",
          ).eq("tags_fetched", false),
        `Failed to fetch tracks to fetch tags for`,
      );
      console.log(
        `Fetching tags for ${tracksToFetchTagsForQuery.data.length} tracks`,
      );
      for (
        const { name: trackName, artist: artistName }
          of tracksToFetchTagsForQuery.data
      ) {
        let tagsRaw = await fetchTrackTags(lastFmClient, trackName, artistName);
        if (tagsRaw.toptags.tag !== undefined) {
          let tags = tagsRaw.toptags.tag;
          if (!Array.isArray(tags)) {
            tags = [tags];
          }

          const tagsToUpsert = Object.values(
            Object.fromEntries(
              tags.map((
                tag,
              ) => [tag.name, {
                name: tag.name,
                url: tag.url,
              }]),
            ),
          );

          unwrapPostgrest(
            await ctx.supabaseAdmin.from("tags").upsert(
              tagsToUpsert,
            ),
            `Failed to upsert tags for track ${trackName}`,
          );
          const trackTagsToUpsert = tags.map((tag) => ({
            track: trackName,
            artist: artistName,
            tag: tag.name,
            count: tag.count,
          }));
          unwrapPostgrest(
            await ctx.supabaseAdmin.from("track_tags")
              .upsert(
                trackTagsToUpsert,
              ),
            `Failed to upsert track tags for track ${trackName}`,
          );
        } else {
          console.log(`No tags found for track ${trackName}`);
        }
        unwrapPostgrest(
          await ctx.supabaseAdmin.from("tracks").update({
            tags_fetched: true,
          }).eq("name", trackName).eq("artist", artistName),
          `Failed to update tags_fetched for track ${trackName}`,
        );
      }

      return Response.json({ success: true });
    } catch (e) {
      const response: RefreshUserResponse = {
        error: e instanceof Error ? e.message : String(e),
        cause: e instanceof Error ? e.cause : undefined,
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

async function fetchRecentTracks(
  lastFmClient: LastFmApi,
  user: string,
  page: number,
): Promise<ApiSuccessResponse<"user", "getRecentTracks">> {
  const pageResponse = await lastFmClient.request(
    "user.getRecentTracks",
    {
      user: user,
      page: page,
    },
  );
  if (pageResponse.lfm.error !== undefined) {
    throw new Error("Failed to fetch page from last.fm", {
      cause: pageResponse.lfm.error,
    });
  }
  return pageResponse.lfm;
}

async function fetchArtistTags(
  lastFmClient: LastFmApi,
  artist: string,
): Promise<ApiSuccessResponse<"artist", "getTopTags">> {
  const pageResponse = await lastFmClient.request("artist.getTopTags", {
    artist,
  });
  if (pageResponse.lfm.error !== undefined) {
    throw new Error(`Failed to fetch tags for ${artist}`, {
      cause: pageResponse.lfm.error,
    });
  }
  console.log("Res", pageResponse.lfm);
  return pageResponse.lfm;
}

async function fetchTrackTags(
  lastFmClient: LastFmApi,
  track: string,
  artist: string,
): Promise<ApiSuccessResponse<"track", "getTopTags">> {
  const pageResponse = await lastFmClient.request("track.getTopTags", {
    track,
    artist,
  });
  if (pageResponse.lfm.error !== undefined) {
    if (pageResponse.lfm.error["@_code"] == "6") {
      // Error code 6 is track not found this might happen for very new tracks
      console.warn(`Track not found: ${track} by ${artist}`);
      return { toptags: {} };
    }
    throw new Error(`Failed to fetch tags for track ${track}`, {
      cause: pageResponse.lfm.error,
    });
  }
  return pageResponse.lfm;
}

function unwrapPostgrest<T>(
  response: PostgrestSingleResponse<T>,
  message: string = "Postgres request failed",
) {
  if (response.error) {
    throw new Error(
      message,
      { cause: response.error },
    );
  }
  return response;
}
