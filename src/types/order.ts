// src/types/order.ts
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
  paymentStatus: string
  paymentResult: string | null
  created_at: string
  products: {
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
  }[]
  shippingEvents?: ShippingEvent[]
}

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

export type ShippingEvent = {
  location: string
  status: 'active' | 'inactive'
  visible: boolean
  timestamp: string
    mode?: 'train' | 'flight' | 'truck'
  }

// New, richer checkpoint shape for full-route shipping management.
// Keep the old `ShippingEvent` for backward-compatibility but prefer `FullRouteCheckpoint` in new code.
export type TransportMode = 'train' | 'flight' | 'truck'

export type FullRouteCheckpoint = {
  checkpointName: string
  index?: number
  // events are optional and can be set independently by admin
  received?: { timestamp: string } | null
  arrived?: { timestamp: string } | null
  departed?: { timestamp: string; mode?: TransportMode } | null
  visible?: boolean
}

// Patch object accepted by the update-shipping-events API when updating a single checkpoint
export type CheckpointPatch = {
  checkpointName: string
  action: 'received' | 'arrived' | 'departed'
  timestamp: string
  mode?: TransportMode
}