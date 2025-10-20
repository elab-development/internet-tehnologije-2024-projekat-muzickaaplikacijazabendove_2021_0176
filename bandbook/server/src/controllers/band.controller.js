/**
 * Band controller for Bandbook API.
 *
 * Model fields:
 *  - name:        string (required)
 *  - description: string (required)
 *  - members:     JSON array of strings (required)
 *  - channelId:   string (required, unique) — official YouTube channel ID
 *  - avatarUrl:   string (optional) — Cloudinary or remote URL
 *  - category:    string (optional) — e.g. "rock", "pop", "wedding", ...
 *
 * Endpoints:
 * - GET    /api/bands
 *      Public list with optional search/sort/pagination.
 *      Query:
 *        q?=string           — fulltext (name/description) or fallback LIKE
 *        page?=number        — default 1
 *        pageSize?=number    — default 12 (max 100)
 *        sort?=string        — one of: "new", "name-asc", "name-desc"
 *        category?=string
 *      Response: { items, page, pageSize, total, totalPages }
 *
 * - GET    /api/bands/:id
 *      Public detail by numeric id.
 *      Response: { band }
 *
 * - POST   /api/bands         (ADMIN)
 *      Create a band. Accepts multipart/form-data with "avatar" or JSON with avatarUrl.
 *      Body:
 *        name: string
 *        description: string
 *        members: string[] | JSON string | comma-separated string
 *        channelId: string
 *        avatarUrl?: string (remote URL; middleware can upload & set req.avatarUrl)
 *      Response: 201 { band }
 *
 * - PATCH  /api/bands/:id     (ADMIN)
 *      Partial update; same body rules as create. If new avatar provided, updates avatarUrl.
 *      Response: { band }
 *
 * - DELETE /api/bands/:id     (ADMIN)
 *      Deletes the band by id.
 *      Response: { ok: true }
 */

import { prisma } from '../lib/prisma.js';

/**
 * Parses "members" from various input shapes to a string[].
 * Accepts:
 *  - array of strings
 *  - JSON string (e.g., '["Vocal","Guitar"]')
 *  - comma-separated string (e.g., "Vocal, Guitar")
 */
function parseMembers(input) {
  if (Array.isArray(input)) {
    return input
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    const str = input.trim();
    if (!str) return [];
    // try JSON first
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } catch {
      // fall through to comma split
    }
    return str
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function coerceId(param) {
  const id = Number(param);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * GET /api/bands
 *
 * Public list with search/sort/pagination.
 * Search:
 *  - If @@fulltext exists, we approximate by filtering name/description with contains (case-insensitive)
 *    since Prisma fulltext API support varies; adjust to your needs.
 */
export const listBands = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 12));
  const q = String(req.query.q || '').trim();
  const sort = String(req.query.sort || 'new');
  const category = String(req.query.category || '').trim();

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } }, // removed mode
            { description: { contains: q } }, // removed mode
          ],
        }
      : {}),
    ...(category ? { category: { equals: category } } : {}), // removed mode
  };

  let orderBy = [{ createdAt: 'desc' }];
  if (sort === 'name-asc') orderBy = [{ name: 'asc' }];
  if (sort === 'name-desc') orderBy = [{ name: 'desc' }];
  if (sort === 'new') orderBy = [{ createdAt: 'desc' }];

  const [total, items] = await Promise.all([
    prisma.band.count({ where }),
    prisma.band.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  res.json({ items, page, pageSize, total, totalPages });
};

/**
 * GET /api/bands/:id
 *
 * Public detail.
 */
export const getBand = async (req, res) => {
  const id = coerceId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const band = await prisma.band.findUnique({ where: { id } });
  if (!band) return res.status(404).json({ error: 'Band not found' });
  res.json({ band });
};

/**
 * POST /api/bands  (ADMIN)
 *
 * Accepts multipart/form-data (file: "avatar") or JSON with "avatarUrl".
 * If upload middleware resolved an avatar, it will be available as req.avatarUrl.
 */
export const createBand = async (req, res) => {
  try {
    const { name, description, members, channelId, avatarUrl, category } =
      req.body || {};
    if (!name || !description || !channelId) {
      return res
        .status(400)
        .json({ error: 'Missing fields: name, description, channelId' });
    }

    const membersArr = parseMembers(members);
    const finalAvatarUrl =
      req.avatarUrl ?? (avatarUrl ? String(avatarUrl) : undefined);

    const created = await prisma.band.create({
      data: {
        name: String(name).trim(),
        description: String(description).trim(),
        members: membersArr,
        channelId: String(channelId).trim(),
        avatarUrl: finalAvatarUrl ?? null,
        category: category ? String(category).trim() : null,
      },
    });

    return res.status(201).json({ band: created });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || 'Failed to create band' });
  }
};

/**
 * PATCH /api/bands/:id  (ADMIN)
 *
 * Partial update. Accepts same fields as create.
 * If a new avatar is provided (file or avatarUrl), it overwrites the existing avatarUrl.
 */
export const updateBand = async (req, res) => {
  const id = coerceId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  try {
    const { name, description, members, channelId, avatarUrl, category } =
      req.body || {};
    const patch = {};

    if (name !== undefined) patch.name = String(name).trim();
    if (description !== undefined)
      patch.description = String(description).trim();
    if (members !== undefined) patch.members = parseMembers(members);
    if (channelId !== undefined) patch.channelId = String(channelId).trim();
    if (category !== undefined)
      patch.category = category ? String(category).trim() : null;

    if (req.avatarUrl !== undefined) {
      patch.avatarUrl = req.avatarUrl ?? null;
    } else if (avatarUrl !== undefined) {
      patch.avatarUrl = avatarUrl ? String(avatarUrl) : null;
    }

    const updated = await prisma.band.update({
      where: { id },
      data: patch,
    });

    return res.json({ band: updated });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Band not found' });
    }
    return res
      .status(400)
      .json({ error: err.message || 'Failed to update band' });
  }
};

/**
 * DELETE /api/bands/:id  (ADMIN)
 *
 * Deletes a band by id.
 */
export const deleteBand = async (req, res) => {
  const id = coerceId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  try {
    await prisma.band.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Band not found' });
    }
    return res
      .status(400)
      .json({ error: err.message || 'Failed to delete band' });
  }
};
