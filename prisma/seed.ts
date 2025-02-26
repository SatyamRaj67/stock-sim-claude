const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const stocks = [
    { symbol: "AAPL", name: "Apple Inc.", currentPrice: 175.5, marketCap: 2.8e12 },
    { symbol: "GOOGL", name: "Alphabet Inc.", currentPrice: 135.7, marketCap: 1.8e12 },
    { symbol: "TSLA", name: "Tesla Inc.", currentPrice: 215.3, marketCap: 800e9 },
    { symbol: "AMZN", name: "Amazon Inc.", currentPrice: 145.2, marketCap: 1.5e12 },
  ];

  for (const stock of stocks) {
    await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {},
      create: {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        previousPrice: stock.currentPrice,
        dayOpen: stock.currentPrice,
        dayHigh: stock.currentPrice * 1.05,
        dayLow: stock.currentPrice * 0.95,
        marketCap: stock.marketCap,
        randomUpdateActive: true,
      },
    });
  }

  console.log("✅ Seeded stock data");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
