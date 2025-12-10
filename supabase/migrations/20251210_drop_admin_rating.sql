-- Drop admin_rating column from Product table
ALTER TABLE "Product" DROP COLUMN IF EXISTS "admin_rating";

-- Ensure review_count defaults to 0 if null
UPDATE "Product" SET "review_count" = 0 WHERE "review_count" IS NULL;
