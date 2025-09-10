import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export function createToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      created_at: decoded.iat?.toString() || ''
    };
  } catch (error) {
    return null;
  }
}

// Extract user from request
export function getUserFromRequest(req: Request): User | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}