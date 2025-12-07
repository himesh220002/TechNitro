'use client'

import { useState, useEffect } from 'react'
import { Coupon } from '@/types/coupon'
import { addCoupon, updateCoupon } from '@/lib/coupons'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CouponFormProps {
    coupon: Coupon | null
    onClose: () => void
}

export default function CouponForm({ coupon, onClose }: CouponFormProps) {
    const [formData, setFormData] = useState({
        code: '',
        discount: 5,
        description: '',
        active: true
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code,
                discount: coupon.discount,
                description: coupon.description,
                active: coupon.active
            })
        }
    }, [coupon])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (coupon) {
                // Update existing coupon
                updateCoupon(coupon.id, formData)
                toast.success('Coupon updated successfully!')
            } else {
                // Add new coupon
                addCoupon(formData)
                toast.success('Coupon created successfully!')
            }
            onClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save coupon')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {coupon ? 'Edit Coupon' : 'Create Coupon'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Coupon Code */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Coupon Code *
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., SUMMER20"
                            required
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none font-mono"
                        />
                    </div>

                    {/* Discount Percentage */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Discount Percentage *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                            required
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="e.g., Summer sale discount"
                            required
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-purple-600 focus:ring-2 focus:ring-purple-500"
                        />
                        <label htmlFor="active" className="text-sm text-gray-300">
                            Active (users can use this coupon)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : coupon ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
