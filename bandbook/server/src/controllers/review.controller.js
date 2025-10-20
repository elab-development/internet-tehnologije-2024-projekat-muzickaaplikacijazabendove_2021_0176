/**
 * Review controller for Bandbook API.
 *
 * Endpoints:
 * - POST /api/bands/:bandId/reviews      (AUTH) Create or update own review for the band
 *      Body: { rating: 1..5, comment: string }
 *      Response: 201 { review } on create, 200 { review } on update
 *
 * - GET  /api/bands/:bandId/reviews      (PUBLIC) List reviews for a band (paginated)
 *      Query: page?=number (1), pageSize?=number (10, max 100)
 *      Response: { items, page, pageSize, total, totalPages }
 */

import { prisma } from '../lib/prisma.js';

const publicSelect = {
  id: true,
  bandId: true,
  userId: true,
  rating: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true, avatarUrl: true },
  },
};

function coerceId(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function validateRating(r) {
  const n = Number(r);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}

/**
 * POST /api/bands/:bandId/reviews
 * Create or update review by the authenticated user for a given band.
 * Upsert semantics (unique by [bandId, userId]).
 */
export const createOrUpdateReview = async (req, res) => {
  const bandId = coerceId(req.params.bandId);
  if (!bandId) return res.status(400).json({ error: 'Invalid band id' });
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

  const { rating, comment } = req.body || {};

  const ratingNum = validateRating(rating);
  if (!ratingNum)
    return res.status(400).json({ error: 'Rating must be an integer 1–5' });

  const text = String(comment ?? '').trim();
  if (!text) return res.status(400).json({ error: 'Comment is required' });
  if (text.length > 1000)
    return res
      .status(400)
      .json({ error: 'Comment is too long (max 1000 chars)' });

  try {
    // Ensure band exists (fail fast with 404)
    const band = await prisma.band.findUnique({
      where: { id: bandId },
      select: { id: true },
    });
    if (!band) return res.status(404).json({ error: 'Band not found' });

    // Upsert by composite unique (bandId, userId)
    const review = await prisma.review.upsert({
      where: { bandId_userId: { bandId, userId } },
      create: { bandId, userId, rating: ratingNum, comment: text },
      update: { rating: ratingNum, comment: text },
      select: publicSelect,
    });

    const isNew = review.createdAt.getTime() === review.updatedAt.getTime();
    return res.status(isNew ? 201 : 200).json({ review });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || 'Failed to submit review' });
  }
};

/**
 * GET /api/bands/:bandId/reviews
 * Public list with pagination.
 */
export const listReviewsForBand = async (req, res) => {
  const bandId = coerceId(req.params.bandId);
  if (!bandId) return res.status(400).json({ error: 'Invalid band id' });

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));

  const band = await prisma.band.findUnique({
    where: { id: bandId },
    select: { id: true },
  });
  if (!band) return res.status(404).json({ error: 'Band not found' });

  const [total, items] = await Promise.all([
    prisma.review.count({ where: { bandId } }),
    prisma.review.findMany({
      where: { bandId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: publicSelect,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return res.json({ items, page, pageSize, total, totalPages });
};
