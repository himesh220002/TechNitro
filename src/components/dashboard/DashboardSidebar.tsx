'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    BarChart3,
    Settings,
    Users,
    LogOut,
    Tag,
    ShoppingBag,
    X
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

interface DashboardSidebarProps {
    isOpen?: boolean
    onClose?: () => void
}

export default function DashboardSidebar({ isOpen = false, onClose }: DashboardSidebarProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 border-r border-gray-800 
                transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white">
                            TN
                        </div>
                        <span className="text-xl font-bold text-white">TechNitro</span>
                    </Link>
                    {/* Close button for mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
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
        </>
    )
}
