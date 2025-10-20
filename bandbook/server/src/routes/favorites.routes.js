import { Router } from 'express';
import { readUserFromCookie, requireAuth } from '../middleware/auth.js';
import {
  listMyFavorites,
  getMyFavoriteForBand,
  upsertFavoriteForBand,
  patchFavoriteTracks,
  deleteFavoriteForBand,
} from '../controllers/favorite.controller.js';

const router = Router();

// All favorites of the current user
router.get('/favorites', readUserFromCookie, requireAuth, listMyFavorites);

// Favorite for a specific band
router.get(
  '/bands/:bandId/favorite',
  readUserFromCookie,
  requireAuth,
  getMyFavoriteForBand
);

// Upsert full list (replace)
router.post(
  '/bands/:bandId/favorite',
  readUserFromCookie,
  requireAuth,
  upsertFavoriteForBand
);

// Patch tracks (add/remove subsets)
router.patch(
  '/bands/:bandId/favorite/tracks',
  readUserFromCookie,
  requireAuth,
  patchFavoriteTracks
);

// Delete favorite for the band
router.delete(
  '/bands/:bandId/favorite',
  readUserFromCookie,
  requireAuth,
  deleteFavoriteForBand
);

export default router;
