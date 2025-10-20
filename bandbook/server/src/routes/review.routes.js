import { Router } from 'express';
import { readUserFromCookie, requireAuth } from '../middleware/auth.js';
import {
  createOrUpdateReview,
  listReviewsForBand,
} from '../controllers/review.controller.js';

const router = Router();

// Public listing
router.get('/bands/:bandId/reviews', listReviewsForBand);

// Create own review (must be logged in)
router.post(
  '/bands/:bandId/reviews',
  readUserFromCookie,
  requireAuth,
  createOrUpdateReview
);

export default router;
