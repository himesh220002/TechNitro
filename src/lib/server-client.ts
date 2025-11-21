import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createSupabaseClient = () => {
  return createRouteHandlerClient({
    cookies, // just pass the function
  });
};
