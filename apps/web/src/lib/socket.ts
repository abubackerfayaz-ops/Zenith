import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';

const SOCKET_URL = 'http://localhost:4345';

export function useNotifications() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io(`${SOCKET_URL}/notifications`, {
      query: { userId: user.id },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    return () => { socket.close(); socketRef.current = null; };
  }, [user?.id]);

  const onNotification = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('notification:new', handler);
    return () => { socketRef.current?.off('notification:new', handler); };
  }, []);

  const onUnreadCount = useCallback((handler: (data: { count: number }) => void) => {
    socketRef.current?.on('notification:unread-count', handler);
    return () => { socketRef.current?.off('notification:unread-count', handler); };
  }, []);

  return { onNotification, onUnreadCount };
}

export function useMessaging() {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const socket = io(`${SOCKET_URL}/messaging`, {
      query: { userId: user.id },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;
    return () => { socket.close(); socketRef.current = null; };
  }, [user?.id]);

  const joinChat = useCallback((chatId: string) => {
    socketRef.current?.emit('join:chat', chatId);
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    socketRef.current?.emit('leave:chat', chatId);
  }, []);

  const onNewMessage = useCallback((handler: (data: any) => void) => {
    socketRef.current?.on('message:new', handler);
    return () => { socketRef.current?.off('message:new', handler); };
  }, []);

  const onTyping = useCallback((handler: (data: { userId: string }) => void) => {
    socketRef.current?.on('typing', handler);
    return () => { socketRef.current?.off('typing', handler); };
  }, []);

  const onMessageRead = useCallback((handler: (data: { messageId: string; userId: string }) => void) => {
    socketRef.current?.on('message:read', handler);
    return () => { socketRef.current?.off('message:read', handler); };
  }, []);

  return { joinChat, leaveChat, onNewMessage, onTyping, onMessageRead };
}
