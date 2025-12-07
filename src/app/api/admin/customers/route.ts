import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

        if (!token) {
            return NextResponse.json({ error: "Missing token" }, { status: 401 });
        }

        // Validate Supabase user
        const userRes = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                },
            }
        );

        if (!userRes.ok) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const user = await userRes.json();

        // Check admin role
        if (user.user_metadata?.role !== "admin") {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        // 1. Fetch all users from Auth (to get total signup count and emails)
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) {
            throw usersError;
        }

        // 2. Fetch all orders
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from("orders")
            .select("*");

        if (ordersError) {
            throw ordersError;
        }

        // 3. Aggregate data
        const customerMap = new Map();

        // Initialize map with auth users who have orders or just process orders directly?
        // The requirement is "if user ordered anything greater than 0 then add him into dashboards customers section"
        // So we primarily iterate over orders.

        orders?.forEach((order) => {
            if (!order.user_id) return;

            if (!customerMap.has(order.user_id)) {
                // Try to find email from auth users
                const authUser = users.find(u => u.id === order.user_id);

                customerMap.set(order.user_id, {
                    id: order.user_id,
                    name: order.accountName || authUser?.user_metadata?.full_name || 'Unknown',
                    email: authUser?.email || 'N/A',
                    phone: order.phone || authUser?.phone || 'N/A',
                    location: order.address ? `${order.address}, ${order.pin}` : 'N/A',
                    orders: 0,
                    spent: 0,
                    lastOrderDate: order.created_at
                });
            }

            const customer = customerMap.get(order.user_id);
            customer.orders += 1;
            // Ensure payment is treated as number
            customer.spent += Number(order.payment) || 0;

            // Update location if it's N/A and this order has one, or just keep the latest? 
            // Let's keep the first non-empty one we found or update it. 
            // Simple approach: if we have a valid address in this order, update it.
            if (order.address && customer.location === 'N/A') {
                customer.location = `${order.address}, ${order.pin}`;
            }

            if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
                customer.lastOrderDate = order.created_at;
            }
        });

        const customers = Array.from(customerMap.values());

        return NextResponse.json({
            totalUsers: users.length,
            customers: customers
        });

    } catch (err) {
        console.error("Admin customers error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
