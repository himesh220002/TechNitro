-- Create Review table
CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "userName" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;

-- Create Policy: Everyone can view reviews
CREATE POLICY "Everyone can view reviews" ON "Review"
    FOR SELECT
    USING (true);

-- Create Policy: Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON "Review"
    FOR INSERT
    WITH CHECK (auth.uid() = "userId");

-- Create Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON "Review"
    FOR UPDATE
    USING (auth.uid() = "userId");

-- Create Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON "Review"
    FOR DELETE
    USING (auth.uid() = "userId");
