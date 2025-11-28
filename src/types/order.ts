// ─────────────────────────────────────────────
// Core Order Types
// ─────────────────────────────────────────────

export type PaymentResultStatus =
  | "success"
  | "cancelled"
  | "pending"
  | null

export type OrderStatus =
  | "Order Placed"
  | "Order Confirmed"
  | "Cancelled"
  | "Pending"
  | "Paid"           // optional if you use it
  | string          // fallback for future expansions

export type Order = {
  id: string
  user_id: string

  accountName: string
  accountNumber: string
  phone: string
  address: string
  pin: string

  paymentMethod: string
  payment: number
  deliveryCharge: number

  orderStatus: OrderStatus
  paymentResult: PaymentResultStatus

  created_at: string

  products: ProductInOrder[]
  shippingEvents?: ShippingEvent[]

  // Razorpay specific
  paymentid?: string | null
  razorpayorderid?: string | null
  signature?: string | null
}


// ─────────────────────────────────────────────
// Product Snapshot inside Order
// ─────────────────────────────────────────────

export type ProductInOrder = {
  id: string
  name: string
  slug: string
  price: number
  category: string
  imageUrl: string

  quantity: number
  inventory: number

  created_at: string
  description: string
  lastUpdated: string
}


// ─────────────────────────────────────────────
// Shipping System (Legacy + New System)
// ─────────────────────────────────────────────

// Legacy (still supported)
export type ShippingEvent = {
  location: string
  status: "active" | "inactive"
  visible: boolean
  timestamp: string
  mode?: "train" | "flight" | "truck"
}

// Improved tracking system
export type TransportMode = "train" | "flight" | "truck"

export type FullRouteCheckpoint = {
  checkpointName: string
  index?: number

  received?: { timestamp: string } | null
  arrived?: { timestamp: string } | null
  departed?: { timestamp: string; mode?: TransportMode } | null

  visible?: boolean
}

export type CheckpointPatch = {
  checkpointName: string
  action: "received" | "arrived" | "departed"
  timestamp: string
  mode?: TransportMode
}


// ─────────────────────────────────────────────
// Razorpay Handler Result
// ─────────────────────────────────────────────

export type RazorpayHandlerResponse = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}


// ─────────────────────────────────────────────
// Payment Update DTO (Client → API → DB)
// ─────────────────────────────────────────────

export type OrderPaymentUpdate = {
  orderId: string

  paymentResult: PaymentResultStatus

  // DB columns: paymentid, razorpayorderid, signature
  paymentid: string | null
  razorpayorderid: string | null
  signature: string | null
}


// structure - 
// _________________________
// Order
//  ├── Basic user + address info
//  ├── Payment info
//  │    ├── paymentResult (typed union)
//  │    ├── orderStatus   (typed union)
//  │    ├── paymentid
//  │    ├── razorpayorderid
//  │    └── signature
//  ├── Product snapshot
//  └── Shipping (legacy + new system)
