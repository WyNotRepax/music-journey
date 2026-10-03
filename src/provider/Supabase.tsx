import { createClient } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
import { Database } from "shared/Database.ts";

let client = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const SupabaseContext = createContext(client);

export function useSupabaseClient() {
  return useContext(SupabaseContext);
}

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}
