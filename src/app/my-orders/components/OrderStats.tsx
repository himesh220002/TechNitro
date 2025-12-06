'use client'

import { Order } from '@/types/order'
import { motion } from 'framer-motion'
import { Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface OrderStatsProps {
    orders: Order[]
}

export default function OrderStats({ orders }: OrderStatsProps) {
    const stats = orders.reduce(
        (acc, order) => {
            acc.total++
            acc.spend += order.payment
            if (order.orderStatus === 'Delivered') acc.delivered++
            if (order.orderStatus === 'Cancelled') acc.cancelled++
            if (order.orderStatus === 'Returned') acc.returned++
            return acc
        },
        { total: 0, spend: 0, delivered: 0, cancelled: 0, returned: 0 }
    )

    const items = [
        {
            label: 'Total Orders',
            value: stats.total,
            icon: Package,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Total Spend',
            value: `₹${stats.spend.toLocaleString('en-IN')}`,
            icon: TrendingUp,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            label: 'Delivered',
            value: stats.delivered,
            icon: CheckCircle,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            label: 'Cancelled/Returned',
            value: stats.cancelled + stats.returned,
            icon: AlertCircle,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20'
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {items.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${item.bg} ${item.border} border`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-xs font-medium">{item.label}</p>
                    <p className="text-xl font-bold text-white mt-1">{item.value}</p>
                </motion.div>
            ))}
        </div>
    )
}
