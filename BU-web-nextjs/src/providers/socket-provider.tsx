'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('accessToken');
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));
    socketInstance.on('connect_error', () => setIsConnected(false));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const emit = useCallback(
    (event: string, ...args: unknown[]) => {
      socket?.emit(event, ...args);
    },
    [socket],
  );

  const on = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      socket?.on(event, handler);
    },
    [socket],
  );

  const off = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      socket?.off(event, handler);
    },
    [socket],
  );

  return (
    <SocketContext.Provider value={{ socket, isConnected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
