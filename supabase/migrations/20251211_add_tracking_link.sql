-- Add tracking_link column to orders table for live location tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_link TEXT;

-- Add comment
COMMENT ON COLUMN orders.tracking_link IS 'Google Maps share link for live delivery tracking';
