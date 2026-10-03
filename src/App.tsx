import { useEffect, useState, type FormEvent } from "react";
import Graph from "./components/Graph/Graph";
import NameInput from "./components/NameInput";
import { getUserInfo, refreshUser } from "./service/user";

export function App() {
  const [name, setName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [loadingLastRefreshed, setLoadingLastRefreshed] = useState(false);
  const [lastRefreshedError, setLastRefreshedError] = useState(false);

  useEffect(() => {
    const selectedName = name.trim();
    let cancelled = false;

    setLastRefreshed(null);
    setLastRefreshedError(false);
    if (!selectedName) {
      setLoadingLastRefreshed(false);
      return () => {
        cancelled = true;
      };
    }

    setLoadingLastRefreshed(true);
    getUserInfo(selectedName)
      .then((userInfo) => {
        if (!cancelled) {
          setLastRefreshed(userInfo?.lastRefreshed ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setLastRefreshedError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingLastRefreshed(false);
      });

    return () => {
      cancelled = true;
    };
  }, [name, refreshKey]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requestedName = name.trim();
    if (!requestedName || refreshing) return;

    setError("");
    setRefreshing(true);
    try {
      await refreshUser(requestedName);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main>
      <form className="graph-controls" onSubmit={onSubmit}>
        <label htmlFor="lastfm-name">Last.fm username</label>
        <NameInput name={name} onNameChanged={setName} />
        <button type="submit" disabled={!name.trim() || refreshing}>
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </form>
      {error && <p className="graph-error" role="alert">{error}</p>}
      <p aria-live="polite">
        Last refreshed: {!name.trim()
          ? "Select a username"
          : loadingLastRefreshed
          ? "Loading..."
          : lastRefreshedError
          ? "Unavailable"
          : lastRefreshed
          ? new Date(lastRefreshed).toLocaleString()
          : "Never"}
      </p>
      <Graph name={name} refreshKey={refreshKey} />
    </main>
  );
}
