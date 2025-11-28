import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/admin-supabase-server"

export async function POST(req: Request) {
    try {
        const { id: orderId } = await req.json()

        if (!orderId) {
            return NextResponse.json({ error: "Order ID required" }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from("orders")
            .update({ isarchivedforadmin: true })
            .eq("id", orderId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
