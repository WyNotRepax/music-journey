import { useGraphContext } from "./Graph/GraphContext";
import { calcPercent, getAnchors } from "./Graph/util";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import { TOP_PER_BUCKET, tagColor, useTagData } from "./utils";

ChartJS.register(ArcElement, Tooltip);

const PIE_SIZE = 160;

export default function TagPies({}: {}) {
  const { resolution, startTime, endTime } = useGraphContext();
  const pies = useTagData();
  const anchors = getAnchors(resolution, startTime, endTime);

  return (
    <div className="graph-tags">
      {anchors.map((date) => (
        <TagPie
          key={date.toISOString()}
          date={date}
          tagData={pies[date.toISOString()] ?? {}}
        />
      ))}
    </div>
  );
}

function TagPie({
  date,
  tagData,
}: {
  date: Date;
  tagData: Record<string, number>;
}) {
  const { startTime, endTime } = useGraphContext();
  const entries = Object.entries(tagData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_PER_BUCKET);

  const style = {
    position: "absolute" as const,
    top: 0,
    left: `${calcPercent(date, startTime, endTime)}%`,
    width: PIE_SIZE,
    height: PIE_SIZE,
    transform: "translateX(-50%)",
  };

  return (
    <div style={style}>
      <Pie
        width={"100%"}
        height={"100%"}
        data={{
          labels: entries.map(([tag]) => tag),
          datasets: [
            {
              data: entries.map(([, count]) => count),
              backgroundColor: entries.map(([tag]) => tagColor(tag)),
            },
          ],
        }}
        options={{
          animation: false,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  );
}
