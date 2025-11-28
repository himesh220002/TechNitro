'use client'

import { Order } from '@/types/order'
import OrderRow from './OrderRow'

interface OrderListProps {
    orders: Order[]
    loading: boolean
    onUpdate?: () => void
}

export default function OrderList({ orders, loading, onUpdate }: OrderListProps) {
    if (loading) {
        return (
            <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonOrderCard key={i} />
                ))}
            </div>
        )
    }

    if (orders.length === 0) {
        return <p className="text-gray-500">No orders found.</p>
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => (
                <OrderRow key={order.id} order={order} onUpdate={onUpdate} />
            ))}
        </div>
    )
}

function SkeletonOrderCard() {
    return (
        <div className="border border-gray-500 p-4 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-900 shadow-sm animate-pulse space-y-4">
            <div className="h-5 bg-gray-600 rounded w-1/3" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
            <div className="h-4 bg-gray-700 rounded w-2/3" />
            <div className="space-y-2 mt-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-gray-700 rounded" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-600 rounded w-3/4" />
                            <div className="h-4 bg-gray-700 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center mt-4">
                <div className="h-4 bg-gray-600 rounded w-1/4" />
                <div className="h-10 bg-gray-700 rounded w-1/3" />
            </div>
        </div>
    )
}
