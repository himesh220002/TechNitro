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

    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = order.orderStatus;
    const products: ProductInOrder[] = order.products ?? [];


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

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({ orderStatus: status })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: "Failed to update order", details: updateErr.message },
        { status: 500 }
      );
    }

    // Create notification for status change
    try {
      const notificationMap: Record<string, { type: string; title: string; message: string }> = {
        'Order Confirmed': {
          type: 'order_placed',
          title: 'Order Confirmed',
          message: `Your order #${id.slice(0, 8)} has been confirmed and is being processed.`
        },
        'Packed': {
          type: 'order_placed',
          title: 'Order Packed',
          message: `Your order #${id.slice(0, 8)} has been packed and is ready for shipment.`
        },
        'Shipped': {
          type: 'shipped',
          title: 'Order Shipped',
          message: `Your order #${id.slice(0, 8)} has been shipped and is on its way!`
        },
        'Out for Delivery': {
          type: 'out_for_delivery',
          title: 'Out for Delivery',
          message: `Your order #${id.slice(0, 8)} is out for delivery and will arrive soon!`
        },
        'Delivered': {
          type: 'delivered',
          title: 'Order Delivered',
          message: `Your order #${id.slice(0, 8)} has been delivered successfully. Enjoy your purchase!`
        },
        'Returned': {
          type: 'return_requested',
          title: 'Order Returned',
          message: `Your order #${id.slice(0, 8)} has been returned.`
        },
        'Refund Initiated': {
          type: 'refund_initiated',
          title: 'Refund Initiated',
          message: `Refund for order #${id.slice(0, 8)} has been initiated. Amount will be credited within 5-7 business days.`
        },
        'Cancelled': {
          type: 'cancelled',
          title: 'Order Cancelled',
          message: `Your order #${id.slice(0, 8)} has been cancelled.`
        }
      };

      const notifData = notificationMap[status];
      if (notifData && order.user_id) {
        await supabaseAdmin
          .from('Notification')
          .insert({
            userId: order.user_id,
            type: notifData.type,
            title: notifData.title,
            message: notifData.message,
            orderId: id,
            metadata: { previousStatus, newStatus: status }
          });

        // Send email notification
        const { sendNotificationEmail } = await import('@/lib/email-notifications');
        await sendNotificationEmail(
          order.user_id,
          notifData.type,
          notifData.title,
          notifData.message,
          id
        );
      }
    } catch (notifError) {
      // Don't fail the status update if notification fails
      console.error('Failed to create notification:', notifError);
    }

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
