// src/app/api/orders/update-payment.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  const { orderId, paymentResult } = await req.json();

  if (!orderId || !paymentResult) {
    return NextResponse.json(
      { error: "Missing orderId or paymentResult" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("Order")
    .update({ paymentResult })
    .eq("id", orderId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

