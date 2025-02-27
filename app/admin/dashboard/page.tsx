import { prisma } from '@/lib/db';
import { PriceSimulatorControls } from '@/components/admin/price-simulator-controls';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic'

async function getStocksData() {
    const stocks = await prisma.stock.findMany({
        include: {
            priceHistory: {
                orderBy: {timestamp: 'desc'},
                take: 1,
            }
        }
    })

    const userCount = await prisma.user.count()
    const tradeCount = await prisma.trade.count()

    return {stocks, userCount, tradeCount}
}

export default async function AdminDashboardPage() {
        
}