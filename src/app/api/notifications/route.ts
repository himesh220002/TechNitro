import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/admin-supabase-server'

export const dynamic = 'force-dynamic'

// GET - Fetch user notifications
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true'
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
        const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

        let query = supabaseAdmin
            .from('Notification')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false })
            .range(offset, offset + limit - 1)

        if (unreadOnly) {
            query = query.eq('isRead', false)
        }

        const { data: notifications, error } = await query

        if (error) {
            console.error('Error fetching notifications:', error)
            return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
        }

        // Get unread count
        const { count: unreadCount } = await supabaseAdmin
            .from('Notification')
            .select('*', { count: 'exact', head: true })
            .eq('userId', userId)
            .eq('isRead', false)

        return NextResponse.json({
            notifications: notifications || [],
            unreadCount: unreadCount || 0
        })
    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, type, title, message, orderId, productId, metadata } = body

        // Validate required fields
        if (!userId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Check user preferences
        const { data: preferences } = await supabaseAdmin
            .from('NotificationPreference')
            .select('*')
            .eq('userId', userId)
            .single()

        // Map notification type to preference field
        const preferenceMap: Record<string, string> = {
            'order_placed': 'orderPlaced',
            'shipped': 'shipped',
            'delivered': 'delivered',
            'cancelled': 'cancelled',
            'out_for_delivery': 'outForDelivery',
            'refund_initiated': 'refundInitiated',
            'payment_failed': 'paymentFailed',
            'return_requested': 'returnRequested',
            'promotion': 'promotions'
        }

        const prefKey = preferenceMap[type]
        if (preferences && prefKey && !preferences[prefKey]) {
            return NextResponse.json({ message: 'Notification blocked by user preferences' }, { status: 200 })
        }

        // Create notification
        const { data: notification, error } = await supabaseAdmin
            .from('Notification')
            .insert({
                userId,
                type,
                title,
                message,
                orderId,
                productId,
                metadata
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating notification:', error)
            return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
        }

        return NextResponse.json({ notification })
    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { userId, notificationIds, markAllAsRead } = body

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        if (markAllAsRead) {
            // Mark all notifications as read
            const { error } = await supabaseAdmin
                .from('Notification')
                .update({ isRead: true, readAt: new Date().toISOString() })
                .eq('userId', userId)
                .eq('isRead', false)

            if (error) {
                console.error('Error marking all as read:', error)
                return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
            }

            return NextResponse.json({ message: 'All notifications marked as read' })
        }

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 })
        }

        // Mark specific notifications as read
        const { error } = await supabaseAdmin
            .from('Notification')
            .update({ isRead: true, readAt: new Date().toISOString() })
            .in('id', notificationIds)
            .eq('userId', userId)

        if (error) {
            console.error('Error marking notifications as read:', error)
            return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Notifications marked as read' })
    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Clear all notifications
export async function DELETE(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const { error } = await supabaseAdmin
            .from('Notification')
            .delete()
            .eq('userId', userId)

        if (error) {
            console.error('Error deleting notifications:', error)
            return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 })
        }

        return NextResponse.json({ message: 'All notifications cleared' })
    } catch (error) {
        console.error('Notifications API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
