// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // process.env.SUPABASE_SERVICE_ROLE_KEY!,        // NEVER expose in frontend
  // { auth: { persistSession: false } }

)

export default supabase
