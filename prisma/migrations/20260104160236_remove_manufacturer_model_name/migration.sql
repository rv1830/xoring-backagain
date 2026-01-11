/*
  Warnings:

  - You are about to drop the column `manufacturer` on the `Component` table. All the data in the column will be lost.
  - You are about to drop the column `model_name` on the `Component` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Component" DROP COLUMN "manufacturer",
DROP COLUMN "model_name";
