/**
 * Auth controller for Bandbook API.
 *
 * Endpoints:
 * - POST /api/auth/register
 *      Creates a USER account. Accepts multipart/form-data with "avatar" file
 *      or JSON with "avatarUrl" (remote HTTP/HTTPS). If avatar is provided,
 *      image is uploaded to Cloudinary and the stored user receives the secure URL.
 *      Sets a JWT httpOnly cookie on success and returns { user }.
 *
 * - POST /api/auth/login
 *      Validates email/password credentials, sets JWT httpOnly cookie, returns { user }.
 *
 * - POST /api/auth/logout
 *      Clears the auth cookie. Returns { ok: true }.
 *
 * - GET /api/auth/me
 *      Returns the currently authenticated user (or null) as { user }.
 */

import {
  setAuthCookie,
  clearAuthCookie,
  createUser,
  checkCredentials,
} from '../middleware/auth.js';

/**
 * Normalizes email input (trim + lowercase).
 * @param {string} e
 * @returns {string}
 */
function sanitizeEmail(e) {
  return String(e || '')
    .trim()
    .toLowerCase();
}

/**
 * POST /api/auth/register
 *
 * Accepts:
 *  - multipart/form-data:
 *      - fields: name, email, password
 *      - file:   avatar (optional)
 *  - application/json:
 *      - name, email, password, avatarUrl? (remote URL)
 *
 * Behavior:
 *  - If avatar provided (file or remote url), upload to Cloudinary (middleware),
 *    then store returned secure URL as avatarUrl for the User.
 *  - Role is forced to USER (admin exists only via seed).
 *  - On success: sets JWT httpOnly cookie and returns 201 + { user }.
 *  - On validation or uniqueness errors: 400 + { error }.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, avatarUrl } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Nedostaju polja: name, email, password' });
    }

    // final avatar URL (from middleware if uploaded)
    const finalAvatarUrl =
      req.avatarUrl ?? (avatarUrl ? String(avatarUrl) : undefined);

    const user = await createUser({
      name: String(name).trim(),
      email: sanitizeEmail(email),
      password: String(password),
      avatarUrl: finalAvatarUrl,
    });

    await setAuthCookie(res, user);
    return res.status(201).json({ user });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || 'Neuspešna registracija' });
  }
};

/**
 * POST /api/auth/login
 *
 * Body (JSON):
 *  - email: string
 *  - password: string
 *
 * On success:
 *  - Sets JWT httpOnly cookie and returns { user }.
 * On failure:
 *  - 400 if missing fields, 401 if invalid credentials, or 500 on server error.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Nedostaju polja: email, password' });
    }
    const user = await checkCredentials({
      email: sanitizeEmail(email),
      password: String(password),
    });
    if (!user) {
      return res.status(401).json({ error: 'Pogrešan email ili lozinka' });
    }
    await setAuthCookie(res, user);
    return res.json({ user });
  } catch {
    return res.status(500).json({ error: 'Greška pri logovanju' });
  }
};

/**
 * POST /api/auth/logout
 *
 * Clears the JWT httpOnly cookie to sign the user out.
 * Returns: { ok: true }
 */
export const logout = async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
};

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user (or null) from req.user,
 * which should be set by readUserFromCookie middleware.
 * Response: { user: object | null }
 */
export const me = async (req, res) => {
  return res.json({ user: req.user || null });
};
