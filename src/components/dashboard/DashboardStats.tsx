'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react'

interface StatsProps {
    totalProducts: number
    lowStock: number
    outOfStock: number
    totalValue: number
}

export default function DashboardStats({ totalProducts, lowStock, outOfStock, totalValue }: StatsProps) {
    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${totalValue.toLocaleString('en-IN')}`,
            change: '+12.5%',
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20'
        },
        {
            label: 'Total Products',
            value: totalProducts,
            change: '+4 new',
            icon: Package,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Low Stock Alerts',
            value: lowStock,
            change: 'Needs attention',
            icon: AlertTriangle,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/20'
        },
        {
            label: 'Out of Stock',
            value: outOfStock,
            change: 'Restock now',
            icon: TrendingUp, // Placeholder icon
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl hover:border-gray-700 transition-colors"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.change.includes('+') ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-400'
                            }`}>
                            {stat.change}
                        </span>
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium">{stat.label}</h3>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </motion.div>
            ))}
        </div>
    )
}
