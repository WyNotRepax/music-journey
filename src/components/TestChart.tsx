import { useDataService } from "@/service/dataService";
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from "recharts";

export default function TestChart() {
  const dataService = useDataService();
  if (!dataService) {
    return <>Loading...</>;
  }

  const artistCounts: Record<string, number> = {};
  for (const track of dataService.tracks) {
    if (!artistCounts[track.artist]) {
      artistCounts[track.artist] = 0;
    }
    artistCounts[track.artist]++;
  }

  let data = Object.entries(artistCounts).map(([artist, count]) => ({
    artist,
    count,
  }));

  data.sort((a, b) => b.count - a.count);
  data = data.slice(0, 10); // Keep only the top 10 artists

  return (
    <BarChart
      data={data}
      width={800}
      height={400}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey="artist" stroke="#8884d8" />
      <YAxis />
      <Bar dataKey="count" fill="#8884d8" />
      <Tooltip wrapperStyle={{ width: 100, backgroundColor: "#ccc" }} />
    </BarChart>
  );
}
