import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const {
  JWT_SECRET = 'dev-secret',
  JWT_EXPIRES_IN = '7d',
  COOKIE_NAME = 'bb_token',
} = process.env;

export const JWT_COOKIE_NAME = COOKIE_NAME;
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function cookieOptions() {
  const secure = String(process.env.COOKIE_SECURE || 'false') === 'true';
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}