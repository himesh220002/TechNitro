// src/app/api/support-messages/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-supabase-server";

// Get messages for an order
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

        if (!orderId) {
            return NextResponse.json(
                { error: "Missing order ID" },
                { status: 400 }
            );
        }

        const { data: messages, error } = await supabaseAdmin
            .from("support_messages")
            .select("*")
            .eq("order_id", orderId)
            .order("created_at", { ascending: true });

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch messages", details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(messages || []);
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal error" },
            { status: 500 }
        );
    }
}

// Send a new message
export async function POST(req: Request) {
    try {
        const { orderId, message, isAdminReply = false, userId } = await req.json();

        if (!orderId || !message?.trim() || !userId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { data: newMessage, error } = await supabaseAdmin
            .from("support_messages")
            .insert({
                order_id: orderId,
                user_id: userId,
                message: message.trim(),
                is_admin_reply: isAdminReply,
                read_by_admin: isAdminReply, // Admin messages are already "read"
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: "Failed to send message", details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(newMessage);
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal error" },
            { status: 500 }
        );
    }
}

// Mark messages as read by admin
export async function PATCH(req: Request) {
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: "Missing order ID" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("support_messages")
            .update({ read_by_admin: true })
            .eq("order_id", orderId)
            .eq("is_admin_reply", false);

        if (error) {
            return NextResponse.json(
                { error: "Failed to mark as read", details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal error" },
            { status: 500 }
        );
    }
}
