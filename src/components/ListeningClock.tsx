import type { Resolution } from "shared/api.ts";
import { useSupabaseClient } from "../provider/Supabase";
import { useGraphContext } from "./Graph/GraphContext";
import { useEffect, useState } from "react";
import { calcPercent, getAnchors } from "./Graph/util";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { DEBOUNCE_MS, fetchAll } from "./utils";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

type ClockData = Record<string, Record<number, number>>;

export default function ListeningClocks({}: {}) {
  const { name, refreshKey, resolution, startTime, endTime } = useGraphContext();
  const supabase = useSupabaseClient();
  const table = `listening_clock_${resolution}` as const;

  const [clocks, setClocks] = useState<ClockData>({});
  const anchors = getAnchors(resolution, startTime, endTime);
  const maxCount = Math.max(
    1,
    ...Object.values(clocks).flatMap((hours) => Object.values(hours)),
  );

  useEffect(() => {
    let cancelled = false;
    const range = getAnchors(resolution, startTime, endTime);
    const timer = setTimeout(async () => {
      let data = await fetchAll((from, to) =>
        supabase
          .from(table)
          .select("hour, date, count")
          .eq("user", name)
          .gte("date", range[0].toISOString())
          .lte("date", range[range.length - 1].toISOString())
          .order("date")
          .order("hour")
          .range(from, to),
      );
      if (cancelled) return;
      if (data.error) {
        console.error(data.error);
        return;
      }
      console.log(data.data);
      let clocks: ClockData = {};
      for (let row of data.data) {
        let date = new Date(row.date!);
        let key = date.toISOString();
        if (clocks[key] === undefined) {
          clocks[key] = {};
        }
        clocks[key][Number(row.hour)] = row.count;
      }
      console.log(clocks);
      setClocks(clocks);
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [supabase, table, name, refreshKey, resolution, startTime, endTime]);
  return (
    <div className="graph-clocks">
      {anchors.map((date) => (
        <ListeningClock
          key={date.toISOString()}
          date={date}
          clockData={clocks[date.toISOString()] ?? {}}
          maxCount={maxCount}
        />
      ))}
    </div>
  );
}

const CLOCK_SIZE = 160;
const HOURS = 24;
const HOUR_LABELS = Array.from({ length: HOURS }, (_, hour) =>
  hour % 6 === 0 ? String(hour) : "",
);

function ListeningClock({
  date,
  clockData,
  maxCount,
}: {
  date: Date;
  clockData: Record<number, number>;
  maxCount: number;
}) {
  const { startTime, endTime } = useGraphContext();
  const counts: number[] = [];
  for (let hour = 0; hour < HOURS; hour++) {
    counts.push(clockData[hour] ?? 0);
  }

  const style = {
    position: "absolute" as const,
    top: 0,
    left: `${calcPercent(date, startTime, endTime)}%`,
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    transform: "translateX(-50%)",
  };

  return (
    <div style={style}>
      <Radar
        width={"100%"}
        height={"100%"}
        data={{
          labels: HOUR_LABELS,
          datasets: [
            {
              data: counts,
              backgroundColor: "rgba(74, 144, 217, 0.4)",
              borderColor: "#4a90d9",
              pointRadius: 0,
              pointHitRadius: 10,
            },
          ],
        }}
        options={{
          animation: false,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                title: (items) => `${items[0].dataIndex}:00`,
                label: (item) => `${item.parsed.r} plays`,
              },
            },
          },
          scales: {
            r: {
              min: 0,
              // fixed max shared across all clocks, so charts stay comparable
              // and all-zero data doesn't collapse min/max to the same value
              max: maxCount,
              angleLines: { color: "#ccc" },
              grid: { color: "#eee" },
              ticks: { display: false },
              pointLabels: { font: { size: 8 } },
            },
          },
        }}
      />
    </div>
  );
}
