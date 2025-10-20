import multer from 'multer';
import {
  uploadImageFromBuffer,
  uploadImageFromUrl,
} from '../lib/cloudinary.js';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
    file.mimetype
  );
  if (!ok) return cb(new Error('Nedozvoljen tip fajla'));
  cb(null, true);
};

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
}).single('avatar');

/**
 * Resolves an avatar from either:
 *  - req.file (buffer)  -> uploads to Cloudinary
 *  - req.body.avatarUrl (remote http/https) -> Cloudinary fetch upload
 *
 * On success sets:
 *  - req.avatar = { secureUrl, publicId }
 *  - req.avatarUrl = string (secure url)
 *
 * If upload fails or nothing provided, it silently continues (no avatar).
 */
export async function resolveAvatarToCloudinary(req, _res, next) {
  try {
    let secureUrl = null;
    let publicId = null;

    if (req.file?.buffer) {
      const result = await uploadImageFromBuffer(req.file.buffer, {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
      });
      secureUrl = result.secure_url;
      publicId = result.public_id;
    } else if (
      req.body?.avatarUrl &&
      /^https?:\/\//i.test(String(req.body.avatarUrl))
    ) {
      const result = await uploadImageFromUrl(String(req.body.avatarUrl));
      secureUrl = result.secure_url;
      publicId = result.public_id;
    }

    if (secureUrl) {
      req.avatar = { secureUrl, publicId };
      req.avatarUrl = secureUrl;
    }
    next();
  } catch (err) {
    // Ne blokiramo registraciju zbog avatara – samo nastavljamo bez slike.
    req.uploadError = err;
    next();
  }
}
