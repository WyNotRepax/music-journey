import { XMLParser } from "fast-xml-parser";

export class LastFmApi {
  constructor(
    private apiKey: string,
    private url: string = "http://ws.audioscrobbler.com/2.0",
  ) {
  }

  public async request<R extends Resource, A extends Action<R>>(
    endpoint: Method<R, A>,
    params: LastFmParams<R, A>,
  ): Promise<ApiResponse<R, A>> {
    const url = new URL(this.url);
    for (
      const [key, value] of Object.entries(params as Record<string, string>)
    ) {
      url.searchParams.append(key, value);
    }
    url.searchParams.append("method", endpoint);
    url.searchParams.append("api_key", this.apiKey);

    const response = await fetch(url);
    const responseText = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false });
    const responseData = parser.parse(responseText) as ApiResponse<R, A>;
    console.log(responseData);
    return responseData;
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
      user?: string;
    };
    getRecentTracks: {
      user?: string;
      page?: number;
    };
  };
};

type ApiResponse<R extends Resource, A extends Action<R>> = {
  lfm: ApiErrorResponse | ApiSuccessResponse<R, A>;
};

type ApiErrorResponse = {
  error: string;
};

type ApiSuccessResponse<R extends Resource, A extends Action<R>> =
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
          },
          date?: {
            "@_uts": string;
            "#text": string;
          }
        }>;
      } & Pagination;
    };
  };
};

type Pagination = {
  "@_page": string;
  "@_perPage": string;
  "@_totalPages": string;
};
