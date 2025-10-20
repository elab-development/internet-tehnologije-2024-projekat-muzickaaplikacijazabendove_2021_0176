import { Router } from 'express';
import {
  readUserFromCookie,
  requireAuth,
  requireAdmin,
} from '../middleware/auth.js';
import {
  avatarUpload,
  resolveAvatarToCloudinary,
} from '../middleware/upload.js';
import {
  updateMe,
  listUsers,
  updateUserRole,
} from '../controllers/user.controller.js';

const router = Router();

// Update own profile (name + avatar)
router.patch(
  '/me',
  readUserFromCookie,
  requireAuth,
  avatarUpload,
  resolveAvatarToCloudinary,
  updateMe
);

// List all users (admin)
router.get('/', readUserFromCookie, requireAdmin, listUsers);

// Update a user's role (admin)
router.patch('/:id/role', readUserFromCookie, requireAdmin, updateUserRole);

export default router;
