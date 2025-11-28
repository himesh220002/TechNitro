import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/admin-supabase-server"

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json()
        if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

        const { error } = await supabaseAdmin
            .from("orders")
            .update({ isarchived: true })
            .eq("id", orderId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: "Failed to archive order" }, { status: 500 })
    }
}
