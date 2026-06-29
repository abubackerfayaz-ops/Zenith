import jwt from 'jsonwebtoken';
import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  username?: string;
  email?: string;
}

interface JwtPayload {
  sub: string;
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function authenticateSocket(socket: Socket): AuthenticatedSocket {
  const token = extractToken(socket);

  if (!token) {
    throw new Error('Authentication token not provided');
  }

  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.sub) {
      throw new Error('Invalid token payload: missing sub');
    }

    const authenticatedSocket = socket as AuthenticatedSocket;
    authenticatedSocket.userId = decoded.sub;
    authenticatedSocket.username = decoded.username;
    authenticatedSocket.email = decoded.email;

    return authenticatedSocket;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

function extractToken(socket: Socket): string | null {
  const auth = socket.handshake.auth?.token;
  if (auth) return auth;

  const token = socket.handshake.query?.token as string | undefined;
  if (token) return token;

  const header = socket.handshake.headers?.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return null;
}
