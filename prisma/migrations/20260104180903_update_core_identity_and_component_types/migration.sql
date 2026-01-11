/*
  Warnings:

  - You are about to drop the column `brand` on the `Component` table. All the data in the column will be lost.
  - You are about to drop the column `product_page` on the `Component` table. All the data in the column will be lost.
  - You are about to drop the column `variant` on the `Component` table. All the data in the column will be lost.
  - You are about to drop the `Cooler` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Cpu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Gpu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Psu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Storage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[manufacturer,model_number,model_name]` on the table `Component` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `manufacturer` to the `Component` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model_name` to the `Component` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cooler" DROP CONSTRAINT "Cooler_componentId_fkey";

-- DropForeignKey
ALTER TABLE "Cpu" DROP CONSTRAINT "Cpu_componentId_fkey";

-- DropForeignKey
ALTER TABLE "Gpu" DROP CONSTRAINT "Gpu_componentId_fkey";

-- DropForeignKey
ALTER TABLE "Psu" DROP CONSTRAINT "Psu_componentId_fkey";

-- DropForeignKey
ALTER TABLE "Storage" DROP CONSTRAINT "Storage_componentId_fkey";

-- DropIndex
DROP INDEX "Component_brand_model_number_variant_key";

-- AlterTable
ALTER TABLE "Component" DROP COLUMN "brand",
DROP COLUMN "product_page",
DROP COLUMN "variant",
ADD COLUMN     "manufacturer" VARCHAR(255) NOT NULL,
ADD COLUMN     "model_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "product_page_url" TEXT;

-- DropTable
DROP TABLE "Cooler";

-- DropTable
DROP TABLE "Cpu";

-- DropTable
DROP TABLE "Gpu";

-- DropTable
DROP TABLE "Psu";

-- DropTable
DROP TABLE "Storage";

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Processor" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "socket" TEXT NOT NULL,
    "cores" INTEGER NOT NULL,
    "threads" INTEGER NOT NULL,
    "base_clock" DOUBLE PRECISION NOT NULL,
    "boost_clock" DOUBLE PRECISION NOT NULL,
    "tdp_watts" INTEGER NOT NULL,
    "integrated_gpu" BOOLEAN NOT NULL DEFAULT false,
    "includes_cooler" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Processor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraphicsCard" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "chipset" TEXT NOT NULL,
    "vram_gb" INTEGER NOT NULL,
    "length_mm" INTEGER NOT NULL,
    "tdp_watts" INTEGER NOT NULL,
    "recommended_psu" INTEGER NOT NULL,

    CONSTRAINT "GraphicsCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PowerSupply" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "wattage" INTEGER NOT NULL,
    "efficiency" TEXT,
    "modular" TEXT,

    CONSTRAINT "PowerSupply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CpuCooler" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sockets" TEXT[],
    "height_mm" INTEGER,
    "radiator_size" INTEGER,

    CONSTRAINT "CpuCooler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ssd" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "capacity_gb" INTEGER NOT NULL,
    "interface" TEXT NOT NULL,
    "form_factor" TEXT NOT NULL,
    "gen" TEXT,

    CONSTRAINT "Ssd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hdd" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "capacity_gb" INTEGER NOT NULL,
    "rpm" INTEGER NOT NULL,
    "cache_mb" INTEGER NOT NULL,
    "form_factor" TEXT NOT NULL,

    CONSTRAINT "Hdd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monitor" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "size_inches" DOUBLE PRECISION NOT NULL,
    "resolution" TEXT NOT NULL,
    "refresh_rate" INTEGER NOT NULL,
    "panel_type" TEXT,
    "response_time" INTEGER,

    CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyboard" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "switch_type" TEXT,
    "layout" TEXT NOT NULL,
    "backlit" BOOLEAN NOT NULL DEFAULT false,
    "wireless" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Keyboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mouse" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "dpi" INTEGER,
    "sensor_type" TEXT,
    "wireless" BOOLEAN NOT NULL DEFAULT false,
    "buttons" INTEGER,

    CONSTRAINT "Mouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Headset" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "driver_size" INTEGER,
    "impedance" INTEGER,
    "frequency_response" TEXT,
    "wireless" BOOLEAN NOT NULL DEFAULT false,
    "noise_cancellation" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Headset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdditionalCaseFans" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "size_mm" INTEGER NOT NULL,
    "speed_rpm" INTEGER,
    "noise_level" DOUBLE PRECISION,
    "airflow_cfm" DOUBLE PRECISION,

    CONSTRAINT "AdditionalCaseFans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Processor_componentId_key" ON "Processor"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "GraphicsCard_componentId_key" ON "GraphicsCard"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "PowerSupply_componentId_key" ON "PowerSupply"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "CpuCooler_componentId_key" ON "CpuCooler"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Ssd_componentId_key" ON "Ssd"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Hdd_componentId_key" ON "Hdd"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Monitor_componentId_key" ON "Monitor"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Keyboard_componentId_key" ON "Keyboard"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Mouse_componentId_key" ON "Mouse"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Headset_componentId_key" ON "Headset"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalCaseFans_componentId_key" ON "AdditionalCaseFans"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "Component_manufacturer_model_number_model_name_key" ON "Component"("manufacturer", "model_number", "model_name");

-- AddForeignKey
ALTER TABLE "Processor" ADD CONSTRAINT "Processor_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraphicsCard" ADD CONSTRAINT "GraphicsCard_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerSupply" ADD CONSTRAINT "PowerSupply_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CpuCooler" ADD CONSTRAINT "CpuCooler_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ssd" ADD CONSTRAINT "Ssd_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hdd" ADD CONSTRAINT "Hdd_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monitor" ADD CONSTRAINT "Monitor_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyboard" ADD CONSTRAINT "Keyboard_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mouse" ADD CONSTRAINT "Mouse_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Headset" ADD CONSTRAINT "Headset_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalCaseFans" ADD CONSTRAINT "AdditionalCaseFans_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Component"("id") ON DELETE CASCADE ON UPDATE CASCADE;
