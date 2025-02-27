// app/market/[symbol]/page.tsx

import React from 'react';
import { StockPriceChart } from '@/components/charts/stock-price-chart';
import { StockCandlestickChart } from '@/components/charts/stock-candlestick-chart';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { generateCandlestickData } from '@/lib/candlestick-processor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { TradeForm } from '@/components/trading/trade-form';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getStockData(symbol: string) {
  const stock = await prisma.stock.findUnique({
    where: { symbol },
    include: {
      priceHistory: {
        orderBy: { timestamp: 'desc' },
        take: 100,
      },
    },
  });
  
  if (!stock) {
    return null;
  }
  
  // Generate candlestick data for different timeframes
  const dailyCandlesticks = await generateCandlestickData(stock.id, 'daily', 30);
  const weeklyCandlesticks = await generateCandlestickData(stock.id, 'weekly', 26);
  const monthlyCandlesticks = await generateCandlestickData(stock.id, 'monthly', 24);
  
  return {
    stock,
    candlestickData: {
      daily: dailyCandlesticks,
      weekly: weeklyCandlesticks,
      monthly: monthlyCandlesticks
    }
  };
}

export default async function StockDetailPage({ params }: { params: { symbol: string } }) {
  const data = await getStockData(params.symbol);
  
  if (!data) {
    notFound();
  }
  
  const { stock, candlestickData } = data;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{stock.symbol}</h1>
        <div className="flex space-x-2">
          <Button variant="secondary">Add to Watchlist</Button>
          <Button>Trade</Button>
        </div>
      </div>
      
      <p className="text-xl">{stock.name}</p>
      
      <Tabs defaultValue="price-chart">
        <TabsList>
          <TabsTrigger value="price-chart">Line Chart</TabsTrigger>
          <TabsTrigger value="candlestick-daily">Daily Candlestick</TabsTrigger>
          <TabsTrigger value="candlestick-weekly">Weekly Candlestick</TabsTrigger>
          <TabsTrigger value="candlestick-monthly">Monthly Candlestick</TabsTrigger>
        </TabsList>
        
        <TabsContent value="price-chart" className="mt-4">
          <StockPriceChart
            stockSymbol={stock.symbol}
            stockName={stock.name}
            currentPrice={Number(stock.currentPrice)}
            previousPrice={Number(stock.previousPrice)}
            priceHistory={stock.priceHistory}
          />
        </TabsContent>
        
        <TabsContent value="candlestick-daily" className="mt-4">
          <StockCandlestickChart
            stockSymbol={stock.symbol}
            stockName={stock.name}
            candlestickData={candlestickData.daily}
            timeframe="daily"
          />
        </TabsContent>
        
        <TabsContent value="candlestick-weekly" className="mt-4">
          <StockCandlestickChart
            stockSymbol={stock.symbol}
            stockName={stock.name}
            candlestickData={candlestickData.weekly}
            timeframe="weekly"
          />
        </TabsContent>
        
        <TabsContent value="candlestick-monthly" className="mt-4">
          <StockCandlestickChart
            stockSymbol={stock.symbol}
            stockName={stock.name}
            candlestickData={candlestickData.monthly}
            timeframe="monthly"
          />
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Stock Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Price</dt>
                <dd className="text-lg font-semibold">${Number(stock.currentPrice).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Day Open</dt>
                <dd className="text-lg">${stock.dayOpen.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Day High</dt>
                <dd className="text-lg">${Number(stock.dayHigh).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Day Low</dt>
                <dd className="text-lg">${Number(stock.dayLow).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Volume</dt>
                <dd className="text-lg">{stock.volume.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Market Cap</dt>
                <dd className="text-lg">${(Number(stock.currentPrice) * stock.outstandingShares).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">52-Week High</dt>
                <dd className="text-lg">${Number(stock.yearHigh).toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">52-Week Low</dt>
                <dd className="text-lg">${Number(stock.yearLow).toFixed(2)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Trade {stock.symbol}</h2>
            <TradeForm 
              stockId={stock.id} 
              stockSymbol={stock.symbol} 
              currentPrice={Number(stock.currentPrice)} 
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">About {stock.name}</h2>
            <p className="text-gray-700">{stock.description || "No company description available."}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Industry</h3>
                <p>{stock.industry || "N/A"}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Sector</h3>
                <p>{stock.sector || "N/A"}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Key Financial Metrics</h3>
              <dl className="grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">P/E Ratio</dt>
                  <dd className="text-lg">{stock.peRatio?.toFixed(2) || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dividend Yield</dt>
                  <dd className="text-lg">{stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">EPS</dt>
                  <dd className="text-lg">${stock.eps?.toFixed(2) || "N/A"}</dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}