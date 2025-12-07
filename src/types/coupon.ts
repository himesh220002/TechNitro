export interface Coupon {
    id: string
    code: string
    discount: number // percentage
    description: string
    active: boolean
    createdAt: string
    usageCount: number
}

export interface CouponUsage {
    couponCode: string
    userId: string
    usedAt: string
    orderId?: string
}
