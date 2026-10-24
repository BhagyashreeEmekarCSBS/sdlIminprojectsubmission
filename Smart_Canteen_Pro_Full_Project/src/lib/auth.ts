import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'smart-canteen-super-secret-key-2026-rscoe';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (e) {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const cookie = req.cookies.get('scp_token');
  if (cookie) {
    return cookie.value;
  }
  return null;
}

export async function getCurrentUser(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        studentId: true,
        department: true,
        year: true,
        loyaltyPoints: true,
        favorites: true,
        isActive: true,
      },
    });
    return user;
  } catch (e) {
    return null;
  }
}

export async function requireAuth(req: NextRequest, allowedRoles?: string[]) {
  const user = await getCurrentUser(req);
  if (!user || !user.isActive) {
    return { error: 'Authentication required. Please log in.', status: 401, user: null };
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { error: 'Unauthorized: insufficient permissions for this operation.', status: 403, user: null };
  }
  return { error: null, status: 200, user };
}
