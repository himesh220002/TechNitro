'use client'

import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, TrendingUp, Users, Package, CreditCard, Truck, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#f97316', '#6366f1'];

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('6months')
    const supabase = createClientComponentClient()

    useEffect(() => {
        fetchAnalytics()
    }, [period])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch(`/api/admin/analytics?period=${period}`, {
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

    if (loading && !data) {
        return (
            <DashboardWrapper>
                <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                    <Loader2 className="animate-spin text-purple-500" size={48} />
                </div>
            </DashboardWrapper>
        )
    }

    if (!data) return null;

    const periods = [
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: '6months', label: '6 Months' },
        { id: 'year', label: 'Year' },
        { id: 'last_year', label: 'Last Year' },
    ]

    const glassTooltip = {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(75, 85, 99, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }

    const tooltipStyle = {
        contentStyle: glassTooltip,
        itemStyle: { color: '#fff' },
        labelStyle: { color: '#7fce60ff' }
    }

    return (
        <DashboardWrapper>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                        <p className="text-gray-400 mt-1">Comprehensive business intelligence & performance metrics</p>
                    </div>
                    <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800 backdrop-blur-sm">
                        {periods.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => setPeriod(p.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.id
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 1. Key Financial Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Revenue"
                        value={`₹${data.financials.totalRevenue.toLocaleString('en-IN')}`}
                        icon={<TrendingUp className="text-green-400" />}
                        subtext="All time"
                    />
                    <MetricCard
                        title="Avg. Order Value"
                        value={`₹${Math.round(data.financials.avgOrderValue).toLocaleString('en-IN')}`}
                        icon={<CreditCard className="text-blue-400" />}
                        subtext="Per order"
                    />
                    <MetricCard
                        title="Successful Payments"
                        value={data.financials.successfulPayments}
                        icon={<AlertCircle className="text-purple-400" />}
                        subtext={`${data.financials.refunds} Refunds`}
                    />
                    <MetricCard
                        title="Total Orders"
                        value={data.trends.reduce((acc: number, curr: any) => acc + curr.orders, 0)}
                        icon={<Package className="text-pink-400" />}
                        subtext="All time"
                    />
                </div>

                {/* 2. Trends Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Revenue & Orders Trend (Last 6 Months)">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.trends}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis yAxisId="left" stroke="#9ca3af" />
                                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                                <Tooltip {...tooltipStyle} />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" fill="url(#colorRev)" />
                                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#10b981" strokeWidth={2} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Order Status Breakdown">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.orderStatusData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="value" name="Count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* 3. Product & Category Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ChartCard title="Top 5 Products by Revenue" className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topProducts.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="revenue" name="Revenue" fill="#ec4899" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Category Performance">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categoryData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* 4. Customer & Operational Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ChartCard title="New vs Returning Customers">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.customerInsights.newVsReturning}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#c55cf6ff" />
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Top Locations (Pincodes)">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.customerInsights.topLocations.slice(0, 5)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="value" name="Orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Shipping Mode Usage">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.operational.shippingModeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    dataKey="value"
                                >
                                    {data.operational.shippingModeData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            </div>
        </DashboardWrapper>
    )
}

function MetricCard({ title, value, icon, subtext }: { title: string, value: string | number, icon: React.ReactNode, subtext?: string }) {
    return (
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl hover:border-purple-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-xl">
                    {icon}
                </div>
            </div>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
    )
}

function ChartCard({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) {
    return (
        <div className={`p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl ${className}`}>
            <h3 className="text-lg font-bold text-white mb-6">{title}</h3>
            <div className="h-[300px] w-full min-h-[300px]">
                {children}
            </div>
        </div>
    )
}
