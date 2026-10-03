# Music Journey

Music Journey is a web app developed by [Benno Steinkamp](mailto:benno.steinkamp@study.hs-duesseldorf.de) that allows the User to explore their music listening history based on [last.fm](https://www.last.fm/home) stats.



## Technologies Used

Music Journey uses [Deno](https://deno.com/) as a package manager and for build orchestration. Deno is also used to execute the edge functions. The Web-client is based on [React](https://react.dev/) and is build using [Vite](https://vite.dev/). The Charts displayed are rendered using the [Chart.js](https://www.chartjs.org/) library using `react-chartjs-2` for react compatability.

The App uses [supabase](https://supabase.com/) for database and edge function hosting. The database itself is a [PostgreSQL](https://www.postgresql.org/) database.

## Project Structure
* `.vscode`
  * Contains Visual Studio Code settings
* `docs`
  * Additional documentation and images used in this README
* `lastfm`
  * Partial last.fm api client, only the methods needed for this project are implemented
* `scripts`
  * Scripts used during development
  * Specifically a script that allows loading initial data, for more information see limitations
* `shared`
  * Shared code that is used by both the client and the edge functions
* `src`
  * The source code for the client
* `supabase`
  * Supabase directory
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
  * This readme
* `tsconfig.json`
  * Typescript configuration for the client
* `vite.config.ts`
  * Vite configuration

## Project Architecture

![alt text](docs/architecture.drawio.svg)

## AI Usage Disclosure

During development [GitHub Copilot](https://github.com/features/copilot?locale=de-de) was used to generate some code. Mainly the [inline suggestions](https://code.visualstudio.com/docs/editing/ai-powered-suggestions) where used to speed up development. It was also used to isolate and fix bugs during development. All Documentation was written without the use of generative AI.