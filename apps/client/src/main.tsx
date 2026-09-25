import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "react-error-boundary";
import DisplayError from "./components/DisplayError.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary
      fallbackRender={({ error }) => <DisplayError error={error} />}
      onError={(error, info) => {
        console.error("An Error occurred", error, info);
      }}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
