interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name?: string
  description?: string
  order_id: string
  handler: (response: RazorpayResponse) => void
  capture?: boolean  
  modal?: {
    ondismiss?: () => void
  }
  prefill?: {
    name?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open(): void
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance
}

interface Window {
  Razorpay: RazorpayConstructor
}
