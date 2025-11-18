import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.product.createMany({
    data: [

      {
    name: 'Apple iPad Pro 11" 256GB',
    slug: 'ipad-pro-11-256gb',
    description: '11-inch Liquid Retina tablet with M2 chip, 256GB storage, and Apple Pencil support.',
    price: 89900,
    category: 'Tablets',
    inventory: 67,
    imageUrl: '',
    rating: 5,
    specs: {
      battery: '10h',
      connectivity: 'Wi-Fi + Bluetooth',
      weight: '466g',
    },
  },
  {
    name: 'Apple iPhone 17 Pro 256GB',
    slug: 'iphone-17-pro-256gb',
    description: 'Flagship smartphone with A19 Bionic chip, 256GB storage, and ProMotion O-LED display.',
    price: 129900,
    category: 'Smartphones',
    inventory: 42,
    imageUrl: '',
    rating: 5,
    specs: {
      battery: '4500mAh',
      connectivity: '5G + Wi-Fi 6E',
      weight: '206g',
    },
  },
  {
    name: 'Acer Nitro V 15 Intel 16GB',
    slug: 'acer-nitro-v15-intel',
    description: '15.6" FHD gaming laptop with Intel Core i7, 16GB RAM, RTX graphics, and fast SSD.',
    price: 74990,
    category: 'Laptops',
    inventory: 58,
    imageUrl: '',
    rating: 4,
    specs: {
      battery: 'Unknown',
      connectivity: 'Wi-Fi 6',
      weight: '2.3kg',
    },
  },
  
  

    ],
  })

  console.log('✅ Seeded products successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
