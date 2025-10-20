import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import {
  signToken,
  verifyToken,
  cookieOptions,
  JWT_COOKIE_NAME,
} from '../lib/jwt.js';

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

export async function setAuthCookie(res, user) {
  const token = signToken({ sub: user.id, role: user.role });
  res.cookie(JWT_COOKIE_NAME, token, cookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie(JWT_COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
}

// Čita usera iz kolačića, ne baca 401
export async function readUserFromCookie(req, _res, next) {
  const token = req.cookies?.[JWT_COOKIE_NAME];
  if (!token) {
    req.user = null;
    return next();
  }
  const payload = verifyToken(token);
  if (!payload?.sub) {
    req.user = null;
    return next();
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  req.user = publicUser(user);
  next();
}

// Blokira pristup ako nije ulogovan
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  next();
}

// Guard za admin rute
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Helpers za registraciju / login:
export async function createUser({ name, email, password, avatarUrl }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new Error('Email je već registrovan');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      avatarUrl: avatarUrl ?? null,
      role: 'USER',
    },
  });
  return publicUser(user);
}

export async function checkCredentials({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return publicUser(user);
}
