import { useState } from "react";
import { useEffect } from "react";
import type { UserInfo } from "shared/User.ts";
import Data, { type DataState } from "./components/Data";
import NameInput from "./components/NameInput";
import { getUserInfo } from "./service/user";
export function App() {
  const [userName, setUserName] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  useEffect(() => {
    if (userName === "") {
      setUserInfo(null);
      setDataState("initial");
      return;
    }
    getUserInfo(userName)
      .then((value) => {
        console.log("Value", value);
        setUserInfo(value);
        setDataState(value === null ? "notfound" : "ready");
      })
      .catch(() => {
        setUserInfo(null);
        setDataState("error");
      });
  }, [userName]);

  let [dataState, setDataState] = useState<DataState>("initial");

  let lastRefresh = null;
  if (userInfo) {
    if (userInfo.lastRefreshed) {
      const lastRefreshedDate = new Date(userInfo.lastRefreshed);
      lastRefresh = `${lastRefreshedDate.toLocaleDateString()} at ${lastRefreshedDate.toLocaleTimeString()}`;
    } else {
      lastRefresh = "Never";
    }
  }

  return (
    <main>
      <NameInput onNameChanged={setUserName} />
      <p>User Info: {JSON.stringify(userInfo)}</p>
      <Data dataState={dataState} name={userName} />
      {lastRefresh && (
        <>
          <p>Last Refresh: {lastRefresh}</p>
          <button>Refresh</button>
        </>
      )}
    </main>
  );
}
