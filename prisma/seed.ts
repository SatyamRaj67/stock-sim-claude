import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    currentPrice: 180.95,
    previousPrice: 180.95,
    dayHigh: 180.95,
    dayLow: 180.95,
    dayOpen: 180.95,
    marketCap: 2800000000000,
    volume: 0,
    isActive: true,
    randomUpdateActive: true,
    jumpProbability: 0.005,
    jumpMultiplierMax: 1.15,
    jumpMultiplierMin: 0.85,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    currentPrice: 378.85,
    previousPrice: 378.85,
    dayHigh: 378.85,
    dayLow: 378.85,
    dayOpen: 378.85,
    marketCap: 2810000000000,
    volume: 0,
    isActive: true,
    randomUpdateActive: true,
    jumpProbability: 0.005,
    jumpMultiplierMax: 1.12,
    jumpMultiplierMin: 0.88,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    currentPrice: 142.65,
    previousPrice: 142.65,
    dayHigh: 142.65,
    dayLow: 142.65,
    dayOpen: 142.65,
    marketCap: 1800000000000,
    volume: 0,
    isActive: true,
    randomUpdateActive: true,
    jumpProbability: 0.006,
    jumpMultiplierMax: 1.18,
    jumpMultiplierMin: 0.82,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    currentPrice: 175.35,
    previousPrice: 175.35,
    dayHigh: 175.35,
    dayLow: 175.35,
    dayOpen: 175.35,
    marketCap: 1820000000000,
    volume: 0,
    isActive: true,
    randomUpdateActive: true,
    jumpProbability: 0.007,
    jumpMultiplierMax: 1.20,
    jumpMultiplierMin: 0.80,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    currentPrice: 726.13,
    previousPrice: 726.13,
    dayHigh: 726.13,
    dayLow: 726.13,
    dayOpen: 726.13,
    marketCap: 1790000000000,
    volume: 0,
    isActive: true,
    randomUpdateActive: true,
    jumpProbability: 0.008,
    jumpMultiplierMax: 1.25,
    jumpMultiplierMin: 0.75,
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    currentPrice: 484.03,
    previousPrice: 484.03,
    dayHigh: 484.03,
    dayLow: 484.03,
    dayOpen: 484.03,
    marketCap: 1240000000000,
    volume: 0,
    isActive: true,
    randomUpdateActive: true,
    jumpProbability: 0.006,
    jumpMultiplierMax: 1.22,
    jumpMultiplierMin: 0.78,
  },
]

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.pricePoint.deleteMany()
  await prisma.userStock.deleteMany()
  await prisma.stock.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // Create stocks
  for (const stock of stocks) {
    const createdStock = await prisma.stock.create({
      data: stock,
    })

    // Create initial price point
    await prisma.pricePoint.create({
      data: {
        stockId: createdStock.id,
        price: Number(createdStock.currentPrice),
        timestamp: new Date(),
      },
    })

    console.log(`Created stock: ${stock.symbol}`)
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'admin123', // In production, this should be hashed
      name: 'Admin User',
      isAdmin: true,
      balance: 1000000, // $1M starting balance for admin
    },
  })

  console.log('Created admin user:', admin.email)

  // Create regular test user
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: 'user123', // In production, this should be hashed
      name: 'Test User',
      balance: 10000, // $10K starting balance for regular users
    },
  })

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
