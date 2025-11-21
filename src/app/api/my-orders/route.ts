

// src/app/api/my-orders/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/admin-supabase-server"

export async function GET(req: Request) {
  try {
    // Read Authorization Bearer token
    const authHeader = req.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null

    if (!token) {
      return NextResponse.json([], { status: 200 })
    }

    // Get user from token
    const userRes = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      }
    )

    if (!userRes.ok) return NextResponse.json([], { status: 200 })

    const user = await userRes.json()
    const userId = user.id

    console.log("Resolved UID:", userId)

    // Fetch only user's orders
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error("Fatal my-orders error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
