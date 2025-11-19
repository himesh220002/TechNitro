// //src/pages/api/products/index.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// // import fs from 'fs'
// // import path from 'path'
// // import { nanoid } from 'nanoid'
// // const filePath = path.join(process.cwd(), 'src/data/products.json')

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();


// // import supabase from '@/lib/supabase';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'GET') {
//     // const raw = fs.readFileSync(filePath, 'utf-8')
//     // const products = JSON.parse(raw)
//     try {
//   const products = await prisma.product.findMany();
//   // const products = await supabase
//       // .from('Product')
//       // .select('*')
//   res.status(200).json(products);
// } catch (error) {
//   res.status(500).json({ error: 'Failed to fetch products' , details: error } );
// }

//   }

// //   if (req.method === 'POST') {
// //     const raw = fs.readFileSync(filePath, 'utf-8')
// //     const products = JSON.parse(raw)

// //     const newProduct = {
// //       ...req.body,
// //       id: nanoid(),
// //     }

// //     const updated = [...products, newProduct]
// //     fs.writeFileSync(filePath, JSON.stringify(updated, null, 2))
// //     return res.status(201).json({ message: 'Product added', product: newProduct })
// //   }

//    if (req.method === 'POST') {
//     const images = Array.isArray(req.body.images) ? req.body.images : req.body.images ? [req.body.images] : []
//     const imageUrl = req.body.imageUrl || (images.length ? images[0] : null)

//     const newProduct = await prisma.product.create({
//       data: {
//         ...req.body,
//         price: Number(req.body.price),
//         inventory: Number(req.body.inventory),
//         rating: req.body.rating ? Number(req.body.rating) : null,
//         specs: req.body.specs ? req.body.specs : {},
//         images: images.length ? images : undefined,
//         imageUrl: imageUrl ?? undefined,
//         lastUpdated: new Date(),
//       },
//     })
//     return res.status(201).json({ message: 'Product added', product: newProduct })
//   }

//   res.status(405).json({ error: 'Method not allowed' })
// }


// src/pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import supabaseServer from '@/lib/supabase-server'   // service-role client (backend only)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ---------------------------------------------------------------
  // GET  → Fetch all products
  // ---------------------------------------------------------------
  if (req.method === 'GET') {
    const { data, error } = await supabaseServer
      .from('Product')
      .select('*')

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch products',
        details: error.message,
      })
    }

    return res.status(200).json(data)
  }

  // ---------------------------------------------------------------
  // POST  → Create new product
  // ---------------------------------------------------------------
  if (req.method === 'POST') {
    const body = req.body

    // normalize values
    const images = Array.isArray(body.images)
      ? body.images
      : body.images
      ? [body.images]
      : []

    const imageUrl = body.imageUrl || (images.length ? images[0] : null)

    const payload = {
      name: body.name,
      slug: body.slug,
      price: Number(body.price),
      inventory: Number(body.inventory),
      rating: body.rating ? Number(body.rating) : null,
      specs: body.specs || {},
      images: images ?? [],
      imageUrl: imageUrl ?? null,
      lastUpdated: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer
      .from('Product')
      .insert([payload])
      .select('*')
      .single()

    if (error) {
      return res.status(500).json({
        error: 'Failed to create product',
        details: error.message,
      })
    }

    return res.status(201).json({
      message: 'Product added successfully',
      product: data,
    })
  }

  // ---------------------------------------------------------------
  // NOT ALLOWED
  // ---------------------------------------------------------------
  return res.status(405).json({ error: 'Method not allowed' })
}
