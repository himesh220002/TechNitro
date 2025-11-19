// src/lib/supabase-server.ts
import { createClient } from '@supabase/supabase-js'

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,  // URL can be public
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // URL can be public
  // process.env.SUPABASE_SERVICE_ROLE_KEY! // service role key
)

export default supabaseServer
