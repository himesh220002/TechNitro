// src/pages/api/test-product.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import supabaseServer from '@/lib/supabase-server'
// import supabase from '@/lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔵 API HIT:", req.method)

  if (req.method === 'GET') {
    const { data, error } = await supabaseServer
    // const { data, error } = await supabase
      .from('Product')
      .select('*')

    console.log("🔵 DATA:", data)
    console.log("🔴 ERROR:", error)

    if (error) {
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
