/**
 * Favorite controller for Bandbook API.
 *
 * Endpoints (AUTH):
 * - GET    /api/favorites
 * - GET    /api/bands/:bandId/favorite
 * - POST   /api/bands/:bandId/favorite
 * - PATCH  /api/bands/:bandId/favorite/tracks
 * - DELETE /api/bands/:bandId/favorite
 */

import { prisma } from '../lib/prisma.js';

const bandSelectLite = {
  id: true,
  name: true,
  avatarUrl: true,
  category: true,
  channelId: true,
};

function coerceId(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Ensures the band exists; returns {id} or null */
async function ensureBand(bandId) {
  return prisma.band.findUnique({
    where: { id: bandId },
    select: { id: true },
  });
}

function sanitizeTrackIds(input) {
  if (Array.isArray(input)) {
    return input
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // accept comma-separated string too
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * GET /api/favorites
 * Returns current user's favorites with shallow band info.
 */
export const listMyFavorites = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

  const items = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      bandId: true,
      trackIds: true,
      createdAt: true,
      updatedAt: true,
      band: { select: bandSelectLite },
    },
  });

  res.json({ items });
};

/**
 * GET /api/bands/:bandId/favorite
 * Returns the current user's favorite record for the band (or null).
 */
export const getMyFavoriteForBand = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

  const bandId = coerceId(req.params.bandId);
  if (!bandId) return res.status(400).json({ error: 'Invalid band id' });

  const favorite = await prisma.favorite.findUnique({
    where: { userId_bandId: { userId, bandId } },
    select: {
      id: true,
      bandId: true,
      trackIds: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ favorite: favorite ?? null });
};

/**
 * POST /api/bands/:bandId/favorite
 * Upsert entire trackIds array for this (user, band).
 * Body: { trackIds: string[] | commaSeparatedString }
 */
export const upsertFavoriteForBand = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

  const bandId = coerceId(req.params.bandId);
  if (!bandId) return res.status(400).json({ error: 'Invalid band id' });

  const band = await ensureBand(bandId);
  if (!band) return res.status(404).json({ error: 'Band not found' });

  const trackIds = sanitizeTrackIds(req.body?.trackIds);
  // optional: limit payload size
  if (trackIds.length > 500) {
    return res.status(400).json({ error: 'Too many track IDs (max 500)' });
  }

  const favorite = await prisma.favorite.upsert({
    where: { userId_bandId: { userId, bandId } },
    create: { userId, bandId, trackIds },
    update: { trackIds },
    select: {
      id: true,
      bandId: true,
      trackIds: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ favorite });
};

/**
 * PATCH /api/bands/:bandId/favorite/tracks
 * Body: { add?: string[]|string, remove?: string[]|string }
 */
export const patchFavoriteTracks = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

  const bandId = coerceId(req.params.bandId);
  if (!bandId) return res.status(400).json({ error: 'Invalid band id' });

  const band = await ensureBand(bandId);
  if (!band) return res.status(404).json({ error: 'Band not found' });

  const add = new Set(sanitizeTrackIds(req.body?.add));
  const remove = new Set(sanitizeTrackIds(req.body?.remove));
  if (add.size === 0 && remove.size === 0) {
    return res.status(400).json({ error: 'Nothing to change' });
  }

  // read current
  const existing = await prisma.favorite.findUnique({
    where: { userId_bandId: { userId, bandId } },
    select: { trackIds: true },
  });

  const current = Array.isArray(existing?.trackIds)
    ? existing.trackIds.map(String)
    : [];

  // compute next
  const next = current
    .filter((id) => !remove.has(id))
    .concat([...add].filter((id) => !current.includes(id)));

  const favorite = await prisma.favorite.upsert({
    where: { userId_bandId: { userId, bandId } },
    create: { userId, bandId, trackIds: next },
    update: { trackIds: next },
    select: {
      id: true,
      bandId: true,
      trackIds: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ favorite });
};

/**
 * DELETE /api/bands/:bandId/favorite
 * Removes the favorite record for (user, band).
 */
export const deleteFavoriteForBand = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

  const bandId = coerceId(req.params.bandId);
  if (!bandId) return res.status(400).json({ error: 'Invalid band id' });

  await prisma.favorite.deleteMany({
    where: { userId, bandId },
  });

  res.json({ ok: true });
};
