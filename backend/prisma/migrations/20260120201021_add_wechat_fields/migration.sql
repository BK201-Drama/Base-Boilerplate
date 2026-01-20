-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "wechatOpenId" TEXT,
ADD COLUMN IF NOT EXISTS "wechatUnionId" TEXT,
ADD COLUMN IF NOT EXISTS "wechatNickname" TEXT,
ADD COLUMN IF NOT EXISTS "wechatAvatar" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_wechatOpenId_key" ON "users"("wechatOpenId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_wechatOpenId_idx" ON "users"("wechatOpenId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_wechatUnionId_idx" ON "users"("wechatUnionId");

-- AlterTable
ALTER TABLE "operation_logs" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows
UPDATE "operation_logs" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- AlterTable (make updatedAt use @updatedAt behavior)
-- Note: Prisma will handle @updatedAt automatically, but we need to ensure the column exists
ALTER TABLE "operation_logs" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
