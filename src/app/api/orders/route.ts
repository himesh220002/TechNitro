// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

type ProductInOrder = {
  id: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Read userId directly from body
    const userId = body.user_id;

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    // Validate product inventory
    const items: ProductInOrder[] = Array.isArray(body.products)
      ? body.products.map((p: ProductInOrder) => ({
        id: p.id,
        quantity: Number(p.quantity),
      }))
      : [];

    for (const item of items) {
      const { data: prod, error } = await supabaseAdmin
        .from("Product")
        .select("inventory,name")
        .eq("id", item.id)
        .single();

      if (error || !prod) {
        return NextResponse.json(
          { error: `Product not found: ${item.id}` },
          { status: 400 }
        );
      }

      if (prod.inventory < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${prod.name}` },
          { status: 400 }
        );
      }
    }

    // Create order in Supabase
    const { data: order, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        id: body.id,
        user_id: userId,
        accountName: body.accountName,
        accountNumber: body.accountNumber || "",
        phone: body.phone,
        address: body.address,
        pin: body.pin,
        paymentMethod: body.paymentMethod,
        payment: body.payment,
        deliveryCharge: body.deliveryCharge,
        products: body.products,
        shippingEvents: [],
        orderStatus: "Order Placed",
        paymentResult: body.paymentResult ?? "pending",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: "Order creation failed", details: insertError.message },
        { status: 500 }
      );
    }

    // Deduct inventory
    for (const item of items) {
      await supabaseAdmin.rpc("decrement_inventory", {
        product_id: item.id,
        qty: item.quantity,
      });
    }

    // Create notification for order placed
    try {
      await supabaseAdmin
        .from('Notification')
        .insert({
          userId: userId,
          type: 'order_placed',
          title: 'Order Placed Successfully',
          message: `Your order #${body.id.slice(0, 8)} of ₹${body.payment.toLocaleString('en-IN')} has been placed successfully.`,
          orderId: body.id,
          metadata: {
            orderTotal: body.payment,
            itemCount: items.length
          }
        });

      // Send email notification
      const { sendNotificationEmail } = await import('@/lib/email-notifications');
      await sendNotificationEmail(
        userId,
        'order_placed',
        'Order Placed Successfully',
        `Your order #${body.id.slice(0, 8)} of ₹${body.payment.toLocaleString('en-IN')} has been placed successfully.`,
        body.id
      );
    } catch (notifError) {
      // Don't fail the order if notification fails
      console.error('Failed to create notification:', notifError);
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
