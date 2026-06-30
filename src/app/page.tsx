"use client";
import Image from "next/image";
import { useEffect, useState } from "react";



export default function Home() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      ({data ? JSON.stringify(data) : "Loading..."})
    </div>
  );
}
