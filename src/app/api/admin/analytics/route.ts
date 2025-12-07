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

        // Fetch all orders
        // We'll fetch all and aggregate in memory for now as Supabase doesn't support complex aggregation easily via JS client without RPC
        // For a large scale app, we'd use an RPC function or a separate stats table.
        const { data: orders, error } = await supabaseAdmin
            .from("orders")
            .select("created_at, payment, orderStatus")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        // Aggregate by month
        const monthlyStats = new Map<string, { revenue: number; orders: number }>();

        // Initialize last 6 months to ensure we have data points even if 0
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            monthlyStats.set(monthName, { revenue: 0, orders: 0 });
        }

        orders?.forEach(order => {
            if (order.orderStatus === 'Cancelled') return; // Exclude cancelled orders from revenue

            const date = new Date(order.created_at);
            const monthName = date.toLocaleString('default', { month: 'short' });

            // Only count if it's in our initialized months (or just add it if we want all time)
            // Let's stick to the map keys we initialized to show a clean trend
            if (monthlyStats.has(monthName)) {
                const stats = monthlyStats.get(monthName)!;
                stats.revenue += Number(order.payment) || 0;
                stats.orders += 1;
            }
        });

        const chartData = Array.from(monthlyStats.entries()).map(([name, stats]) => ({
            name,
            revenue: stats.revenue,
            orders: stats.orders
        }));

        return NextResponse.json(chartData);

    } catch (err) {
        console.error("Admin analytics error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
