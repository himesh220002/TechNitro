-- Create support messages table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin_reply BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_by_admin BOOLEAN DEFAULT FALSE
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_messages_order_id ON support_messages(order_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_unread ON support_messages(read_by_admin) WHERE read_by_admin = FALSE;

-- Add RLS policies
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own messages" ON support_messages
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert own messages" ON support_messages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Add comment
COMMENT ON TABLE support_messages IS 'Customer support chat messages for order tracking';
