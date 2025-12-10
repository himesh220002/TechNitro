-- Update Product table with actual average ratings and review counts from Review table
UPDATE "Product" p
SET 
  "rating" = COALESCE((
    SELECT ROUND(AVG(r.rating)::numeric, 1)
    FROM "Review" r 
    WHERE r."productId" = p.id
  ), 0),
  "review_count" = (
    SELECT COUNT(*) 
    FROM "Review" r 
    WHERE r."productId" = p.id
  );
