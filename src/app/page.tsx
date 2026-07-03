"use client";
import TestChart from "@/components/TestChart";
import UserInput from "@/components/UserInput";
import { DataService, DataServiceContext } from "@/service/dataService";
import { useUser } from "@/service/userService";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useUser();
  const [dataService, setDataService] = useState<DataService | null>(null);
  useEffect(() => {
    if (user) {
      const createDataService = async () => {
        setDataService(null);
        const service = await DataService.create(user);
        setDataService(service);
      };
      createDataService();
    }
  }, [user]);

  return (
    <>
      <UserInput value={user || ""} onChange={setUser} />
      {JSON.stringify(dataService?.tracks.map((track) => track.date))}
      <DataServiceContext.Provider value={dataService}>
        <TestChart />
      </DataServiceContext.Provider>
    </>
  );
}
