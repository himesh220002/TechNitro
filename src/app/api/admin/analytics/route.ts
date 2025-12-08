import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";
import { Order, ProductInOrder, ShippingEvent } from "@/types/order";

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

        // Fetch all orders with all fields
        const { data: ordersData, error } = await supabaseAdmin
            .from("orders")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            throw error;
        }

        const orders = ordersData as Order[];

        // Get period from query params
        const url = new URL(req.url);
        const period = url.searchParams.get("period") || "6months";

        // --- Aggregation Logic ---

        // 1. Trends (Revenue & Orders)
        const trendStats = new Map<string, { revenue: number; orders: number; delivered: number; returned: number }>();
        const now = new Date();

        let startDate = new Date();
        let dateFormat: Intl.DateTimeFormatOptions = { month: 'short' };
        let timeUnit: 'day' | 'month' = 'month';

        switch (period) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                dateFormat = { weekday: 'short' };
                timeUnit = 'day';
                break;
            case 'month':
                startDate.setDate(now.getDate() - 30);
                dateFormat = { day: 'numeric', month: 'short' };
                timeUnit = 'day';
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                dateFormat = { month: 'short' };
                timeUnit = 'month';
                break;
            case 'last_year':
                startDate.setFullYear(now.getFullYear() - 1, 0, 1); // Jan 1st of last year
                const endDate = new Date(now.getFullYear() - 1, 11, 31); // Dec 31st of last year
                // Special handling for last_year range
                break;
            case '6months':
            default:
                startDate.setMonth(now.getMonth() - 6);
                dateFormat = { month: 'short' };
                timeUnit = 'month';
                break;
        }

        // Initialize buckets
        if (period === 'last_year') {
            const lastYear = now.getFullYear() - 1;
            for (let i = 0; i < 12; i++) {
                const d = new Date(lastYear, i, 1);
                const label = d.toLocaleString('default', { month: 'short' });
                trendStats.set(label, { revenue: 0, orders: 0, delivered: 0, returned: 0 });
            }
        } else {
            // Generate buckets from startDate to now
            const current = new Date(startDate);
            while (current <= now) {
                const label = current.toLocaleString('default', dateFormat);
                if (!trendStats.has(label)) {
                    trendStats.set(label, { revenue: 0, orders: 0, delivered: 0, returned: 0 });
                }
                if (timeUnit === 'day') current.setDate(current.getDate() + 1);
                else current.setMonth(current.getMonth() + 1);
            }
        }

        // 2. Order Status Breakdown
        const statusCounts: Record<string, number> = {};

        // 3. Product Insights
        const productPerformance: Record<string, { revenue: number; quantity: number; category: string }> = {};
        const categoryRevenue: Record<string, number> = {};

        // 4. Financial Metrics
        const paymentMethodStats: Record<string, number> = {};
        let totalRevenue = 0;
        let successfulPayments = 0;
        let refunds = 0;

        // 5. Customer Insights
        const userOrderCounts: Record<string, number> = {};
        const locationCounts: Record<string, number> = {};

        // 6. Operational Metrics
        const shippingModeCounts: Record<string, number> = {};

        orders.forEach(order => {
            const date = new Date(order.created_at);
            const amount = Number(order.payment) || 0;

            // Filter for Trends based on period
            let includeInTrend = false;
            if (period === 'last_year') {
                includeInTrend = date.getFullYear() === (now.getFullYear() - 1);
            } else {
                includeInTrend = date >= startDate;
            }

            if (includeInTrend) {
                const label = date.toLocaleString('default', dateFormat);
                // For 'week' or 'month' (daily), we might have multiple orders per day.
                // For 'year' (monthly), we bucket by month.
                // Ensure label matches bucket keys

                if (trendStats.has(label)) {
                    const stats = trendStats.get(label)!;
                    if (order.orderStatus !== 'Cancelled') {
                        stats.revenue += amount;
                        stats.orders += 1;
                    }
                    if (order.orderStatus === 'Delivered') stats.delivered += 1;
                    if (order.orderStatus === 'Returned') stats.returned += 1;
                }
            }

            // Global Stats (All Time) - Or should these be filtered too?
            // Usually dashboard cards show "All Time" or "Current Period". 
            // Let's keep them All Time for now as per previous implementation, 
            // or we can filter them to match the view. 
            // The user asked for "Revenue & Orders Trend need to have...", implying the chart specifically.
            // But usually "Total Revenue" card should reflect the selected period? 
            // Let's keep global stats as "All Time" for now to avoid confusion unless requested.

            // Status Breakdown
            statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1;

            // Product & Category Insights
            if (order.orderStatus !== 'Cancelled') {
                order.products.forEach((p: ProductInOrder) => {
                    if (!productPerformance[p.name]) {
                        productPerformance[p.name] = { revenue: 0, quantity: 0, category: p.category };
                    }
                    productPerformance[p.name].revenue += p.price * p.quantity;
                    productPerformance[p.name].quantity += p.quantity;

                    categoryRevenue[p.category] = (categoryRevenue[p.category] || 0) + (p.price * p.quantity);
                });

                // Financials
                totalRevenue += amount;
                if (order.paymentResult === 'success') successfulPayments++;

                paymentMethodStats[order.paymentMethod] = (paymentMethodStats[order.paymentMethod] || 0) + amount;
            } else {
                // Cancelled/Refunded
                if (order.paymentResult === 'success') refunds++; // Paid but cancelled
            }

            // Customer Insights
            userOrderCounts[order.user_id] = (userOrderCounts[order.user_id] || 0) + 1;
            if (order.pin) {
                locationCounts[order.pin] = (locationCounts[order.pin] || 0) + 1;
            }

            // Operational
            if (order.shippingEvents) {
                order.shippingEvents.forEach((event: ShippingEvent) => {
                    if (event.mode) {
                        shippingModeCounts[event.mode] = (shippingModeCounts[event.mode] || 0) + 1;
                    }
                });
            }
        });

        // --- Formatting Data for Frontend ---

        const trends = Array.from(trendStats.entries()).map(([name, stats]) => ({
            name,
            ...stats
        }));

        const orderStatusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

        const topProducts = Object.entries(productPerformance)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);

        const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value }));

        const paymentMethodData = Object.entries(paymentMethodStats).map(([name, value]) => ({ name, value }));

        const newVsReturning = [
            { name: 'New Customers', value: Object.values(userOrderCounts).filter(c => c === 1).length },
            { name: 'Returning Customers', value: Object.values(userOrderCounts).filter(c => c > 1).length }
        ];

        const topLocations = Object.entries(locationCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        const shippingModeData = Object.entries(shippingModeCounts).map(([name, value]) => ({ name, value }));

        return NextResponse.json({
            trends,
            orderStatusData,
            topProducts,
            categoryData,
            paymentMethodData,
            customerInsights: {
                newVsReturning,
                topLocations
            },
            financials: {
                totalRevenue,
                successfulPayments,
                refunds,
                avgOrderValue: totalRevenue / (orders.filter(o => o.orderStatus !== 'Cancelled').length || 1)
            },
            operational: {
                shippingModeData
            }
        });

    } catch (err) {
        console.error("Admin analytics error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
