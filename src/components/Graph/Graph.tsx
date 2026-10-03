import { useEffect, useRef, useState } from "react";
import ListeningClocks from "../ListeningClock";
import TagPies from "../TagPies";
import TagLines from "../TagLines";
import PlaysLine from "../PlaysLine";
import GraphContextProvider, { GraphContextType } from "./GraphContext";
import TimeMarks from "./TimeMarks";
import "./graph.css";
import { Resolution } from "shared/api";

export default function Graph({
  name,
  refreshKey,
}: {
  name: string;
  refreshKey: number;
}) {
  let [contextValue, setContext] = useState<GraphContextType>({
    name,
    refreshKey,
    startTime: new Date("2026-08-01"),
    endTime: new Date("2026-10-01"),
    resolution: "week",
  });

  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; start: number; end: number } | null>(null);

  // Native listener so preventDefault works (React wheel handlers are passive).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const frac = rect.width ? (e.clientX - rect.left) / rect.width : 0.5;
      const factor = Math.exp(e.deltaY * 0.001);
      setContext((c) => {
        const start = c.startTime.getTime();
        const end = c.endTime.getTime();
        const range = end - start;
        const newRange = Math.min(Math.max(range * factor, WEEK), YEAR);
        const anchor = start + range * frac;
        const resolution = getResolution(newRange);
        return {
          ...c,
          startTime: new Date(anchor - newRange * frac),
          endTime: new Date(anchor + newRange * (1 - frac)),
          resolution,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      x: e.clientX,
      start: contextValue.startTime.getTime(),
      end: contextValue.endTime.getTime(),
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const width = e.currentTarget.getBoundingClientRect().width;
    if (!width) return;
    const shift = -((e.clientX - d.x) / width) * (d.end - d.start);
    setContext((c) => ({
      ...c,
      startTime: new Date(d.start + shift),
      endTime: new Date(d.end + shift),
    }));
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      className="graph"
      ref={ref}
      style={{ cursor: "grab", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <GraphContextProvider value={{ ...contextValue, name, refreshKey }}>
        <TimeMarks />
        <PlaysLine />
        <ListeningClocks />
        <TagPies />
        <TagLines />
      </GraphContextProvider>
    </div>
  );
}

export type DataState = "initial" | "loading" | "ready" | "notfound" | "error";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function getResolution(range: number): Resolution {
  if (range <= 2 * WEEK) return "day";
  if (range <= 3 * MONTH) return "week";
  return "month";
}
