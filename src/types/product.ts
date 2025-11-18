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

  rating?: number
  specs?: Record<string, string>

}
