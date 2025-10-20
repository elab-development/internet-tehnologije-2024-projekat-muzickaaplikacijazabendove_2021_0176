/**
 * User controller for Bandbook API.
 *
 * Endpoints:
 * - PATCH /api/users/me                 (AUTH)   Update own profile (name, avatar)
 * - GET   /api/users                    (ADMIN)  List users (paginated)
 * - PATCH /api/users/:id/role           (ADMIN)  Update user's role
 */

import { prisma } from '../lib/prisma.js';

/** Fields exposed publicly for user objects (no passwordHash). */
const publicSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * PATCH /api/users/me
 *
 * Accepts:
 *  - multipart/form-data:
 *      - fields: name?
 *      - file:   avatar (optional)
 *  - application/json:
 *      - name?: string
 *      - avatarUrl?: string (remote URL; upload middleware may also set req.avatarUrl)
 *
 * Behavior:
 *  - If avatar provided (file or remote url via middleware), use its secure URL.
 *  - Returns updated public user.
 */
export const updateMe = async (req, res) => {
  const authUser = req.user;
  if (!authUser) return res.status(401).json({ error: 'Unauthenticated' });

  try {
    const { name, avatarUrl } = req.body || {};

    const patch = {};
    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (!trimmed)
        return res.status(400).json({ error: 'Name cannot be empty' });
      patch.name = trimmed;
    }

    // prefer Cloudinary URL from middleware if present
    if (req.avatarUrl !== undefined) {
      patch.avatarUrl = req.avatarUrl ?? null;
    } else if (avatarUrl !== undefined) {
      patch.avatarUrl = avatarUrl ? String(avatarUrl) : null;
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: patch,
      select: publicSelect,
    });

    return res.json({ user: updated });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || 'Failed to update profile' });
  }
};

/**
 * GET /api/users  (ADMIN)
 *
 * Query:
 *  - page?=number        default 1
 *  - pageSize?=number    default 20, max 100
 *
 * Returns: { items, page, pageSize, total, totalPages }
 */
export const listUsers = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));

  const [total, items] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: publicSelect,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  res.json({ items, page, pageSize, total, totalPages });
};

/**
 * PATCH /api/users/:id/role  (ADMIN)
 *
 * Body:
 *  - role: 'ADMIN' | 'USER'
 *
 */
export const updateUserRole = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid id' });
  }

  const { role } = req.body || {};
  if (role !== 'ADMIN' && role !== 'USER') {
    return res.status(400).json({ error: 'Role must be ADMIN or USER' });
  }

  // avoid self-role change
  if (req.user && req.user.id === id) {
    return res.status(400).json({ error: 'You cannot change your own role' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: publicSelect,
    });
    return res.json({ user: updated });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res
      .status(400)
      .json({ error: err.message || 'Failed to update role' });
  }
};
