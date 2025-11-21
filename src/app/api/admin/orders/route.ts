import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      console.log("❌ Missing token");
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    // Validate Supabase user
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      }
    );

    if (!userRes.ok) {
      console.log("❌ Invalid token");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await userRes.json();
    console.log("Admin validated UID:", user.id);

    // Check admin role
    if (user.user_metadata?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all orders using service-role
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("Admin orders fatal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
