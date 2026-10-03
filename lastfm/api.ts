import { XMLParser } from "fast-xml-parser";

export const LastFmErrorCode = {
  "2": "Invalid service - This service does not exist",
  "3": "Invalid Method - No method with that name in this package",
  "4":
    "Authentication Failed - You do not have permissions to access the service",
  "5": "Invalid format - This service doesn't exist in that format",
  "6": "Invalid parameters - Your request is missing a required parameter",
  "7": "Invalid resource specified",
  "8": "Operation failed - Something else went wrong",
  "9": "Invalid session key - Please re-authenticate",
  "10": "Invalid API key - You must be granted a valid key by last.fm",
  "11":
    "Service Offline - This service is temporarily offline. Try again later.",
  "13": "Invalid method signature supplied",
  "16": "There was a temporary error processing your request. Please try again",
  "26":
    "Suspended API key - Access for your account has been suspended, please contact Last.fm",
  "29":
    "Rate limit exceeded - Your IP has made too many requests in a short period",
};

export type LastFmErrorCode = keyof typeof LastFmErrorCode;

export class LastFmApi {
  private minDelay: number = 1000;
  private lastRequestTime: number = -Infinity;
  /** List of LastFm error codes that should trigger a retry */
  public retry: LastFmErrorCode[] = ["8"];
  public retryCount: number = 3;
  public currRetryCount: number = 0;

  constructor(
    private apiKey: string,
    private url: string = "http://ws.audioscrobbler.com/2.0",
    private user_agent: string = "MusicJourney/1.0",
  ) {
  }

  public async request<R extends Resource, A extends Action<R>>(
    endpoint: Method<R, A>,
    params: LastFmParams<R, A>,
  ): Promise<ApiResponse<R, A>> {
    await this.rateLimit();
    const url = new URL(this.url);
    for (
      const [key, value] of Object.entries(params as Record<string, string>)
    ) {
      url.searchParams.append(key, value);
    }
    url.searchParams.append("method", endpoint);
    url.searchParams.append("api_key", this.apiKey);
    console.log("LastFM API Request", "method", endpoint, "params", params);
    const response = await fetch(url, {
      headers: {
        "User-Agent": this.user_agent,
      },
    });
    const responseText = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const responseData = parser.parse(responseText) as ApiResponse<R, A>;
    if (responseData.lfm.error !== undefined) {
      if (
        this.retry.includes(responseData.lfm.error["@_code"] as LastFmErrorCode)
      ) {
        if (this.currRetryCount < this.retryCount) {
          console.warn(
            `Retrying LastFm API request due to error code ${
              responseData.lfm.error["@_code"]
            }: ${responseData.lfm.error["#text"]}`,
          );
          this.currRetryCount++;
          return this.request(endpoint, params);
        }
      }
    }

    return responseData;
  }

  private async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minDelay - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }
}

type Method<R extends Resource = Resource, A extends Action<R> = Action<R>> =
  A extends string ? `${R}.${A}`
    : never;

type Resource = keyof PARAMS & keyof RESPONSE & keyof RESPONSE;
type Action<R extends Resource> =
  & keyof PARAMS[R]
  & keyof RESPONSE[R];

type LastFmParams<R extends Resource, A extends Action<R>> = PARAMS[R][A];

type PARAMS = {
  user: {
    getInfo: {
      user: string;
    };
    getRecentTracks: {
      user: string;
      page?: number;
    };
  };
  artist: {
    getInfo: {
      artist: string;
    };
    getTopTags: {
      artist: string;
    };
  };
  track: {
    getTopTags: {
      track: string;
      artist: string;
    };
  };
};

export type ApiResponse<R extends Resource, A extends Action<R>> = {
  lfm: ApiErrorResponse | ApiSuccessResponse<R, A>;
};

export type ApiErrorResponse = {
  error: {
    "#text": string;
    "@_code": string;
  };
};

export type ApiSuccessResponse<R extends Resource, A extends Action<R>> =
  & RESPONSE[R][A]
  & { error?: never };

type RESPONSE = {
  user: {
    getInfo: {
      user: {
        name: string;
        url: string;
      };
    };
    getRecentTracks: {
      recenttracks: {
        track: Array<{
          name: string;
          album: {
            "#text": string;
          };
          date?: {
            "@_uts": string;
            "#text": string;
          };
          artist: {
            "#text": string;
          };
        }>;
      } & Pagination;
    };
  };
  artist: {
    getInfo: {
      artist: { name: string; url: string };
    };
    getTopTags: {
      toptags: {
        tag?: Array<Tag> | Tag;
      };
    };
  };
  track: {
    getTopTags: {
      toptags: {
        tag?: Array<Tag> | Tag;
      };
    };
  }
};

type Tag = {
  name: string;
  url: string;
  count: number;
};

type Pagination = {
  "@_page": string;
  "@_perPage": string;
  "@_totalPages": string;
};
