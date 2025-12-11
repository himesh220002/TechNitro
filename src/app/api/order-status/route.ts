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
      .select("orderStatus, shippingEvents, tracking_link, customer_tracking_link, delivery_agent_name, delivery_agent_phone, user_id")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orderStatus: data.orderStatus,
      shippingEvents: data.shippingEvents ?? [],
      tracking_link: data.tracking_link,
      customer_tracking_link: data.customer_tracking_link,
      delivery_agent_name: data.delivery_agent_name,
      delivery_agent_phone: data.delivery_agent_phone,
      user_id: data.user_id,
    });
  } catch (err) {
    console.error("❌ order-status error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
