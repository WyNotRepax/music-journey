import { Track } from "@/types/api";
import { createContext, useContext } from "react";

export class DataService {
  public static async create(user: string): Promise<DataService> {
    const tracks = await DataService.fetchTracks(user);
    return new DataService(user, tracks);
  }

  private static async fetchTracks(user: string): Promise<Track[]> {
    const url = new URL("/api/tracks", window.location.origin);
    url.searchParams.set("user", user);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch tracks: ${res.statusText}`);
    }
    const data: Track[] = await res.json();
    return data;
  }

  private constructor(
    private user: string,
    public tracks: Track[],
  ) {}

  public static readonly Context = createContext<DataService | null>(null);
}

export const DataServiceContext = DataService.Context;

export function useDataService(): DataService | null {
  const context = useContext(DataServiceContext);
  return context;
}
