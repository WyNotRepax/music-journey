import { fetchTracks } from "./tracks";

export async function GET(req: Request) {
  const api_key = process.env.LASTFM_API_KEY;
  if (!api_key) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
    });
  }

  // Parse parameters
  const url = new URL(req.url);
  const user = url.searchParams.get("user");
  if (!user) {
    return new Response(JSON.stringify({ error: "Missing 'user' parameter" }), {
      status: 400,
    });
  }

  // Fetch recent tracks
  try {
    const data = await fetchTracks({ user, api_key });
    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error("Error fetching recent tracks:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch recent tracks",
        message: error instanceof Error ? error.message : String(error),
        cause: error instanceof Error ? error.cause : undefined,
      }),
      {
        status: 500,
      },
    );
  }
}
