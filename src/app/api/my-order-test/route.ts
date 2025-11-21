// src/app/api/my-orders-test/route.ts
import { NextResponse } from "next/server";
import {supabaseAdmin} from "@/lib/admin-supabase-server";

export async function GET() {
//   const TEST_USER_ID = "f588686c-f86a-4913-8ced-9a934fe863f9";

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    // .eq("user_id", TEST_USER_ID);

  if (error) {
    console.error("Test error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
