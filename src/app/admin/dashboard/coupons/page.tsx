'use client'

import { useState, useEffect, useRef } from 'react'
import { Coupon } from '@/types/coupon'
import { getCoupons, deleteCoupon, updateCoupon, getCouponStats, initializeCoupons } from '@/lib/coupons'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tag, TrendingUp, Users, Award, Lock, Unlock, Key, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import Breadcrumbs from '@/components/Breadcrumbs'
import CouponForm from '@/components/dashboard/CouponForm'
import { motion, AnimatePresence } from 'framer-motion'

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, totalUsage: 0, mostUsedCoupon: null as Coupon | null })
    const [showForm, setShowForm] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
    const [search, setSearch] = useState('')

    // Edit Lock State
    const [isEditingEnabled, setIsEditingEnabled] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [passwordInput, setPasswordInput] = useState('')
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Clear timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [])

    const handleUnlockClick = () => {
        setShowPasswordModal(true)
        setPasswordInput('')
    }

    const handleLockClick = () => {
        setIsEditingEnabled(false)
        if (timerRef.current) clearTimeout(timerRef.current)
        toast.success('Edits locked')
        setShowForm(false)
    }

    const verifyPassword = (e: React.FormEvent) => {
        e.preventDefault()
        const validPassword = process.env.NEXT_PUBLIC_ADMIN_EDIT_PASSWORD || 'admin123'
        if (passwordInput === validPassword) {
            setIsEditingEnabled(true)
            setShowPasswordModal(false)
            toast.success('Edits enabled for 30 minutes')

            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
                setIsEditingEnabled(false)
                setShowForm(false)
                toast('Edit session expired. Edits locked.', { icon: '🔒' })
            }, 30 * 60 * 1000)
        } else {
            toast.error('Incorrect password')
        }
    }

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        try {
            const allCoupons = await getCoupons()
            setCoupons(allCoupons)
            const stats = await getCouponStats()
            setStats(stats)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load coupons')
            // If unauthorized, redirect might happen at middleware or API level returning 401. 
            // We can check here too but middleware handles it usually.
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            try {
                await deleteCoupon(id)
                toast.success('Coupon deleted successfully')
                loadCoupons()
            } catch (error) {
                toast.error('Failed to delete coupon')
            }
        }
    }

    const handleToggleActive = async (coupon: Coupon) => {
        try {
            await updateCoupon(coupon.id, { active: !coupon.active })
            toast.success(`Coupon ${coupon.active ? 'deactivated' : 'activated'}`)
            loadCoupons()
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon)
        setShowForm(true)
    }

    const handleFormClose = () => {
        setShowForm(false)
        setEditingCoupon(null)
        loadCoupons()
    }

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <DashboardWrapper>
            <Breadcrumbs items={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Coupons' }]} />

            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Coupon Management</h1>
                        <p className="text-gray-400 mt-1">Create and manage discount coupons</p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditingEnabled ? (
                            <button
                                onClick={handleUnlockClick}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors text-sm font-medium"
                            >
                                <Lock size={16} />
                                Unlock Coupons
                            </button>
                        ) : (
                            <button
                                onClick={handleLockClick}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium border border-red-500/20"
                            >
                                <Unlock size={16} />
                                Lock Coupons
                            </button>
                        )}

                        {isEditingEnabled && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                            >
                                <Plus size={20} />
                                <span>Add Coupon</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 sm:p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Tag className="text-purple-400" size={24} />
                            <h3 className="text-gray-400 text-sm">Total Coupons</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalCoupons}</p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Award className="text-green-400" size={24} />
                            <h3 className="text-gray-400 text-sm">Active Coupons</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.activeCoupons}</p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-blue-400" size={24} />
                            <h3 className="text-gray-400 text-sm">Total Usage</h3>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.totalUsage}</p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-gray-900/50 border border-gray-800">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="text-yellow-400" size={24} />
                            <h3 className="text-gray-400 text-sm">Most Used</h3>
                        </div>
                        <p className="text-xl font-bold text-white truncate">
                            {stats.mostUsedCoupon?.code || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search coupons..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-96 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                {/* Coupons Table */}
                {!isEditingEnabled ? (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                            <Lock size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Content Locked</h3>
                        <p className="text-gray-400 max-w-md">
                            Coupon codes and management actions are hidden for security.
                            Please unlock to view or edit coupons.
                        </p>
                        <button
                            onClick={handleUnlockClick}
                            className="mt-6 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-medium"
                        >
                            Unlock Coupons
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[640px]">
                                <thead>
                                    <tr className="border-b border-gray-800 bg-gray-900/80">
                                        <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase">Code</th>
                                        <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase">Discount</th>
                                        <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase hidden md:table-cell">Description</th>
                                        <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase">Usage</th>
                                        <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase">Status</th>
                                        <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-gray-400 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredCoupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-gray-800/30 transition-colors">
                                            <td className="p-3 sm:p-4">
                                                <span className="font-mono font-bold text-purple-400">{coupon.code}</span>
                                            </td>
                                            <td className="p-3 sm:p-4 text-white font-medium">{coupon.discount}%</td>
                                            <td className="p-3 sm:p-4 text-gray-400 text-sm hidden md:table-cell">{coupon.description}</td>
                                            <td className="p-3 sm:p-4 text-white">{coupon.usageCount}</td>
                                            <td className="p-3 sm:p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.active
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                                    }`}>
                                                    {coupon.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-3 sm:p-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleActive(coupon)}
                                                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                                                        title={coupon.active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {coupon.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredCoupons.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <Tag size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No coupons found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Coupon Form Modal */}
            {showForm && (
                <CouponForm
                    coupon={editingCoupon}
                    onClose={handleFormClose}
                    onSuccess={loadCoupons}
                />
            )}

            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Key className="text-purple-500" size={20} />
                                    Unlock Coupons
                                </h3>
                                <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={verifyPassword}>
                                <div className="mb-4">
                                    <label className="block text-sm text-gray-400 mb-2">Editor Password</label>
                                    <input
                                        type="password"
                                        autoFocus
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Enter password..."
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Entering correct password unlocks coupons for 30 minutes.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="flex-1 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium"
                                    >
                                        Unlock
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardWrapper>
    )
}
