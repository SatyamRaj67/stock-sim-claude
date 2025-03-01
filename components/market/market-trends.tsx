import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Stock = {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number | string;
  previousPrice: number | string;
  priceHistory: any[];
};

type MarketTrendsProps = {
  stocks: Stock[];
};

export function MarketTrends({ stocks }: MarketTrendsProps) {
  // Calculate some basic market stats
  const totalStocks = stocks.length;
  
  const gainers = stocks.filter(
    (stock) => Number(stock.currentPrice) > Number(stock.previousPrice)
  );
  const losers = stocks.filter(
    (stock) => Number(stock.currentPrice) < Number(stock.previousPrice)
  );
  
  const percentGainers = (gainers.length / totalStocks) * 100;
  
  // Find top gainer and loser
  const topGainer = [...stocks].sort(
    (a, b) =>
      (Number(b.currentPrice) - Number(b.previousPrice)) / Number(b.previousPrice) -
      (Number(a.currentPrice) - Number(a.previousPrice)) / Number(a.previousPrice)
  )[0];
  
  const topLoser = [...stocks].sort(
    (a, b) =>
      (Number(a.currentPrice) - Number(a.previousPrice)) / Number(a.previousPrice) -
      (Number(b.currentPrice) - Number(b.previousPrice)) / Number(b.previousPrice)
  )[0];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {percentGainers > 50 ? 'Bullish' : 'Bearish'}
          </div>
          <p className="text-xs text-muted-foreground">
            {gainers.length} gainers, {losers.length} losers
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${percentGainers}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalStocks}</div>
          <p className="text-xs text-muted-foreground">
            Active stocks in the market
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Gainer</CardTitle>
        </CardHeader>
        <CardContent>
          {topGainer && (
            <>
              <div className="text-2xl font-bold">{topGainer.symbol}</div>
              <p className="text-xs text-muted-foreground">{topGainer.name}</p>
              <p className="mt-2 text-green-500">
                +
                {(
                  ((Number(topGainer.currentPrice) - Number(topGainer.previousPrice)) /
                    Number(topGainer.previousPrice)) *
                  100
                ).toFixed(2)}
                %
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top Loser</CardTitle>
        </CardHeader>
        <CardContent>
          {topLoser && (
            <>
              <div className="text-2xl font-bold">{topLoser.symbol}</div>
              <p className="text-xs text-muted-foreground">{topLoser.name}</p>
              <p className="mt-2 text-red-500">
                {(
                  ((Number(topLoser.currentPrice) - Number(topLoser.previousPrice)) /
                    Number(topLoser.previousPrice)) *
                  100
                ).toFixed(2)}
                %
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}