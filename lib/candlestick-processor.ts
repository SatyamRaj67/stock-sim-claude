import { PrismaClient, PricePoint } from '@prisma/client';
import { startOfDay, startOfWeek, startOfMonth, format } from 'date-fns';

const prisma = new PrismaClient();

export type CandlestickData = {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export async function generateCandlestickData(
  stockId: string, 
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily',
  limit: number = 30
): Promise<CandlestickData[]> {
  // Fetch all price points for the stock, ordered by timestamp
  const pricePoints = await prisma.pricePoint.findMany({
    where: {
      stockId: stockId
    },
    orderBy: {
      timestamp: 'asc'
    }
  });

  if (pricePoints.length === 0) {
    return [];
  }

  const candlestickData: CandlestickData[] = [];
  
  // Group price points by time period (day, week, or month)
  const groupedPoints = groupPricePointsByTimeframe(pricePoints, timeframe);
  
  // Convert each group into a candlestick data point
  for (const [, points] of Object.entries(groupedPoints)) {
    if (points.length > 0) {
      const periodDate = new Date(points[0].timestamp);
      const open = points[0].price;
      const close = points[points.length - 1].price;
      const high = Math.max(...points.map(p => p.price));
      const low = Math.min(...points.map(p => p.price));
      
      // For volume, we'll use the number of price changes as a simplified proxy
      // In a real system, you'd use actual trade volumes
      const volume = points.length;
      
      candlestickData.push({
        date: periodDate,
        open,
        high, 
        low,
        close,
        volume
      });
    }
  }
  
  // Sort by date (newest first) and limit the results
  return candlestickData
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit)
    .reverse(); // Reverse back to chronological order for charting
}

function groupPricePointsByTimeframe(
  pricePoints: PricePoint[],
  timeframe: 'daily' | 'weekly' | 'monthly'
): Record<string, PricePoint[]> {
  const grouped: Record<string, PricePoint[]> = {};

  pricePoints.forEach(point => {
    let periodStart: Date;
    
    switch (timeframe) {
      case 'daily':
        periodStart = startOfDay(point.timestamp);
        break;
      case 'weekly':
        periodStart = startOfWeek(point.timestamp);
        break;
      case 'monthly':
        periodStart = startOfMonth(point.timestamp);
        break;
    }

    const key = format(periodStart, 'yyyy-MM-dd');
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    
    grouped[key].push(point);
  });

  return grouped;
}