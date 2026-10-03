import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useGraphContext } from "./Graph/GraphContext";
import { useSupabaseClient } from "../provider/Supabase";
import { DEBOUNCE_MS, fetchAll } from "./utils";
import { getAnchors } from "./Graph/util";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

type Point = { x: number; y: number };

export default function PlaysLine() {
  const { name, refreshKey, resolution, startTime, endTime } = useGraphContext();
  const supabase = useSupabaseClient();
  const table = `plays_${resolution}` as const;
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    let cancelled = false;
    const anchors = getAnchors(resolution, startTime, endTime);
    const timer = setTimeout(async () => {
      const result = await fetchAll((from, to) =>
        supabase
          .from(table)
          .select("date, count")
          .eq("user", name)
          .gte("date", anchors[0].toISOString())
          .lte("date", anchors[anchors.length - 1].toISOString())
          .order("date")
          .range(from, to)
      );
      if (cancelled) return;
      if (result.error) {
        console.error(result.error);
        return;
      }
      setPoints(
        result.data
          .filter((row) => row.date)
          .map((row) => ({
            x: new Date(row.date!).getTime(),
            y: row.count ?? 0,
          })),
      );
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [supabase, table, name, refreshKey, resolution, startTime, endTime]);

  return (
    <div className="graph-plays-line">
      <Line
        data={{
          datasets: [{
            label: "Plays",
            data: points,
            borderColor: "#d51007",
            backgroundColor: "#d51007",
            tension: 0.3,
          }],
        }}
        options={{
          animation: false,
          maintainAspectRatio: false,
          parsing: false,
          interaction: { mode: "nearest", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) =>
                  new Date(items[0].parsed.x as number).toLocaleDateString(),
              },
            },
          },
          scales: {
            // Same range as the timeline so points line up with the date ticks
            x: {
              type: "linear",
              min: startTime.getTime(),
              max: endTime.getTime(),
              display: false,
            },
            y: { min: 0, ticks: { precision: 0 } },
          },
        }}
      />
    </div>
  );
}
