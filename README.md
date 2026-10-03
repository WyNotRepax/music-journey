# Music Journey

Music Journey is a web app developed by [Benno Steinkamp](mailto:benno.steinkamp@study.hs-duesseldorf.de) that allows users to explore their music listening history based on [Last.fm](https://www.last.fm/home) statistics. It can be tried out at https://wynotrepax.github.io/music-journey/.



## Technologies Used

Music Journey uses [Deno](https://deno.com/) as a package manager and for build orchestration. Deno is also used to execute the edge functions. The web client is based on [React](https://react.dev/) and is built using [Vite](https://vite.dev/). The charts are rendered using the [Chart.js](https://www.chartjs.org/) library with `react-chartjs-2` for React compatibility.

The app uses [Supabase](https://supabase.com/) for its database and edge function hosting. The database itself is a [PostgreSQL](https://www.postgresql.org/) database.

The demo is hosted on [GitHub Pages](https://docs.github.com/de/pages).

## Development setup
### Prerequisites
* [Deno](https://deno.com/)
  * To execute and install dependencies
* [Docker](https://www.docker.com/)
  * To host supabase images for development

### Setup environment

1. Install the dependencies using Deno:
    ```sh
    deno install
    ```

2. Create a `.env.local` file in the `supabase/functions` directory and add a Last.fm API key for development.

    ```
    LASTFM_API_KEY=<<Your Api key here>>
    ```

3. Start the Supabase development containers:
    ```sh
    deno task supabase start
    ```

4. Update the Supabase URL and public key in the root `.env.local` file. You can find these values in the dashboard of the local Supabase Studio; its port should have been listed in the previous command's output. Alternatively, look for a running Docker container named `supabase_studio_music-journey`.
    > [!TIP]
    > The default port for the supabase instance is `54323`. The values can therefore be found at `http://localhost:54323/project/default`

5. Start the Vite development server:
    ```sh
    deno task dev-client
    ```

## Project Structure
* `.vscode`
  * Contains Visual Studio Code settings
* `docs`
  * Additional documentation and images used in this README
* `lastfm`
  * Partial Last.fm API client; only the methods needed for this project are implemented
* `scripts`
  * Scripts used during development
  * Includes a script for loading initial data; see Limitations for more information
* `shared`
  * Shared code that is used by both the client and the edge functions
* `src`
  * The source code for the client
* `supabase`
  * Supabase configuration and resources
* `supabase/functions`
  * The edge functions for data fetching
* `supabase/migrations`
  * Database migrations
* `supabase/snippets`
  * Database snippets
* `.env.local`
  * `.env` file containing environment variables used during development
* `deno.json`
  * Root deno configuration
* `README.md`
  * This README
* `tsconfig.json`
  * TypeScript configuration for the client
* `vite.config.ts`
  * Vite configuration

## Project Architecture

Since Last.fm does not allow [CORS](https://de.wikipedia.org/wiki/Cross-Origin_Resource_Sharing), and exposing your Last.fm API key is a bad idea, edge functions are needed to request data from the Last.fm API. The database is also read-only for the public. This is acceptable because the only data exposed is already public through the Last.fm API. All write operations are handled by the edge functions.

![alt text](docs/architecture.drawio.svg)

## Limitations
This project has some known limitations. Potential fixes are included where I could think of them.

### Last.fm rate limit
Last.fm does not provide strict rate limits for its APIs. However, its [terms of service](https://www.last.fm/api/tos#4.4) state that rate limits are enforced. To be cautious, this application uses a fairly conservative rate of one request per second. This is not a problem when requesting a specific user's plays, since they are paginated in batches of 50, allowing about 3,000 plays to be fetched within a minute. The problem is initially fetching tags for artists and tracks. At the time of writing, the user used to test this application, 'Gnedby', has 4,250 scrobbles, or plays, from 842 artists. The application needs to fetch tags the first time it encounters each artist and track, and the Last.fm API does not provide an API for doing so in bulk. As a result, an edge function call can take a very long time and eventually time out. This is mitigated by the fact that an individual user's plays are not fully refreshed on every call; instead, refreshing stops when previously fetched plays are encountered. Similarly, tags are fetched only for artists and tracks whose tags have not already been retrieved. Repeating the refresh call will therefore eventually complete. Listening behavior can be assumed to broadly follow the [Pareto principle](https://en.wikipedia.org/wiki/Pareto_principle), meaning that most plays will come from a small fraction of all artists and tracks. This problem will become less noticeable as the application runs longer.

A second limitation is that the rate limit is currently enforced only on a per-request basis. This means it is possible to exhaust the Last.fm rate limit by requesting a user refresh multiple times.

### Time Zones
Currently, the database assumes the `Europe/Berlin` time zone when bucketing data. This means each play is bucketed by day, week, or month in that time zone. Since the client uses the user's local time zone for processing, the site may not work correctly if the user's time zone is not `Europe/Berlin`. To fix this, the database would need to know the user's time zone. This could be done by inserting a row containing the time zone for the current session and joining it to the view. This was not implemented due to time constraints.

### Album Tags
Currently, only tags on tracks and albums are used to generate the top tags reports. Tags on albums could also be used. This was not implemented due to time constraints.

## AI Usage Disclosure

During development, [GitHub Copilot](https://github.com/features/copilot?locale=de-de) was used to generate some code. The [inline suggestions](https://code.visualstudio.com/docs/editing/ai-powered-suggestions) were mainly used to speed up development. Copilot was also used to isolate and fix bugs. All documentation was written without the use of generative AI.