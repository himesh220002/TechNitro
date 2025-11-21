// //src/app/api/orders/route.ts
// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// type ProductInOrder = {
//   id: string;
//   quantity: number;
// };

// export async function POST(req: Request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies });

//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     const body = await req.json();

//     let userId = session?.user?.id ?? body.userId;

//     // Fallback: Bearer auth
//     if (!userId) {
//       const authHeader = req.headers.get("authorization") || "";
//       const token = authHeader.startsWith("Bearer ")
//         ? authHeader.split(" ")[1]
//         : authHeader;

//       if (token) {
//         const userRes = await fetch(
//           `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//             },
//           }
//         );

//         if (userRes.ok) {
//           const userJson = await userRes.json();
//           userId = userJson.id;
//         }
//       }
//     }

//     if (!userId) {
//       return NextResponse.json(
//         { error: "Not authenticated" },
//         { status: 401 }
//       );
//     }

//     // Validate products
//     const items: ProductInOrder[] = Array.isArray(body.products)
//       ? body.products.map((p: ProductInOrder) => ({
//           id: p.id,
//           quantity: Number(p.quantity),
//         }))
//       : [];

//     for (const item of items) {
//       const { data: prod, error } = await supabase
//         .from("Product")
//         .select("inventory,name")
//         .eq("id", item.id)
//         .single();

//       if (error || !prod) {
//         return NextResponse.json(
//           { error: `Product not found: ${item.id}` },
//           { status: 400 }
//         );
//       }

//       if (prod.inventory < item.quantity) {
//         return NextResponse.json(
//           { error: `Insufficient stock for ${prod.name}` },
//           { status: 400 }
//         );
//       }
//     }

//     // Create order
//     const { data: order, error: createError } = await supabase
//       .from("Order")
//       .insert({
//         id: body.id,
//         userId,
//         accountName: body.accountName,
//         accountNumber: body.accountNumber,
//         phone: body.phone,
//         address: body.address,
//         pin: body.pin,
//         paymentMethod: body.paymentMethod,
//         payment: body.payment,
//         products: body.products,
//         shippingEvents: [],
//       })
//       .select()
//       .single();

//     if (createError) {
//       return NextResponse.json(
//         { error: "Order creation failed", details: createError.message },
//         { status: 500 }
//       );
//     }

//     // Update inventory
//     for (const item of items) {
//       await supabase
//         .from("Product")
//         .update({
//           inventory: supabase.rpc("decrement_inventory", {
//             product_id: item.id,
//             qty: item.quantity,
//           }),
//         })
//         .eq("id", item.id);
//     }

//     return NextResponse.json(order);
//   } catch (error) {
//     const message =
//       error instanceof Error ? error.message : "Unknown error occurred";
//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type ProductInOrder = {
  id: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const body = await req.json();

    // Use session userId or fallback to body.userId
    // eslint-disable-next-line prefer-const
    let userId = session?.user?.id ?? body.userId;
    console.log("userId of the user who ordered the items:",userId)

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate product inventory
    const items: ProductInOrder[] = Array.isArray(body.products)
      ? body.products.map((p: ProductInOrder) => ({
          id: p.id,
          quantity: Number(p.quantity),
        }))
      : [];

    for (const item of items) {
      const { data: prod, error } = await supabase
        .from("Product")
        .select("inventory,name")
        .eq("id", item.id)
        .single();

      if (error || !prod) {
        return NextResponse.json({ error: `Product not found: ${item.id}` }, { status: 400 });
      }

      if (prod.inventory < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${prod.name}` }, { status: 400 });
      }
    }

    // Insert order into `orders` table (note lowercase table name)
    const { data: order, error: createError } = await supabase
      .from("orders") // ✅ ensure correct table name
      .insert({
        user_id: userId, // ✅ match column names in table
        account_name: body.accountName,
        account_number: body.accountNumber,
        phone: body.phone,
        address: body.address,
        pin: body.pin,
        payment_method: body.paymentMethod,
        payment: body.payment,
        products: body.products,
        shipping_events: [],
        payment_status: "Paid",
        payment_result: body.paymentResult ?? null,
      })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: "Order creation failed", details: createError.message }, { status: 500 });
    }

    // Update product inventory using RPC or decrement logic
    for (const item of items) {
      await supabase.rpc("decrement_inventory", {
        product_id: item.id,
        qty: item.quantity,
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
