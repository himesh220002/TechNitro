'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts'
import { Product } from '@/types/product'
import { RefreshCw } from 'lucide-react'

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#f97316']

interface DashboardChartsProps {
    products: Product[]
}

type TimePeriod = 'week' | 'month' | 'year' | 'last-year'

export default function DashboardCharts({ products }: DashboardChartsProps) {
    const supabase = createBrowserClient()
    const [isLargeScreen, setIsLargeScreen] = useState(false)
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        // Check screen size on mount and resize
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1024) // lg breakpoint
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)

        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    const fetchOrders = async () => {
        setRefreshing(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            if (!token) {
                console.error('No auth token found')
                return
            }

            // Fetch active orders
            const res = await fetch('/api/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                setOrders(data)
            } else {
                console.error('Failed to fetch orders:', await res.text())
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // Calculate category distribution from real products
    const categoryData = products.reduce((acc: Record<string, number>, product) => {
        const category = product.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + 1
        return acc
    }, {})

    const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value
    }))

    // Calculate sales revenue based on selected time period
    const salesData = (() => {
        const now = new Date()
        const getLocalDateStr = (date: Date) => date.toLocaleDateString('en-CA') // YYYY-MM-DD in local time

        let dataPoints: { date: string; name: string; revenue: number; orders: number }[] = []

        if (timePeriod === 'week') {
            // Last 7 days
            dataPoints = Array.from({ length: 7 }, (_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                return {
                    date: getLocalDateStr(date),
                    name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: 0,
                    orders: 0
                }
            })
        } else if (timePeriod === 'month') {
            // Last 30 days (grouped by week)
            dataPoints = Array.from({ length: 4 }, (_, i) => {
                const weekStart = new Date()
                weekStart.setDate(weekStart.getDate() - (21 - i * 7))
                return {
                    date: getLocalDateStr(weekStart),
                    name: `Week ${i + 1}`,
                    revenue: 0,
                    orders: 0
                }
            })
        } else if (timePeriod === 'year') {
            // Last 12 months
            dataPoints = Array.from({ length: 12 }, (_, i) => {
                const month = new Date()
                month.setMonth(month.getMonth() - (11 - i))
                return {
                    date: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
                    name: month.toLocaleDateString('en-US', { month: 'short' }),
                    revenue: 0,
                    orders: 0
                }
            })
        } else if (timePeriod === 'last-year') {
            // Previous year (12 months)
            dataPoints = Array.from({ length: 12 }, (_, i) => {
                const month = new Date()
                month.setFullYear(month.getFullYear() - 1)
                month.setMonth(i)
                return {
                    date: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
                    name: month.toLocaleDateString('en-US', { month: 'short' }),
                    revenue: 0,
                    orders: 0
                }
            })
        }

        // Aggregate orders into data points
        orders.forEach(order => {
            if (order.orderStatus === 'Cancelled') return

            const orderDate = new Date(order.created_at)

            if (timePeriod === 'week') {
                const dateStr = getLocalDateStr(orderDate)
                const dayData = dataPoints.find(d => d.date === dateStr)

                if (dayData) {
                    dayData.revenue += Number(order.payment) || 0
                    dayData.orders += 1
                }
            } else if (timePeriod === 'month') {
                // Group by week
                const weekIndex = Math.floor((now.getTime() - orderDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
                if (weekIndex >= 0 && weekIndex < 4) {
                    dataPoints[3 - weekIndex].revenue += Number(order.payment) || 0
                    dataPoints[3 - weekIndex].orders += 1
                }
            } else {
                // Group by month
                const monthStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`
                const monthData = dataPoints.find(d => d.date === monthStr)
                if (monthData) {
                    monthData.revenue += Number(order.payment) || 0
                    monthData.orders += 1
                }
            }
        })

        return dataPoints
    })()

    const periodLabels = {
        'week': 'This Week',
        'month': 'This Month',
        'year': 'This Year',
        'last-year': 'Last Year'
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Revenue Chart */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-white">Sales Revenue</h3>
                            <span className="text-sm text-gray-400">
                                Total: ₹{salesData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                        {/* Refresh Button */}
                        <button
                            onClick={fetchOrders}
                            disabled={refreshing}
                            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
                            title="Refresh data"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    {/* Time Period Toggle */}
                    <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg">
                        {(['week', 'month', 'year', 'last-year'] as TimePeriod[]).map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-all ${timePeriod === period
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                {periodLabels[period]}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-full h-64 sm:h-80">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Category Distribution Chart - Responsive Donut/Pie */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Category Distribution</h3>
                    <span className="text-sm text-gray-400">{products.length} products</span>
                </div>
                <div className="w-full h-64 sm:h-80 min-h-[256px] sm:min-h-[320px]">
                    {categoryChartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            No products available
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    innerRadius={isLargeScreen ? 50 : 0} // Donut on lg+, full pie on smaller
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#8eadddff',
                                        border: '0px solid #374151',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                    formatter={(value: number) => [`${value} products`, 'Count']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    )
}
