'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Package, Truck, CheckCircle, X, AlertCircle, RefreshCw, RotateCcw, Settings, Trash2, Filter } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

interface Notification {
    id: string
    userId: string
    type: 'order_placed' | 'shipped' | 'delivered' | 'cancelled' | 'out_for_delivery' | 'refund_initiated' | 'payment_failed' | 'return_requested' | 'promotion'
    title: string
    message: string
    orderId?: string
    productId?: string
    metadata?: any
    isRead: boolean
    createdAt: string
    readAt?: string
}

type FilterTab = 'all' | 'unread' | 'orders' | 'promotions'

export default function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all')

    const supabase = createClientComponentClient()

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setNotifications([])
                setUnreadCount(0)
                return
            }

            const userId = session.user.id
            const response = await fetch(`/api/notifications?userId=${userId}`)
            const data = await response.json()

            if (data.notifications) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount || 0)
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    // Initial fetch
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Notification'
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)

                    // Show toast notification
                    showToast(newNotification)

                    // Play sound (optional)
                    playNotificationSound()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const showToast = (notification: Notification) => {
        const icon = getIcon(notification.type, 20)
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-700`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            {icon}
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-white">
                                {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                                {notification.message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-700">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-purple-400 hover:text-purple-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-right'
        })
    }

    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3')
            audio.volume = 0.3
            audio.play().catch(() => {
                // Ignore if autoplay is blocked
            })
        } catch (error) {
            // Ignore audio errors
        }
    }

    const markAsRead = async (id: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id, notificationIds: [id] })
            })

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.id, markAllAsRead: true })
            })

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success('All notifications marked as read')
        } catch (error) {
            console.error('Failed to mark all as read:', error)
            toast.error('Failed to mark notifications as read')
        }
    }

    const clearAll = async () => {
        if (!confirm('Are you sure you want to clear all notifications?')) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await fetch(`/api/notifications?userId=${session.user.id}`, {
                method: 'DELETE'
            })

            setNotifications([])
            setUnreadCount(0)
            toast.success('All notifications cleared')
        } catch (error) {
            console.error('Failed to clear notifications:', error)
            toast.error('Failed to clear notifications')
        }
    }

    const getIcon = (type: Notification['type'], size = 16) => {
        const iconProps = { size, className: getIconColor(type) }
        switch (type) {
            case 'order_placed': return <Package {...iconProps} />
            case 'shipped': return <Truck {...iconProps} />
            case 'delivered': return <CheckCircle {...iconProps} />
            case 'cancelled': return <X {...iconProps} />
            case 'out_for_delivery': return <Truck {...iconProps} />
            case 'refund_initiated': return <RotateCcw {...iconProps} />
            case 'payment_failed': return <AlertCircle {...iconProps} />
            case 'return_requested': return <RefreshCw {...iconProps} />
            case 'promotion': return <Bell {...iconProps} />
        }
    }

    const getIconColor = (type: Notification['type']) => {
        switch (type) {
            case 'order_placed': return 'text-blue-400'
            case 'shipped': return 'text-purple-400'
            case 'delivered': return 'text-green-400'
            case 'cancelled': return 'text-red-400'
            case 'out_for_delivery': return 'text-yellow-400'
            case 'refund_initiated': return 'text-orange-400'
            case 'payment_failed': return 'text-red-500'
            case 'return_requested': return 'text-cyan-400'
            case 'promotion': return 'text-pink-400'
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

    const filteredNotifications = notifications.filter(n => {
        if (activeFilter === 'unread') return !n.isRead
        if (activeFilter === 'orders') return n.type !== 'promotion'
        if (activeFilter === 'promotions') return n.type === 'promotion'
        return true
    })

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
                        {unreadCount > 99 ? '99+' : unreadCount}
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
                            className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-800">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-white">Notifications</h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={fetchNotifications}
                                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                                            title="Refresh"
                                        >
                                            <RefreshCw size={14} className={`text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                                        </button>
                                        <Link
                                            href="/settings"
                                            onClick={() => setIsOpen(false)}
                                            className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                                            title="Settings"
                                        >
                                            <Settings size={14} className="text-gray-400" />
                                        </Link>
                                        {notifications.length > 0 && (
                                            <button
                                                onClick={clearAll}
                                                className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                                                title="Clear all"
                                            >
                                                <Trash2 size={14} className="text-gray-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2">
                                    {(['all', 'unread', 'orders', 'promotions'] as FilterTab[]).map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveFilter(tab)}
                                            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${activeFilter === tab
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notifications List */}
                            <div className="max-h-96 overflow-y-auto">
                                {filteredNotifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">
                                            {activeFilter === 'all' ? 'No notifications yet' : `No ${activeFilter} notifications`}
                                        </p>
                                    </div>
                                ) : (
                                    filteredNotifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                                            className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-purple-500/5' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        {/* Highlight order IDs in yellow and bold */}
                                                        {notif.message.split(/(#[a-zA-Z0-9]+)/).map((part, i) =>
                                                            part.startsWith('#') ? (
                                                                <span key={i} className="font-bold text-yellow-400">{part}</span>
                                                            ) : (
                                                                <span key={i}>{part}</span>
                                                            )
                                                        )}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {notif.orderId && (
                                                            <Link
                                                                href={`/track-order?id=${notif.orderId}`}
                                                                className="text-xs text-purple-400 hover:text-purple-300"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setIsOpen(false)
                                                                }}
                                                            >
                                                                View Order
                                                            </Link>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {getTimeAgo(notif.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-gray-800 flex justify-between items-center">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-purple-400 hover:text-purple-300"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <Link
                                        href="/my-orders"
                                        className="text-xs text-purple-400 hover:text-purple-300 ml-auto"
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
