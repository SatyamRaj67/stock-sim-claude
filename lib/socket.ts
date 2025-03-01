import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializePriceSimulator } from './price-simulator';

let io: SocketIOServer | null = null;

export function getSocketServer() {
  return io;
}

export function initializeSocket(server: NetServer) {
  if (io) {
    console.log('Socket server already initialized');
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  console.log('Socket server initialized');

  // Initialize the price simulator with the socket server
  const simulator = initializePriceSimulator(io);

  // Clean up on server close
  server.on('close', () => {
    if (simulator.stopSimulator) {
      simulator.stopSimulator();
    }
    io = null;
    console.log('Socket server closed');
  });

  return io;
}