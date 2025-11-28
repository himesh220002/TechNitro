// src/app/api/orders/update-payment/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

export async function POST(req: Request) {
  try {
    const { orderId, paymentResult , paymentid, razorpayorderid, signature } = await req.json();

    if (!orderId || !paymentResult) {
      return NextResponse.json(
        { error: "Missing orderId or paymentResult" },
        { status: 400 }
      );
    }
     const orderStatus =
      paymentResult === "success"
        ? "Order Confirmed"
        : paymentResult === "cancelled"
        ? "Cancelled"
        : "Pending";

    const { error } = await supabaseAdmin
      .from("orders")
      .update({ paymentResult,
        orderStatus,
        paymentid,          // 🔥 essential
        razorpayorderid,    // optional but helpful
        signature  
       })
      .eq("id", orderId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update payment status", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: "Server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
