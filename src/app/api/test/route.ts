const BASE_URL = "https://ws.audioscrobbler.com/2.0/";
const PATH = `${BASE_URL}?method=artist.gettopalbums&artist=Cher&api_key=${process.env.LASTFM_API_KEY}&format=json`;

export async function GET(req: Request) {
  const to = Math.floor(new Date(2026, 4).getTime() / 1000);
  console.log(to);
  // const from = new Date(2026, 4).getUTCSeconds();
  const path = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=Gnedby&api_key=${process.env.LASTFM_API_KEY}&format=json&to=${to}`;
  const response = await fetch(path);

  return response;
}
