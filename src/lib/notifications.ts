import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface CreateNotificationParams {
    userId: string
    type: 'order_placed' | 'shipped' | 'delivered' | 'cancelled' | 'out_for_delivery' | 'refund_initiated' | 'payment_failed' | 'return_requested' | 'promotion'
    title: string
    message: string
    orderId?: string
    productId?: string
    metadata?: any
}

export async function createNotification(params: CreateNotificationParams) {
    try {
        const supabase = createRouteHandlerClient({ cookies })

        // Check user preferences
        const { data: preferences } = await supabase
            .from('NotificationPreference')
            .select('*')
            .eq('userId', params.userId)
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

        const prefKey = preferenceMap[params.type]
        if (preferences && prefKey && !preferences[prefKey]) {
            console.log(`Notification blocked by user preferences: ${params.type}`)
            return null
        }

        // Create notification
        const { data, error } = await supabase
            .from('Notification')
            .insert({
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                orderId: params.orderId,
                productId: params.productId,
                metadata: params.metadata
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating notification:', error)
            return null
        }

        return data
    } catch (error) {
        console.error('Failed to create notification:', error)
        return null
    }
}

// Helper functions for common notification types
export async function notifyOrderPlaced(userId: string, orderId: string, orderTotal: number) {
    return createNotification({
        userId,
        type: 'order_placed',
        title: 'Order Placed Successfully',
        message: `Your order of ₹${orderTotal.toLocaleString('en-IN')} has been placed successfully.`,
        orderId,
        metadata: { orderTotal }
    })
}

export async function notifyOrderShipped(userId: string, orderId: string, trackingNumber?: string) {
    return createNotification({
        userId,
        type: 'shipped',
        title: 'Order Shipped',
        message: trackingNumber
            ? `Your order has been shipped. Tracking number: ${trackingNumber}`
            : 'Your order has been shipped and is on its way!',
        orderId,
        metadata: { trackingNumber }
    })
}

export async function notifyOutForDelivery(userId: string, orderId: string, estimatedDelivery?: string) {
    return createNotification({
        userId,
        type: 'out_for_delivery',
        title: 'Out for Delivery',
        message: estimatedDelivery
            ? `Your order is out for delivery. Expected by ${estimatedDelivery}`
            : 'Your order is out for delivery and will arrive soon!',
        orderId,
        metadata: { estimatedDelivery }
    })
}

export async function notifyOrderDelivered(userId: string, orderId: string) {
    return createNotification({
        userId,
        type: 'delivered',
        title: 'Order Delivered',
        message: 'Your order has been delivered successfully. Enjoy your purchase!',
        orderId
    })
}

export async function notifyOrderCancelled(userId: string, orderId: string, reason?: string) {
    return createNotification({
        userId,
        type: 'cancelled',
        title: 'Order Cancelled',
        message: reason
            ? `Your order has been cancelled. Reason: ${reason}`
            : 'Your order has been cancelled.',
        orderId,
        metadata: { reason }
    })
}

export async function notifyPaymentFailed(userId: string, orderId: string, reason?: string) {
    return createNotification({
        userId,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: reason
            ? `Payment failed for your order. ${reason}`
            : 'Payment failed for your order. Please try again.',
        orderId,
        metadata: { reason }
    })
}

export async function notifyRefundInitiated(userId: string, orderId: string, amount: number) {
    return createNotification({
        userId,
        type: 'refund_initiated',
        title: 'Refund Initiated',
        message: `Refund of ₹${amount.toLocaleString('en-IN')} has been initiated. It will be credited within 5-7 business days.`,
        orderId,
        metadata: { amount }
    })
}
