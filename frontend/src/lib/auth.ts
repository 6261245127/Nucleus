import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  role: Role;
}

export const authenticate = (req: NextRequest): AuthUser | null => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
};
