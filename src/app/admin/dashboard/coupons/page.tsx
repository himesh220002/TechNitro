'use client'

import { useState, useEffect } from 'react'
import { Coupon } from '@/types/coupon'
import { getCoupons, deleteCoupon, updateCoupon, getCouponStats, initializeCoupons } from '@/lib/coupons'
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Tag, TrendingUp, Users, Award } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DashboardWrapper from '@/components/dashboard/DashboardWrapper'
import Breadcrumbs from '@/components/Breadcrumbs'
import CouponForm from '@/components/dashboard/CouponForm'

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [stats, setStats] = useState({ totalCoupons: 0, activeCoupons: 0, totalUsage: 0, mostUsedCoupon: null as Coupon | null })
    const [showForm, setShowForm] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = () => {
        initializeCoupons()
        const allCoupons = getCoupons()
        setCoupons(allCoupons)
        setStats(getCouponStats())
    }

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this coupon?')) {
            deleteCoupon(id)
            toast.success('Coupon deleted successfully')
            loadCoupons()
        }
    }

    const handleToggleActive = (coupon: Coupon) => {
        updateCoupon(coupon.id, { active: !coupon.active })
        toast.success(`Coupon ${coupon.active ? 'deactivated' : 'activated'}`)
        loadCoupons()
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
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add Coupon</span>
                    </button>
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
            </div>

            {/* Coupon Form Modal */}
            {showForm && (
                <CouponForm
                    coupon={editingCoupon}
                    onClose={handleFormClose}
                />
            )}
        </DashboardWrapper>
    )
}
