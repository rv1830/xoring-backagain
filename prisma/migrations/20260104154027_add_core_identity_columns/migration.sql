-- AlterTable
ALTER TABLE "Component" ADD COLUMN     "discounted_price" DECIMAL(10,2),
ADD COLUMN     "manufacturer" VARCHAR(255),
ADD COLUMN     "model_name" VARCHAR(255),
ADD COLUMN     "model_number" VARCHAR(100),
ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "vendor" VARCHAR(255);

-- CreateTable
CREATE TABLE "CompatibilityRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "appliesTo" TEXT[],
    "logic" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompatibilityRule_pkey" PRIMARY KEY ("id")
);
