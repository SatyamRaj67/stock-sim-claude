import { PrismaClient, Stock } from "@prisma/client";
import { Server as SocketServer, Server as SocketIOServer } from "socket.io";

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

  // Basic implementation that can be expanded if needed
  static initialize(io: SocketIOServer) {
    return initializePriceSimulator(io);
  }
}

// Sample stock data
interface StockData {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
}

let stocks: StockData[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, previousClose: 174.50 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 325.76, previousClose: 324.90 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 135.60, previousClose: 134.75 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.20, previousClose: 146.30 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 195.50, previousClose: 193.80 },
];

// Simulate random price movements
function updatePrices() {
  return stocks.map(stock => {
    // Random price movement between -1.5% and +1.5%
    const changePercent = (Math.random() - 0.5) * 0.03;
    const newPrice = stock.price * (1 + changePercent);
    return {
      ...stock,
      price: parseFloat(newPrice.toFixed(2))
    };
  });
}

// Initialize price simulator with socket.io instance
export function initializePriceSimulator(io: SocketIOServer) {
  console.log('Price simulator initialized');
  
  // Update prices every 5 seconds
  const interval = setInterval(() => {
    stocks = updatePrices();
    io.emit('price-updates', stocks);
  }, 5000);
  
  // Handle client connections
  io.on('connection', (socket) => {
    console.log('Client connected to price simulator');
    
    // Send initial data to client
    socket.emit('price-updates', stocks);
    
    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected from price simulator');
    });
  });
  
  return {
    getStocks: () => stocks,
    stopSimulator: () => clearInterval(interval)
  };
}
