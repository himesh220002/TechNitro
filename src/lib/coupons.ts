
import { Coupon } from '@/types/coupon'

// Initialize coupons - No-op for server-side
export function initializeCoupons(): void { }

// Get all coupons (Admin)
export async function getCoupons(): Promise<Coupon[]> {
    const res = await fetch('/api/admin/coupons')
    if (!res.ok) throw new Error('Failed to fetch coupons')
    return res.json()
}

// Add new coupon (Admin)
export async function addCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>): Promise<Coupon> {
    const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create coupon')
    }
    return res.json()
}

// Update coupon (Admin)
export async function updateCoupon(id: string, updates: Partial<Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>>): Promise<Coupon> {
    const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update coupon')
    }
    return res.json()
}

// Delete coupon (Admin)
export async function deleteCoupon(id: string): Promise<void> {
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete coupon')
}

// Validate coupon (Public)
export async function validateCoupon(code: string, userId: string): Promise<{ valid: boolean; message: string; coupon?: Coupon }> {
    const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, userId })
    })
    return res.json()
}

// Apply coupon usage (Public/System)
export async function applyCouponToOrder(couponCode: string, userId: string, orderId?: string): Promise<void> {
    await fetch('/api/coupons/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode, userId, orderId })
    })
}

// Get coupon statistics (Admin)
export async function getCouponStats() {
    // We can fetch coupons and calculate stats client-side or add a specific stats API.
    // reuse getCoupons for simplicity
    const coupons = await getCoupons()

    return {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter(c => c.active).length,
        totalUsage: coupons.reduce((acc, c) => acc + (c.usageCount || 0), 0),
        mostUsedCoupon: coupons.reduce((max, c) => (c.usageCount || 0) > (max?.usageCount || 0) ? c : max, coupons[0] || null)
    }
}
