import { supabaseAdmin } from "./admin-supabase-server";

export async function getUserIdFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  if (!token) return null;

  // Decode the JWT using the admin client
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return null;

  return user.id;
}
