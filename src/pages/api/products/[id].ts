// src/pages/api/products/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@/lib/admin-supabase-server"
// ⚠ using service role key for full access (DELETE, UPDATE)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing product ID" });

  // DELETE PRODUCT
  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin
      .from("Product")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete failed:", error);
      return res.status(500).json({ error: "Delete failed", details: error });
    }

    return res.status(204).end();
  }

  // UPDATE PRODUCT
  if (req.method === "PUT") {
    const {
      name, price, category, description,
      inventory, imageUrl, specs, rating, images,
    } = req.body;

    const imgs = Array.isArray(images) ? images : images ? [images] : [];
    const cover = imageUrl || (imgs.length ? imgs[0] : null);

    const { data, error } = await supabaseAdmin
      .from("Product")
      .update({
        name,
        price: Number(price),
        category,
        description,
        inventory: Number(inventory),
        imageUrl: cover ?? null,
        images: imgs.length ? imgs : null,
        specs: specs ?? {},
        rating: rating ? Number(rating) : null,
        lastUpdated: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update failed:", error);
      return res.status(500).json({ error: "Update failed", details: error });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
