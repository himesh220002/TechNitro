import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin-supabase-server'

export const dynamic = 'force-dynamic'

// GET - Fetch user notification preferences
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        let { data: preferences } = await supabaseAdmin
            .from('NotificationPreference')
            .select('*')
            .eq('userId', userId)
            .single()

        // Create default preferences if none exist
        if (!preferences) {
            const { data: newPreferences, error } = await supabaseAdmin
                .from('NotificationPreference')
                .insert({
                    userId,
                    orderPlaced: true,
                    shipped: true,
                    delivered: true,
                    cancelled: true,
                    outForDelivery: true,
                    refundInitiated: true,
                    paymentFailed: true,
                    returnRequested: true,
                    promotions: true,
                    emailNotifications: true,
                    pushNotifications: true
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating preferences:', error)
                return NextResponse.json({ error: 'Failed to create preferences' }, { status: 500 })
            }

            preferences = newPreferences
        }

        return NextResponse.json({ preferences })
    } catch (error) {
        console.error('Preferences API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Update notification preferences
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, ...updates } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const { data: preferences, error } = await supabaseAdmin
            .from('NotificationPreference')
            .update({
                ...updates,
                updatedAt: new Date().toISOString()
            })
            .eq('userId', userId)
            .select()
            .single()

        if (error) {
            console.error('Error updating preferences:', error)
            return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
        }

        return NextResponse.json({ preferences })
    } catch (error) {
        console.error('Preferences API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
