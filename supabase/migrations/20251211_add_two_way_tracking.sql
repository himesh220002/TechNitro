-- Add two-way tracking and delivery agent information
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_tracking_link TEXT,
ADD COLUMN IF NOT EXISTS delivery_agent_name TEXT,
ADD COLUMN IF NOT EXISTS delivery_agent_phone TEXT;

-- Add index for faster queries on customer tracking
CREATE INDEX IF NOT EXISTS idx_orders_customer_tracking ON orders(customer_tracking_link);

-- Add comment for documentation
COMMENT ON COLUMN orders.customer_tracking_link IS 'Google Maps live location link shared by customer';
COMMENT ON COLUMN orders.delivery_agent_name IS 'Name of delivery agent or company (e.g., Rajesh Kumar, BlueDart)';
COMMENT ON COLUMN orders.delivery_agent_phone IS 'Contact phone number for delivery agent or company';
