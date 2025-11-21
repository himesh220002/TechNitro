// src/pages/api/orders/[id].ts=
import type { NextApiRequest, NextApiResponse } from "next"
import { supabaseAdmin } from "@/lib/admin-supabase-server"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return res.status(404).json({ error: error.message })

  return res.status(200).json(data)
}

