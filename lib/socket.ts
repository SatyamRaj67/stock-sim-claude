import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { PriceSimulator } from './price-simulator';

let io: SocketServer | null = null;
let priceSimulator: PriceSimulator | null = null;

export const initializeSocketServer = (httpServer: HttpServer) => {
  if (!io) {
    io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Admin events
      socket.on('toggle-stock-updates', ({ stockId, active }) => {
        if (priceSimulator) {
          priceSimulator.toggleStockUpdates(stockId, active);
          io?.emit('stock-update-status', { stockId, active });
        }
      });
      
      socket.on('update-stock-settings', ({ stockId, settings }) => {
        if (priceSimulator) {
          priceSimulator.updateStockSettings(stockId, settings);
          io?.emit('stock-settings-updated', { stockId, settings });
        }
      });
      
      socket.on('create-stock', async (stockData) => {
        // Implementation to create a new stock
        // Emit event after creation
        io?.emit('stock-created', stockData);
      });
      
      socket.on('delete-stock', async (stockId) => {
        // Implementation to delete a stock
        // Emit event after deletion
        io?.emit('stock-deleted', { stockId });
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    // Initialize price simulator
    priceSimulator = new PriceSimulator(io);
    priceSimulator.initialize();
  }
  
  return io;
};

export const getSocketServer = () => {
  if (!io) {
    throw new Error('Socket.io server not initialized');
  }
  return io;
};

export const getPriceSimulator = () => {
  if (!priceSimulator) {
    throw new Error('Price simulator not initialized');
  }
  return priceSimulator;
};