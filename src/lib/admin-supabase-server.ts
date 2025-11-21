//src/lib/admin-supabase-server.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // full DB access
  {
    auth: { persistSession: false },            // ✔ required for server
  }
);
