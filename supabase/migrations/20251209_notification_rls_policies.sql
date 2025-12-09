-- Enable Row Level Security on Notification and NotificationPreference tables
ALTER TABLE "public"."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."NotificationPreference" ENABLE ROW LEVEL SECURITY;

-- Notification Policies
-- Users can only read their own notifications
CREATE POLICY "Users can view own notifications"
ON "public"."Notification"
FOR SELECT
USING (auth.uid()::text = "userId");

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON "public"."Notification"
FOR UPDATE
USING (auth.uid()::text = "userId");

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON "public"."Notification"
FOR DELETE
USING (auth.uid()::text = "userId");

-- Service role can insert notifications (for backend)
CREATE POLICY "Service role can insert notifications"
ON "public"."Notification"
FOR INSERT
WITH CHECK (true);

-- NotificationPreference Policies
-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
ON "public"."NotificationPreference"
FOR SELECT
USING (auth.uid()::text = "userId");

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON "public"."NotificationPreference"
FOR UPDATE
USING (auth.uid()::text = "userId");

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON "public"."NotificationPreference"
FOR INSERT
WITH CHECK (auth.uid()::text = "userId");

-- Service role can manage all preferences (for backend)
CREATE POLICY "Service role can manage preferences"
ON "public"."NotificationPreference"
FOR ALL
USING (true);
