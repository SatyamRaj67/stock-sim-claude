/*
  Warnings:

  - You are about to drop the column `dayHigh` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `dayLow` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `dayOpen` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `jumpMultiplierMax` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `jumpMultiplierMin` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `jumpProbability` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `marketCap` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `randomUpdateActive` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `Stock` table. All the data in the column will be lost.
  - You are about to alter the column `currentPrice` on the `Stock` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `previousPrice` on the `Stock` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `status` on the `Trade` table. All the data in the column will be lost.
  - You are about to drop the `PricePoint` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserStock` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `total` to the `Trade` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Trade` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TradeType" AS ENUM ('BUY', 'SELL');

-- DropForeignKey
ALTER TABLE "PricePoint" DROP CONSTRAINT "PricePoint_stockId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserStock" DROP CONSTRAINT "UserStock_stockId_fkey";

-- DropForeignKey
ALTER TABLE "UserStock" DROP CONSTRAINT "UserStock_userId_fkey";

-- DropIndex
DROP INDEX "Stock_symbol_idx";

-- AlterTable
ALTER TABLE "Stock" DROP COLUMN "dayHigh",
DROP COLUMN "dayLow",
DROP COLUMN "dayOpen",
DROP COLUMN "isActive",
DROP COLUMN "jumpMultiplierMax",
DROP COLUMN "jumpMultiplierMin",
DROP COLUMN "jumpProbability",
DROP COLUMN "marketCap",
DROP COLUMN "randomUpdateActive",
DROP COLUMN "volume",
ALTER COLUMN "currentPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "previousPrice" SET DEFAULT 0,
ALTER COLUMN "previousPrice" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "status",
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "TradeType" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT,
ALTER COLUMN "name" DROP NOT NULL;

-- DropTable
DROP TABLE "PricePoint";

-- DropTable
DROP TABLE "UserStock";

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockHolding" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockHolding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceHistory_stockId_idx" ON "PriceHistory"("stockId");

-- CreateIndex
CREATE INDEX "StockHolding_userId_idx" ON "StockHolding"("userId");

-- CreateIndex
CREATE INDEX "StockHolding_stockId_idx" ON "StockHolding"("stockId");

-- CreateIndex
CREATE UNIQUE INDEX "StockHolding_userId_stockId_key" ON "StockHolding"("userId", "stockId");

-- CreateIndex
CREATE INDEX "Trade_userId_idx" ON "Trade"("userId");

-- CreateIndex
CREATE INDEX "Trade_stockId_idx" ON "Trade"("stockId");

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHolding" ADD CONSTRAINT "StockHolding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockHolding" ADD CONSTRAINT "StockHolding_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
