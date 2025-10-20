import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller.js';
import { readUserFromCookie } from '../middleware/auth.js';
import {
  avatarUpload,
  resolveAvatarToCloudinary,
} from '../middleware/upload.js';

const router = Router();

// check-auth (GET /api/auth/me) – vraća trenutnog usera ili null
router.get('/me', readUserFromCookie, me);

// registracija (POST /api/auth/register)
router.post('/register', avatarUpload, resolveAvatarToCloudinary, register);

// login (POST /api/auth/login)
router.post('/login', login);

// logout (POST /api/auth/logout)
router.post('/logout', logout);

export default router;
