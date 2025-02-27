import React from 'react';
import { StockGrid } from '@/components/market/stock-grid';
import { MarketTrends } from '@/components/market/market-trends';
import { prisma } from '@/lib/db';

export const revalidate = 0; //Disable Caching

async function getStocks() {
    const stocks = await prisma.stock.findMany({
        where: {isActive: true},
        orderBy: {symbol: 'asc'},
        include: {
            priceHistory: {
                orderBy: {timestamp: 'desc'},
                take: 100,
            }
        }
    })

    return stocks
}

export default async function MarketPage() {
    const stocks = await getStocks()

    return (
        <div className="space-y-6">
            <div className="text-3xl font-bold">Market Overview</div>

            <MarketTrends stocks={stocks} />

            <h2 className="text-2xl font-semibold mt-8">All Stocks</h2>
            <StockGrid stocks={stocks} />
        </div>
    )
}

