/*
  Warnings:

  - You are about to drop the column `model` on the `Component` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[brand,model_number,variant]` on the table `Component` will be added. If there are existing duplicate values, this will fail.
  - Made the column `model_number` on table `Component` required. This step will fail if there are existing NULL values in that column.

*/
-- Step 1: Copy model data to model_number where model_number is NULL
UPDATE "Component" 
SET "model_number" = "model" 
WHERE "model_number" IS NULL;

-- Step 2: Drop old unique constraint
DROP INDEX "Component_brand_model_variant_key";

-- Step 3: Alter table - drop model, make model_number required and VARCHAR(255)
ALTER TABLE "Component" 
DROP COLUMN "model",
ALTER COLUMN "model_number" SET NOT NULL,
ALTER COLUMN "model_number" SET DATA TYPE VARCHAR(255);

-- Step 4: Create new unique constraint
CREATE UNIQUE INDEX "Component_brand_model_number_variant_key" ON "Component"("brand", "model_number", "variant");
