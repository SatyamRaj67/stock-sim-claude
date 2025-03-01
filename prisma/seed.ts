import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const stocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 180.95,
    previousPrice: 180.95,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentPrice: 378.85,
    previousPrice: 378.85,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    currentPrice: 142.65,
    previousPrice: 142.65,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    currentPrice: 175.35,
    previousPrice: 175.35,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    currentPrice: 726.13,
    previousPrice: 726.13,
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    currentPrice: 484.03,
    previousPrice: 484.03,
  },
]

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.priceHistory.deleteMany()
  await prisma.stockHolding.deleteMany()
  await prisma.trade.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // Create stocks
  for (const stock of stocks) {
    const createdStock = await prisma.stock.create({
      data: stock,
    })

    // Create initial price point
    await prisma.priceHistory.create({
      data: {
        stockId: createdStock.id,
        price: Number(createdStock.currentPrice),
        timestamp: new Date(),
      },
    })

    console.log(`Created stock: ${stock.symbol}`)
  }

  // Seed admin user
  const adminPassword = await hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stocksim.com' },
    update: {},
    create: {
      email: 'admin@stocksim.com',
      name: 'Admin',
      password: adminPassword,
      isAdmin: true,
    },
  });

  console.log('Created admin user:', admin.email)

  // Seed regular user
  const userPassword = await hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@stocksim.com' },
    update: {},
    create: {
      email: 'user@stocksim.com',
      name: 'Test User',
      password: userPassword,
    },
  });

  console.log('Created test user:', user.email)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
