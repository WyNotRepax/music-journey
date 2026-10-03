import { CSSProperties } from "react";
import { useGraphContext } from "./GraphContext";
import { calcPercent, getAnchors } from "./util";

export default function TimeMarks() {
  const { startTime, endTime, resolution } = useGraphContext();
  let dates = getAnchors(resolution, startTime, endTime);

  return (
    <div className="graph-time-axis" aria-label="Timeline dates">
      {dates.map((date) => (
        <TimeMark key={date.toISOString()} date={date} />
      ))}
    </div>
  );
}

function TimeMark({ date }: { date: Date }) {
  const { startTime, endTime } = useGraphContext();
  const style: CSSProperties = {
    position: "absolute",
    top: 0,
    left: `${calcPercent(date, startTime, endTime)}%`,
    width: "max-content",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transform: "translateX(-50%)",
  };
  return (
    <div style={style}>
      <span>{date.toLocaleDateString()}</span>
      <span className="graph-time-tick" />
    </div>
  );
}
