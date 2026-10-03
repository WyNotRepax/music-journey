import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import SupabaseProvider from "./provider/Supabase.tsx";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <SupabaseProvider>
    <App />
  </SupabaseProvider>,
);
