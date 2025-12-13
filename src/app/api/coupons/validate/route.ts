
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin-supabase-server'

export async function POST(req: Request) {
    try {
        const { code, userId } = await req.json()

        if (!code) {
            return NextResponse.json({ valid: false, message: 'Coupon code required' }, { status: 400 })
        }

        // 1. Fetch coupon using Admin client (bypasses RLS)
        const { data: coupon, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', code)
            .single()

        if (error || !coupon) {
            return NextResponse.json({ valid: false, message: 'Invalid coupon code' })
        }

        // 2. Check if active
        if (!coupon.active) {
            return NextResponse.json({ valid: false, message: 'This coupon is no longer active' })
        }

        // 3. User-specific validation (if applicable)
        // If strict one-time use functionality is needed, we would check coupon_usage here.
        // The schema provided has `coupon_usage`.
        if (userId) {
            // Check if user has used this coupon (optional logic, enabling for robustness)
            // We can uncomment this if we want to enforce one-use-per-user
            /*
            const { data: usage } = await supabaseAdmin
              .from('coupon_usage')
              .select('id')
              .eq('coupon_id', coupon.id)
              .eq('user_id', userId)
              .single()
            
            if (usage) {
              return NextResponse.json({ valid: false, message: 'You have already used this coupon' })
            }
            */
        }

        return NextResponse.json({
            valid: true,
            message: 'Coupon applied!',
            coupon: {
                code: coupon.code,
                discount: coupon.discount,
                description: coupon.description
            }
        })

    } catch (error: any) {
        return NextResponse.json({ valid: false, message: 'Server error validating coupon' }, { status: 500 })
    }
}
