export type LastFMRecentTracksResponse = {
  lfm: {
    recenttracks: {
      track?: LastFMRecentTrack[];
      "@_totalPages": string;
    };
  };
};

export type LastFMRecentTrack = {
  artist: {
    "#text": string;
  };
  name: string;
  date?: { "@_uts": number };
  album: {
    "#text": string;
  };
};
