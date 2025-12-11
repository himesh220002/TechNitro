// src/app/api/share-customer-location/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

export async function POST(req: Request) {
    try {
        const { orderId, customerTrackingLink } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: "Missing order ID" },
                { status: 400 }
            );
        }

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from("orders")
            .update({ customer_tracking_link: customerTrackingLink || null })
            .eq("id", orderId)
            .select()
            .single();

        if (updateErr) {
            return NextResponse.json(
                { error: "Failed to update customer location", details: updateErr.message },
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

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { error: "Missing order ID" },
                { status: 400 }
            );
        }

        const { data: updated, error: updateErr } = await supabaseAdmin
            .from("orders")
            .update({ customer_tracking_link: null })
            .eq("id", orderId)
            .select()
            .single();

        if (updateErr) {
            return NextResponse.json(
                { error: "Failed to remove customer location", details: updateErr.message },
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
