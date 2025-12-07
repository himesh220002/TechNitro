import { Coupon, CouponUsage } from '@/types/coupon'
import { v4 as uuidv4 } from 'uuid'

const COUPONS_KEY = 'coupons'
const COUPON_USAGE_KEY = 'couponUsage'

// Predefined coupons
const PREDEFINED_COUPONS: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>[] = [
    { code: 'BETTERDEAL5', discount: 5, description: 'Get 5% off on your order', active: true },
    { code: 'FAMILYOFFER5', discount: 5, description: 'Family special - 5% discount', active: true },
    { code: 'STUDENTSPECIAL10', discount: 10, description: 'Student discount - 10% off', active: true },
    { code: 'DIFFUSIONSPECIAL8', discount: 8, description: 'Diffusion special - 8% discount', active: true },
    { code: 'WORKSALLTHETIME5', discount: 5, description: 'Always works - 5% off', active: true },
]

// Initialize coupons in localStorage
export function initializeCoupons(): void {
    const existing = localStorage.getItem(COUPONS_KEY)
    if (!existing) {
        const coupons: Coupon[] = PREDEFINED_COUPONS.map(coupon => ({
            ...coupon,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
            usageCount: 0
        }))
        localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons))
    }
}

// Get all coupons
export function getCoupons(): Coupon[] {
    initializeCoupons()
    const coupons = localStorage.getItem(COUPONS_KEY)
    return coupons ? JSON.parse(coupons) : []
}

// Get coupon by code
export function getCouponByCode(code: string): Coupon | null {
    const coupons = getCoupons()
    return coupons.find(c => c.code.toUpperCase() === code.toUpperCase()) || null
}

// Get coupon usage history
export function getCouponUsage(): CouponUsage[] {
    const usage = localStorage.getItem(COUPON_USAGE_KEY)
    return usage ? JSON.parse(usage) : []
}

// Check if user has used a coupon
export function hasUserUsedCoupon(couponCode: string, userId: string): boolean {
    const usage = getCouponUsage()
    return usage.some(u => u.couponCode.toUpperCase() === couponCode.toUpperCase() && u.userId === userId)
}

// Validate coupon
export function validateCoupon(code: string, userId: string): { valid: boolean; message: string; coupon?: Coupon } {
    if (!code || code.trim() === '') {
        return { valid: false, message: 'Please enter a coupon code' }
    }

    const coupon = getCouponByCode(code)

    if (!coupon) {
        return { valid: false, message: 'Invalid coupon code' }
    }

    if (!coupon.active) {
        return { valid: false, message: 'This coupon is no longer active' }
    }

    if (hasUserUsedCoupon(code, userId)) {
        return { valid: false, message: 'You have already used this coupon' }
    }

    return { valid: true, message: 'Coupon applied successfully!', coupon }
}

// Apply coupon and track usage
export function applyCouponToOrder(couponCode: string, userId: string, orderId?: string): void {
    const usage: CouponUsage = {
        couponCode: couponCode.toUpperCase(),
        userId,
        usedAt: new Date().toISOString(),
        orderId
    }

    const allUsage = getCouponUsage()
    allUsage.push(usage)
    localStorage.setItem(COUPON_USAGE_KEY, JSON.stringify(allUsage))

    // Increment usage count
    const coupons = getCoupons()
    const updatedCoupons = coupons.map(c =>
        c.code.toUpperCase() === couponCode.toUpperCase()
            ? { ...c, usageCount: c.usageCount + 1 }
            : c
    )
    localStorage.setItem(COUPONS_KEY, JSON.stringify(updatedCoupons))
}

// Add new coupon
export function addCoupon(coupon: Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>): Coupon {
    const coupons = getCoupons()

    // Check if code already exists
    if (coupons.some(c => c.code.toUpperCase() === coupon.code.toUpperCase())) {
        throw new Error('Coupon code already exists')
    }

    const newCoupon: Coupon = {
        ...coupon,
        code: coupon.code.toUpperCase(),
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        usageCount: 0
    }

    coupons.push(newCoupon)
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons))
    return newCoupon
}

// Update coupon
export function updateCoupon(id: string, updates: Partial<Omit<Coupon, 'id' | 'createdAt' | 'usageCount'>>): Coupon {
    const coupons = getCoupons()
    const index = coupons.findIndex(c => c.id === id)

    if (index === -1) {
        throw new Error('Coupon not found')
    }

    // If updating code, check for duplicates
    if (updates.code) {
        const codeExists = coupons.some(c => c.id !== id && c.code.toUpperCase() === updates.code!.toUpperCase())
        if (codeExists) {
            throw new Error('Coupon code already exists')
        }
        updates.code = updates.code.toUpperCase()
    }

    const updatedCoupon = { ...coupons[index], ...updates }
    coupons[index] = updatedCoupon
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons))
    return updatedCoupon
}

// Delete coupon
export function deleteCoupon(id: string): void {
    const coupons = getCoupons()
    const filtered = coupons.filter(c => c.id !== id)
    localStorage.setItem(COUPONS_KEY, JSON.stringify(filtered))
}

// Get coupon statistics
export function getCouponStats() {
    const coupons = getCoupons()
    const usage = getCouponUsage()

    return {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter(c => c.active).length,
        totalUsage: usage.length,
        mostUsedCoupon: coupons.reduce((max, c) => c.usageCount > (max?.usageCount || 0) ? c : max, coupons[0])
    }
}
