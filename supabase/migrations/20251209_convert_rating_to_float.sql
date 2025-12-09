-- ============================================
-- Migration: Convert rating from int4 (0-10) to numeric(2,1) (0.0-5.0)
-- Created: 2025-12-09
-- Description: Converts product ratings to 0-5.0 float scale and sets default value of 3.5
-- ============================================

-- Step 1: Set all products to default rating of 3.5
-- This gives all existing products a reasonable default rating
UPDATE "Product"
SET rating = 3.5;

-- Step 2: Change column type from int4 to numeric(2,1)
-- numeric(2,1) = 2 total digits, 1 decimal place (allows 0.0 to 9.9, we'll constrain to 0.0-5.0)
ALTER TABLE "Product"
ALTER COLUMN rating TYPE numeric(2,1) USING rating::numeric(2,1);

-- Step 3: Set default value for new products
ALTER TABLE "Product"
ALTER COLUMN rating SET DEFAULT 3.5;

-- Step 4: Add constraint to ensure ratings are between 0.0 and 5.0
-- Drop constraint if it already exists (for re-running safety)
ALTER TABLE "Product"
DROP CONSTRAINT IF EXISTS rating_range_check;

ALTER TABLE "Product"
ADD CONSTRAINT rating_range_check CHECK (rating IS NULL OR (rating >= 0.0 AND rating <= 5.0));

-- ============================================
-- Verification Query (uncomment to run)
-- ============================================
-- SELECT id, name, rating, category FROM "Product" ORDER BY rating DESC NULLS LAST LIMIT 10;
