import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getJwtSecret } from '@/lib/env';

const SALT_ROUNDS = 12;

export interface UserPayload {
  id: string;
  email: string;
  full_name: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: UserPayload, rememberMe = false): string {
  return jwt.sign(user, getJwtSecret(), {
    expiresIn: rememberMe ? '30d' : '7d',
  });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as UserPayload;
  } catch {
    return null;
  }
}

export function generateId(): string {
  return uuidv4();
}
