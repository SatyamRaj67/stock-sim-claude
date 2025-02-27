import { PrismaClient, Stock } from "@prisma/client";
import { Server as SocketServer } from "socket.io";

const prisma = new PrismaClient();

export class PriceSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private updateFrequency: number = 5000; // 5 seconds by default
  private io: SocketServer;
  private activeStocks: Map<string, boolean> = new Map();

  constructor(io: SocketServer) {
    this.io = io;
  }

  async initialize() {
    // Load all active stocks from database
    const stocks = await prisma.stock.findMany({
      where: { isActive: true },
    });

    // Initialize the active stocks map
    stocks.forEach((stock) => {
      this.activeStocks.set(stock.id, stock.randomUpdateActive);
    });

    // Start the simulation
    this.start();
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      await this.updateAllPrices();
    }, this.updateFrequency);

    console.log("Price simulator started");
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Price simulator stopped");
    }
  }

  setUpdateFrequency(ms: number) {
    this.updateFrequency = ms;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  toggleStockUpdates(stockId: string, active: boolean) {
    this.activeStocks.set(stockId, active);

    // Also update in database
    prisma.stock.update({
      where: { id: stockId },
      data: { randomUpdateActive: active },
    });
  }

  async updateStockSettings(
    stockId: string,
    settings: {
      jumpProbability?: number;
      jumpMultiplierMax?: number;
      jumpMultiplierMin?: number;
    },
  ) {
    await prisma.stock.update({
      where: { id: stockId },
      data: settings,
    });
  }

  private async updateAllPrices() {
    const stocks = await prisma.stock.findMany({
      where: { isActive: true },
    });

    for (const stock of stocks) {
      if (this.activeStocks.get(stock.id)) {
        await this.updateStockPrice(stock);
      }
    }
  }

  private async updateStockPrice(stock: Stock) {
    const previousPrice = Number(stock.currentPrice);
    let newPrice = previousPrice;

    // Determine if we should make a price jump (based on jumpProbability)
    const makeJump = Math.random() < stock.jumpProbability;

    if (makeJump) {
      // Generate a multiplier between jumpMultiplierMin and jumpMultiplierMax
      const range = stock.jumpMultiplierMax - stock.jumpMultiplierMin;
      const jumpMultiplier = stock.jumpMultiplierMin + Math.random() * range;

      // Apply the jump multiplier
      newPrice = previousPrice * jumpMultiplier;
    } else {
      // Normal price fluctuation (between -3% and +3%)
      const changePercent = Math.random() * 6 - 3;
      newPrice = previousPrice * (1 + changePercent / 100);
    }

    // Ensure price doesn't go below 0.01
    newPrice = Math.max(0.01, newPrice);

    // Round to 2 decimal places
    newPrice = Math.round(newPrice * 100) / 100;

    // Update stock price in database
    const updatedStock = await prisma.stock.update({
      where: { id: stock.id },
      data: {
        previousPrice: previousPrice,
        currentPrice: newPrice,
        dayHigh:
          newPrice > Number(stock.dayHigh) ? newPrice : Number(stock.dayHigh),
        dayLow:
          newPrice < Number(stock.dayLow) ? newPrice : Number(stock.dayLow),
        priceHistory: {
          create: {
            price: newPrice,
          },
        },
      },
    });

    // Emit updated stock data via socket.io
    this.io.emit("stock-update", updatedStock);
  }
}
