// src/pages/api/products/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      await prisma.product.delete({ where: { id: String(id) } })
      return res.status(204).end()
    } catch (error) {
      console.error('Delete failed:', error)
      return res.status(500).json({ error: 'Delete failed' })
    }
  }

  if (req.method === 'PUT') {
    const { name, price, category, description, inventory, imageUrl, specs, rating, images } = req.body
    try {
      const imgs = Array.isArray(images) ? images : images ? [images] : []
      const cover = imageUrl || (imgs.length ? imgs[0] : null)

  // Use a transient cast on prisma client to avoid type mismatch until prisma client is regenerated
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- transient cast until prisma client is regenerated after schema change
  const updated = await (prisma as any).product.update({
        where: { id: String(id) },
        data: {
          name,
          price,
          category,
          description,
          inventory,
          imageUrl: cover ?? undefined,
          images: imgs.length ? imgs : undefined,
          specs: specs ?? {},
          rating: rating ?? null,
        },
      })
      return res.status(200).json(updated)
    } catch (error) {
      console.error('Update failed:', error)
      return res.status(500).json({ error: 'Update failed' })
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
