// src/app/api/recommendations/route.ts
import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabase-server"; // service-role backend client


export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("Product")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch recommendations" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

