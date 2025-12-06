'use client'

import { useState, useEffect } from 'react'
import { Bell, Package, Truck, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
    id: string
    orderId: string
    message: string
    type: 'order_placed' | 'shipped' | 'delivered' | 'cancelled'
    timestamp: string
    read: boolean
}

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        // Load notifications from localStorage (simulated)
        const saved = localStorage.getItem('notifications')
        if (saved) {
            try {
                setNotifications(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse notifications', e)
            }
        } else {
            // Mock notifications for demo
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    orderId: 'ORD123',
                    message: 'Your order has been placed successfully',
                    type: 'order_placed',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                    read: false
                },
                {
                    id: '2',
                    orderId: 'ORD122',
                    message: 'Your order is out for delivery',
                    type: 'shipped',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    read: false
                }
            ]
            setNotifications(mockNotifications)
            localStorage.setItem('notifications', JSON.stringify(mockNotifications))
        }
    }, [])

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        const updated = notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        )
        setNotifications(updated)
        localStorage.setItem('notifications', JSON.stringify(updated))
    }

    const markAllAsRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }))
        setNotifications(updated)
        localStorage.setItem('notifications', JSON.stringify(updated))
    }

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'order_placed': return <Package size={16} className="text-blue-400" />
            case 'shipped': return <Truck size={16} className="text-purple-400" />
            case 'delivered': return <CheckCircle size={16} className="text-green-400" />
            case 'cancelled': return <X size={16} className="text-red-400" />
        }
    }

    const getTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}d ago`
        if (hours > 0) return `${hours}h ago`
        if (minutes > 0) return `${minutes}m ago`
        return 'Just now'
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center p-3 bg-gradient-to-tr from-gray-700 to-black/50 rounded-full shadow shadow-black hover:shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-gray-200" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                                <h3 className="font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-purple-400 hover:text-purple-300"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => markAsRead(notif.id)}
                                            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${!notif.read ? 'bg-purple-500/5' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Link
                                                            href={`/track-order?id=${notif.orderId}`}
                                                            className="text-xs text-purple-400 hover:text-purple-300"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {notif.orderId}
                                                        </Link>
                                                        <span className="text-xs text-gray-500">
                                                            {getTimeAgo(notif.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-gray-800 text-center">
                                    <Link
                                        href="/my-orders"
                                        className="text-sm text-purple-400 hover:text-purple-300"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        View all orders →
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
