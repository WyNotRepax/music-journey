import "./DisplayError.css";

export default function DisplayError({ error }: { error: unknown }) {
  if (error instanceof Error) {
    return <div>{error.message}</div>;
  }
  return <div>Unknown error occurred</div>;
}
