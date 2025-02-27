import { PrismaClient, Stock, PricePoint } from '@prisma/client';
import { startOfDay, startOfWeek, startOfMonth } from 'date-fns';

const prisma = new PrismaClient();

export type StockWithPriceHistory = Stock & {
  priceHistory: PricePoint[];
};

export type TimeRange = 'day' | 'week' | 'month' | 'year' | 'all';

export async function getStockPriceHistory(
  stockId: string,
  timeRange: TimeRange = 'day',
  limit: number = 100
): Promise<PricePoint[]> {
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case 'day':
      startDate = startOfDay(now);
      break;
    case 'week':
      startDate = startOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all':
      startDate = new Date(0); // Beginning of time
      break;
    default:
      startDate = startOfDay(now);
  }

  return prisma.pricePoint.findMany({
    where: {
      stockId,
      timestamp: {
        gte: startDate,
        lte: now,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
    take: limit,
  });
}

export async function createStock(data: {
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
}): Promise<Stock> {
  return prisma.stock.create({
    data: {
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      currentPrice: data.currentPrice,
      previousPrice: data.currentPrice,
      dayHigh: data.currentPrice,
      dayLow: data.currentPrice,
      dayOpen: data.currentPrice,
      marketCap: data.marketCap,
      priceHistory: {
        create: {
          price: data.currentPrice,
        },
      },
    },
  });
}

export async function deleteStock(stockId: string): Promise<void> {
  await prisma.$transaction([
    prisma.pricePoint.deleteMany({
      where: { stockId },
    }),
    prisma.userStock.deleteMany({
      where: { stockId },
    }),
    prisma.stock.delete({
      where: { id: stockId },
    }),
  ]);
}

export async function getStockStats(stockId: string): Promise<{
  yearHigh: number;
  yearLow: number;
  avgVolume: number;
  totalTrades: number;
}> {
  const yearStart = new Date();
  yearStart.setFullYear(yearStart.getFullYear() - 1);

  const [pricePoints, trades] = await Promise.all([
    prisma.pricePoint.findMany({
      where: {
        stockId,
        timestamp: {
          gte: yearStart,
        },
      },
    }),
    prisma.trade.count({
      where: {
        stockId,
        timestamp: {
          gte: yearStart,
        },
      },
    }),
  ]);

  if (pricePoints.length === 0) {
    return {
      yearHigh: 0,
      yearLow: 0,
      avgVolume: 0,
      totalTrades: trades,
    };
  }

  const prices = pricePoints.map(p => p.price);
  
  return {
    yearHigh: Math.max(...prices),
    yearLow: Math.min(...prices),
    avgVolume: pricePoints.length / 365,
    totalTrades: trades,
  };
}

export async function updateStockPrice(
  stockId: string, 
  newPrice: number,
  timestamp: Date = new Date()
): Promise<Stock> {
  // Get current stock data
  const stock = await prisma.stock.findUnique({
    where: { id: stockId },
  });

  if (!stock) {
    throw new Error('Stock not found');
  }

  // Update stock with new price and create price history point
  return prisma.$transaction(async (tx) => {
    // Create new price point
    await tx.pricePoint.create({
      data: {
        stockId,
        price: newPrice,
        timestamp,
      },
    });

    // Update stock record
    return tx.stock.update({
      where: { id: stockId },
      data: {
        previousPrice: stock.currentPrice,
        currentPrice: newPrice,
        dayHigh: newPrice > Number(stock.dayHigh) ? newPrice : Number(stock.dayHigh),
        dayLow: newPrice < Number(stock.dayLow) ? newPrice : Number(stock.dayLow),
        updatedAt: timestamp,
      },
    });
  });
}
