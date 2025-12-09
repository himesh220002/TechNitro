-- Create Notifications table for real-time user notifications
CREATE TABLE IF NOT EXISTS "public"."Notification" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL, -- order_placed, shipped, delivered, cancelled, out_for_delivery, refund_initiated, payment_failed, return_requested, promotion
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "orderId" UUID,
    "productId" UUID,
    "metadata" JSONB, -- Additional data like tracking number, refund amount, etc.
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMPTZ(6)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "public"."Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "Notification_createdAt_idx" ON "public"."Notification"("createdAt" DESC);

-- Create NotificationPreferences table
CREATE TABLE IF NOT EXISTS "public"."NotificationPreference" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL UNIQUE,
    "orderPlaced" BOOLEAN DEFAULT true,
    "shipped" BOOLEAN DEFAULT true,
    "delivered" BOOLEAN DEFAULT true,
    "cancelled" BOOLEAN DEFAULT true,
    "outForDelivery" BOOLEAN DEFAULT true,
    "refundInitiated" BOOLEAN DEFAULT true,
    "paymentFailed" BOOLEAN DEFAULT true,
    "returnRequested" BOOLEAN DEFAULT true,
    "promotions" BOOLEAN DEFAULT true,
    "emailNotifications" BOOLEAN DEFAULT true,
    "pushNotifications" BOOLEAN DEFAULT true,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP
);

-- Create index
CREATE INDEX IF NOT EXISTS "NotificationPreference_userId_idx" ON "public"."NotificationPreference"("userId");

-- Comments
COMMENT ON TABLE "public"."Notification" IS 'User notifications for orders, promotions, and system events';
COMMENT ON TABLE "public"."NotificationPreference" IS 'User notification preferences and settings';
