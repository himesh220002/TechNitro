-- Add admin_rating column to Product table
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "admin_rating" DOUBLE PRECISION DEFAULT 0;

-- Add review_count column to Product table if it doesn't exist
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "review_count" INTEGER DEFAULT 0;

-- Optional: Update admin_rating with existing rating for products with no reviews
-- This assumes current rating is the "admin rating" if review_count is 0 or null
UPDATE "Product"
SET "admin_rating" = "rating"
WHERE "review_count" = 0 OR "review_count" IS NULL;
