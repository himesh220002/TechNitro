// src/app/api/update-order-status/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

type ProductInOrder = {
  id: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    // 1️⃣ Fetch order
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = order.paymentStatus;
    const products: ProductInOrder[] = order.products ?? [];

    // ❗ IMPORTANT FIX: correct property names:
    // order.paymentStatus  (NOT payment_status)
    // order.shippingEvents (NOT shipping_events)

    // 2️⃣ Restore inventory on cancellation (before shipped)
    if (
      status === "Cancelled" &&
      ["Order Placed", "Order Confirmed", "Packed"].includes(previousStatus)
    ) {
      for (const item of products) {
        await supabaseAdmin.rpc("increment_inventory", {
          product_id: item.id,
          qty: item.quantity,
        });
      }
    }

    // 3️⃣ Deduct inventory on "Order Placed" only once
    if (
      status === "Order Placed" &&
      !["Cancelled", "Returned"].includes(previousStatus)
    ) {
      for (const item of products) {
        await supabaseAdmin.rpc("decrement_inventory", {
          product_id: item.id,
          qty: item.quantity,
        });
      }
    }

    // 4️⃣ Update order status
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({ paymentStatus: status })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update order", details: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
