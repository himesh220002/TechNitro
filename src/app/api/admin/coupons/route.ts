
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin-supabase-server'

// GET /api/admin/coupons
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/admin/coupons
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { code, discount, description, active } = body

        const { data, error } = await supabaseAdmin
            .from('coupons')
            .insert([{ code, discount, description, active }])
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
