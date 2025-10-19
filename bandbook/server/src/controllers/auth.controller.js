import {
  setAuthCookie,
  clearAuthCookie,
  createUser,
  checkCredentials,
} from '../middleware/auth.js';

function sanitizeEmail(e) {
  return String(e || '')
    .trim()
    .toLowerCase();
}

export const register = async (req, res) => {
  try {
    const { name, email, password, avatarUrl } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Nedostaju polja: name, email, password' });
    }
    const user = await createUser({
      name: String(name).trim(),
      email: sanitizeEmail(email),
      password: String(password),
      avatarUrl: avatarUrl ? String(avatarUrl) : undefined,
    });
    await setAuthCookie(res, user);
    return res.status(201).json({ user });
  } catch (err) {
    return res
      .status(400)
      .json({ error: err.message || 'Neuspešna registracija' });
  }
};

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

export const logout = async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
};

export const me = async (req, res) => {
  return res.json({ user: req.user || null });
};