
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin-supabase-server'

// PUT /api/admin/coupons/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json()
        const { id } = await params

        const { data, error } = await supabaseAdmin
            .from('coupons')
            .update(body)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE /api/admin/coupons/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params

        const { error } = await supabaseAdmin
            .from('coupons')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
