-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currentPrice" DECIMAL(65,30) NOT NULL,
    "previousPrice" DECIMAL(65,30) NOT NULL,
    "dayHigh" DECIMAL(65,30) NOT NULL,
    "dayLow" DECIMAL(65,30) NOT NULL,
    "dayOpen" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL DEFAULT 0,
    "marketCap" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "randomUpdateActive" BOOLEAN NOT NULL DEFAULT true,
    "jumpProbability" DOUBLE PRECISION NOT NULL DEFAULT 0.005,
    "jumpMultiplierMax" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "jumpMultiplierMin" DOUBLE PRECISION NOT NULL DEFAULT 0.1,

    CONSTRAINT "Stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricePoint" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stockId" TEXT NOT NULL,

    CONSTRAINT "PricePoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 10000.00,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStock" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Completed',

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stock_symbol_key" ON "Stock"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserStock_userId_idx" ON "UserStock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStock_userId_stockId_key" ON "UserStock"("userId", "stockId");

-- AddForeignKey
ALTER TABLE "PricePoint" ADD CONSTRAINT "PricePoint_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStock" ADD CONSTRAINT "UserStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStock" ADD CONSTRAINT "UserStock_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
