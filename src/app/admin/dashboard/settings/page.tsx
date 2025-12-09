'use client'

import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import { User, Bell, Shield, CreditCard, Globe, Moon } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function SettingsPage() {
    return (
        <DashboardWrapper>
            <Breadcrumbs items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Settings' }]} />
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account and preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-2">
                    {[
                        { icon: User, label: 'Profile' },
                        { icon: Bell, label: 'Notifications' },
                        { icon: Shield, label: 'Security' },
                        { icon: CreditCard, label: 'Billing' },
                        { icon: Globe, label: 'Language' },
                        { icon: Moon, label: 'Appearance' },
                    ].map((item, i) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${i === 0 ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Section */}
                    <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl">
                        <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                                    <input type="text" defaultValue="Admin" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                                    <input type="text" defaultValue="User" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                                <input type="email" defaultValue="admin@technitro.com" className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                                <textarea rows={4} className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Tell us about yourself..." />
                            </div>
                            <div className="pt-4">
                                <button className="px-6 py-2 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-500 transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 backdrop-blur-xl">
                        <h2 className="text-xl font-bold text-white mb-6">Preferences</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Email Notifications</h3>
                                    <p className="text-sm text-gray-400">Receive emails about new orders</p>
                                </div>
                                <div className="w-12 h-6 rounded-full bg-purple-600 relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-medium">Dark Mode</h3>
                                    <p className="text-sm text-gray-400">Always use dark theme</p>
                                </div>
                                <div className="w-12 h-6 rounded-full bg-purple-600 relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    )
}
