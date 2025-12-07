'use client'

import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GradientBackground from '@/components/GradientBackground'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, LineChart, Line
} from 'recharts'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function AnalyticsPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClientComponentClient()

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch('/api/admin/analytics', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            })

            if (!res.ok) throw new Error('Failed to fetch analytics')

            const analyticsData = await res.json()
            setData(analyticsData)
        } catch (error) {
            console.error('Error fetching analytics:', error)
            toast.error('Failed to load analytics data')
        } finally {
            setLoading(false)
        }
    }

    return (
        <GradientBackground>
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <main className="flex-1 lg:ml-64 p-6 lg:p-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Analytics</h1>
                        <p className="text-gray-400 mt-1">Detailed performance metrics</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <Loader2 className="animate-spin text-purple-500" size={48} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Revenue Trend */}
                            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl">
                                <h3 className="text-lg font-bold text-white mb-6">Revenue Trend</h3>
                                <div className="h-[300px] w-full min-h-[300px]">
                                    {data.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data}>
                                                <defs>
                                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                                <XAxis dataKey="name" stroke="#9ca3af" />
                                                <YAxis stroke="#9ca3af" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
                                    )}
                                </div>
                            </div>

                            {/* Orders Trend */}
                            <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl">
                                <h3 className="text-lg font-bold text-white mb-6">Orders Overview</h3>
                                <div className="h-[300px] w-full min-h-[300px]">
                                    {data.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                                <XAxis dataKey="name" stroke="#9ca3af" />
                                                <YAxis stroke="#9ca3af" />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                                    cursor={{ fill: '#374151', opacity: 0.4 }}
                                                />
                                                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Orders" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </GradientBackground>
    )
}
