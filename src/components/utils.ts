import { useEffect, useState } from "react";
import { useSupabaseClient } from "../provider/Supabase";
import { useGraphContext } from "./Graph/GraphContext";
import { getAnchors } from "./Graph/util";

export type TagData = Record<string, Record<string, number>>;

export const TOP_PER_BUCKET = 5;
export const DEBOUNCE_MS = 300;
const PAGE_SIZE = 1000;

// Supabase caps each response at 1000 rows, so page until a short page comes back
export async function fetchAll<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<{ data: T[]; error: unknown }> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await fetchPage(from, from + PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) return { data: rows, error: null };
  }
}

// Every tag that is in the top N of at least one bucket
export function getTopTags(tagData: TagData): string[] {
  const tags = new Set<string>();
  for (const bucket of Object.values(tagData)) {
    Object.entries(bucket)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_PER_BUCKET)
      .forEach(([tag]) => tags.add(tag));
  }
  return [...tags].sort();
}

export function tagColor(tag: string) {
  let hash = 0;
  for (const ch of tag) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360}, 65%, 55%)`;
}

export function useTagData() {
  const { name, refreshKey, resolution, startTime, endTime } = useGraphContext();
  const supabase = useSupabaseClient();
  const table = `play_tags_${resolution}` as const;
  const [tagData, setTagData] = useState<TagData>({});

  useEffect(() => {
    let cancelled = false;
    const anchors = getAnchors(resolution, startTime, endTime);
    const timer = setTimeout(async () => {
      const data = await fetchAll((from, to) =>
        supabase
          .from(table)
          .select("tag, date, count")
          .eq("user", name)
          .gte("date", anchors[0].toISOString())
          .lte("date", anchors[anchors.length - 1].toISOString())
          .order("date")
          .order("tag")
          .range(from, to)
      );
      if (cancelled) return;
      if (data.error) {
        console.error(data.error);
        return;
      }
      const result: TagData = {};
      for (const row of data.data) {
        if (!row.tag || !row.date) continue;
        const key = new Date(row.date).toISOString();
        result[key] ??= {};
        result[key][row.tag] = row.count ?? 0;
      }
      setTagData(result);
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [supabase, table, name, refreshKey, resolution, startTime, endTime]);

  return tagData;
}
