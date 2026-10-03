import { useGraphContext } from "./Graph/GraphContext";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getTopTags, tagColor, useTagData } from "./utils";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

export default function TagLines({}: {}) {
  const { startTime, endTime } = useGraphContext();
  const tagData = useTagData();

  const topTags = getTopTags(tagData);

  const dates = Object.keys(tagData).sort();

  return (
    <div className="graph-tag-lines">
      <Line
        data={{
          datasets: topTags.map((tag) => ({
            label: tag,
            data: dates.map((date) => ({
              x: new Date(date).getTime(),
              y: tagData[date][tag] ?? 0,
            })),
            borderColor: tagColor(tag),
            backgroundColor: tagColor(tag),
            tension: 0.3,
          })),
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
