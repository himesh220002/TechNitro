'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    BarChart3,
    Settings,
    Users,
    Bell,
    LogOut,
    Tag,
    ShoppingBag
} from 'lucide-react'

const navItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
    { icon: Package, label: 'Products', href: '/admin/dashboard/products' },
    { icon: ShoppingBag, label: 'Orders', href: '/admin/dashboard/orders' },
    { icon: Tag, label: 'Coupons', href: '/admin/dashboard/coupons' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/dashboard/analytics' },
    { icon: Users, label: 'Customers', href: '/admin/dashboard/customers' },
    { icon: Settings, label: 'Settings', href: '/admin/dashboard/settings' },
]

export default function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-gray-900 border-r border-gray-800 z-50">
            <div className="p-6 border-b border-gray-800">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white">
                        TN
                    </div>
                    <span className="text-xl font-bold text-white">TechNitro</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    )
}
