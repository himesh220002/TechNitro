//src/pages/api/products/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
// import fs from 'fs'
// import path from 'path'
// import { nanoid } from 'nanoid'
// const filePath = path.join(process.cwd(), 'src/data/products.json')

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // const raw = fs.readFileSync(filePath, 'utf-8')
    // const products = JSON.parse(raw)
    try {
  const products = await prisma.product.findMany();
  res.status(200).json(products);
} catch (error) {
  res.status(500).json({ error: 'Failed to fetch products' , details: error } );
}

  }

//   if (req.method === 'POST') {
//     const raw = fs.readFileSync(filePath, 'utf-8')
//     const products = JSON.parse(raw)

//     const newProduct = {
//       ...req.body,
//       id: nanoid(),
//     }

//     const updated = [...products, newProduct]
//     fs.writeFileSync(filePath, JSON.stringify(updated, null, 2))
//     return res.status(201).json({ message: 'Product added', product: newProduct })
//   }

   if (req.method === 'POST') {
    const images = Array.isArray(req.body.images) ? req.body.images : req.body.images ? [req.body.images] : []
    const imageUrl = req.body.imageUrl || (images.length ? images[0] : null)

    const newProduct = await prisma.product.create({
      data: {
        ...req.body,
        price: Number(req.body.price),
        inventory: Number(req.body.inventory),
        rating: req.body.rating ? Number(req.body.rating) : null,
        specs: req.body.specs ? req.body.specs : {},
        images: images.length ? images : undefined,
        imageUrl: imageUrl ?? undefined,
        lastUpdated: new Date(),
      },
    })
    return res.status(201).json({ message: 'Product added', product: newProduct })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
