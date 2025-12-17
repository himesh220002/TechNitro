'use client'

import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import { Mail, Phone, MapPin, Users, Loader2, Eye, Send } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase/client'
import CustomerOrdersModal from '@/components/dashboard/CustomerOrdersModal'
import Breadcrumbs from '@/components/Breadcrumbs'

interface Customer {
    id: string
    name: string
    email: string
    phone: string
    location: string
    orders: number
    spent: number
    lastOrderDate: string
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [totalUsers, setTotalUsers] = useState(0)
    const [loading, setLoading] = useState(true)
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string, name: string } | null>(null)
    const supabase = createBrowserClient()

    const fetchCustomers = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            const res = await fetch('/api/admin/customers', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            })

            if (!res.ok) {
                if (res.status === 401) throw new Error('Unauthorized')
                throw new Error('Failed to fetch customers')
            }

            const data = await res.json()
            setCustomers(data.customers)
            setTotalUsers(data.totalUsers)
        } catch (error) {
            console.error('Error fetching customers:', error)
            toast.error('Failed to load customers')
        } finally {
            setLoading(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchCustomers()
    }, [fetchCustomers])

    return (
        <DashboardWrapper>
            <Breadcrumbs items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Customers' }]} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Customers</h1>
                <p className="text-gray-400 mt-1">Manage your customer base</p>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Total Signup Users</p>
                            <p className="text-2xl font-bold text-white">
                                {loading ? '...' : totalUsers}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-purple-500" size={32} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-900/80">
                                    <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                                    <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Location</th>
                                    <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Orders</th>
                                    <th className="p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Total Spent</th>
                                    <th className="p-4 text-right text-sm font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No customers found with orders.
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold shrink-0">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{customer.name}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={customer.id}>ID: #{customer.id.slice(0, 8)}...</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Mail size={14} className="text-gray-500 shrink-0" />
                                                        <span className="truncate max-w-[200px]" title={customer.email}>{customer.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Phone size={14} className="text-gray-500 shrink-0" />
                                                        {customer.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <MapPin size={14} className="text-gray-500 shrink-0" />
                                                    <span className="truncate max-w-[200px]" title={customer.location}>{customer.location}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-white">{customer.orders}</td>
                                            <td className="p-4 font-medium text-green-400">₹{customer.spent.toLocaleString('en-IN')}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedCustomer({ id: customer.id, name: customer.name })}
                                                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                                        title="View Orders"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <a
                                                        href={`mailto:${customer.email}`}
                                                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                                        title="Send Email"
                                                    >
                                                        <Send size={18} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <CustomerOrdersModal
                customerId={selectedCustomer?.id || null}
                customerName={selectedCustomer?.name || ''}
                isOpen={!!selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
            />
        </DashboardWrapper>
    )
}
