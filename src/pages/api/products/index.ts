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
import { supabaseAdmin } from '@/lib/admin-supabase-server'   // service-role client (backend only)
import { nanoid } from 'nanoid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ---------------------------------------------------------------
  // GET  → Fetch all products
  // ---------------------------------------------------------------
  if (req.method === 'GET') {
    const { data, error } = await supabaseAdmin
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

  // POST FIXED ⚡
   if (req.method === 'POST') {
    try {
      const body = req.body

      // normalize images
      const images = Array.isArray(body.images)
        ? body.images
        : body.images
        ? [body.images]
        : []

      const imageUrl = body.imageUrl || images[0] || null

      // 🔥 FIX specs parsing (avoids 500)
      const safeSpecs =
        typeof body.specs === "string"
          ? JSON.parse(body.specs || "{}")
          : body.specs || {}

      const payload = {
        id: nanoid(),
        name: body.name,
        slug: body.slug,
        description: body.description || "",
        category: body.category || "general",

        price: Number(body.price),
        inventory: Number(body.inventory),
        rating: body.rating ? Number(body.rating) : null,

        specs: safeSpecs,
        images,
        imageUrl,

        lastUpdated: new Date().toISOString(),
      };


      const { data, error } = await supabaseAdmin
        .from("Product")
        .insert([payload])
        .select("*")
        .single()

      if (error) {
        console.error("Insert failed", error)
        return res.status(500).json({ error: "Insert failed", details: error.message })
      }

      return res.status(201).json({
        message: "Product added successfully",
        product: data,
      })
    } catch (err) {
      console.error("POST /api/products error:", err)
      return res.status(500).json({ error: "Internal error" })
    }
  }

  res.status(405).json({ error: "Method not allowed" })
}
