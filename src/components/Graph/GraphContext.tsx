import { createContext, useContext } from "react";
import { Resolution } from "shared/api";

export type GraphContextType = {
  name: string;
  refreshKey: number;
  resolution: Resolution;
  startTime: Date;
  endTime: Date;
};

const GraphContext = createContext<GraphContextType | null>(null);

export default function GraphContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: GraphContextType;
}) {
  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}

export function useGraphContext() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error(
      "useGraphContext must be used within a GraphContextProvider",
    );
  }
  return context;
}
