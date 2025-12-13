
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin-supabase-server'

export async function POST(req: Request) {
    try {
        const { couponCode, userId, orderId } = await req.json()

        if (!couponCode || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Get coupon ID
        const { data: coupon, error: fetchError } = await supabaseAdmin
            .from('coupons')
            .select('id, usage_count')
            .eq('code', couponCode)
            .single()

        if (fetchError || !coupon) {
            return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
        }

        // 2. Record usage
        const { error: insertError } = await supabaseAdmin
            .from('coupon_usage')
            .insert([
                {
                    coupon_id: coupon.id,
                    user_id: userId,
                    order_id: orderId
                }
            ])

        if (insertError) throw insertError

        // 3. Increment usage count
        await supabaseAdmin
            .from('coupons')
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .eq('id', coupon.id)

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Coupon usage error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
