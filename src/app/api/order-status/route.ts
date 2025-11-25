// src/app/api/order-status/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing order ID" },
        { status: 400 }
      );
    }

    // 🔥 Fetch ONLY required fields
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("paymentStatus, shippingEvents")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      paymentStatus: data.paymentStatus,
      shippingEvents: data.shippingEvents ?? [],
    });
  } catch (err) {
    console.error("❌ order-status error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
