// hooks/use-socket.ts

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (!socket) {
      // Create socket connection only once
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000');
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Handle stock updates
    socket.on('stock-update', (stockData) => {
      // You could dispatch to global state here if needed
      // Or let individual components handle this event
      console.log('stock-update', stockData)
    });

    // Navigate on stock deletes
    socket.on('stock-deleted', ({ stockId }) => {
      // Redirect if viewing the deleted stock
      if (window.location.pathname.includes(`/market/${stockId}`)) {
        router.push('/market');
      }
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('stock-update');
      socket.off('stock-deleted');
    };
  }, [router]);

  return { socket, isConnected };
}