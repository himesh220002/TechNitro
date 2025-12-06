'use client'

import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import GradientBackground from '@/components/GradientBackground'
import { Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react'

const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', location: 'Mumbai, India', orders: 12, spent: 45000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 98765 43211', location: 'Delhi, India', orders: 8, spent: 32000 },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '+91 98765 43212', location: 'Bangalore, India', orders: 24, spent: 120000 },
    { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '+91 98765 43213', location: 'Chennai, India', orders: 5, spent: 15000 },
]

export default function CustomersPage() {
    return (
        <GradientBackground>
            <div className="flex min-h-screen">
                <DashboardSidebar />
                <main className="flex-1 lg:ml-64 p-6 lg:p-10">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white">Customers</h1>
                        <p className="text-gray-400 mt-1">Manage your customer base</p>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
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
                                    {customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-white">{customer.name}</div>
                                                        <div className="text-xs text-gray-500">ID: #{customer.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Mail size={14} className="text-gray-500" />
                                                        {customer.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-300">
                                                        <Phone size={14} className="text-gray-500" />
                                                        {customer.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                                    <MapPin size={14} className="text-gray-500" />
                                                    {customer.location}
                                                </div>
                                            </td>
                                            <td className="p-4 text-white">{customer.orders}</td>
                                            <td className="p-4 font-medium text-green-400">₹{customer.spent.toLocaleString('en-IN')}</td>
                                            <td className="p-4 text-right">
                                                <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </GradientBackground>
    )
}
