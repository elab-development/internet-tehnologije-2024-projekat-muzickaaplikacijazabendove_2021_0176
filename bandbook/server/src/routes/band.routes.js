import { Router } from 'express';
import {
  listBands,
  getBand,
  createBand,
  updateBand,
  deleteBand,
} from '../controllers/band.controller.js';
import { readUserFromCookie, requireAdmin } from '../middleware/auth.js';
import {
  avatarUpload,
  resolveAvatarToCloudinary,
} from '../middleware/upload.js';

const router = Router();

// Ensure req.user is populated (for admin guards)
router.use(readUserFromCookie);

router.get('/', listBands);
router.get('/:id', getBand);

/**
 * Admin only
 * - Supports avatar via multipart/form-data (field: "avatar") or JSON avatarUrl
 */
router.post(
  '/',
  requireAdmin,
  avatarUpload,
  resolveAvatarToCloudinary,
  createBand
);
router.patch(
  '/:id',
  requireAdmin,
  avatarUpload,
  resolveAvatarToCloudinary,
  updateBand
);
router.delete('/:id', requireAdmin, deleteBand);

export default router;
