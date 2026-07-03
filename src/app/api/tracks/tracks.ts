import { Track } from "@/types/api";
import { LastFMRecentTracksResponse } from "@/types/lastfm";
import XMLParser from "@nodable/flexible-xml-parser";

const API_BASE = `https://ws.audioscrobbler.com/2.0/`;

export async function fetchTracks(params: {
  user: string;
  api_key: string;
}): Promise<Track[]> {
  const { user, api_key } = params;
  const url = new URL(API_BASE);
  url.searchParams.set("method", "user.getrecenttracks");
  url.searchParams.set("api_key", api_key);
  url.searchParams.set("format", "xml");
  url.searchParams.set("limit", String(200));
  url.searchParams.set("user", user);

  const parser = new XMLParser({
    skip: {
      declaration: true,
      comment: true,
      cdata: true,
      attributes: false,
    },
  });

  const tracks: Track[] = [];

  for (let page = 1; ; page++) {
    url.searchParams.set("page", String(page));
    const response = await fetch(url);
    if (response.ok) {
      const responseData: LastFMRecentTracksResponse = parser.parse(
        await response.text(),
      );
      const lfmTracks = responseData.lfm.recenttracks.track ?? [];
      const pageTracks: Track[] = lfmTracks
        .filter((track) => track.date)
        .map((track) => ({
          name: track.name,
          artist: track.artist["#text"],
          album: track.album["#text"],
          date: track.date!["@_uts"] ?? Math.floor(Date.now() / 1000),
        }));
      tracks.push(...pageTracks);
      const totalPages = parseInt(
        responseData.lfm.recenttracks["@_totalPages"],
      );
      if (page >= totalPages) {
        break;
      }
    } else {
      const errorData: unknown = parser.parse(await response.text());
      console.error("LastFM API Error:", errorData);
      throw new Error("LastFM API Error", { cause: errorData });
    }
  }

  return tracks;
}
