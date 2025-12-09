//types/product.ts
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  inventory: number
  imageUrl?: string
  images?: string[]
  lastUpdated: string

  /** Product rating on a scale of 0.0 to 5.0 with 1 decimal precision */
  rating?: number
  specs?: Record<string, string>

}
