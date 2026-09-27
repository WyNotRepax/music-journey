export default function Data({
  dataState,
  name,
}: {
  dataState: DataState;
  name: string;
}) {
  return (
    <div>
      <p>Data State: {dataState}</p>
      <p>Name: {name}</p>
    </div>
  );
}

export type DataState = "initial" | "loading" | "ready" | "notfound" | "error";