import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const DEFAULT_FOLDER = process.env.CLOUDINARY_FOLDER || 'bandbook';

/**
 * Upload from a remote URL (Cloudinary fetches the file).
 * @param {string} url
 * @param {object} opts
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export function uploadImageFromUrl(url, opts = {}) {
  return cloudinary.uploader.upload(url, {
    folder: DEFAULT_FOLDER,
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
    ...opts,
  });
}

/**
 * Upload from a Buffer (multer memoryStorage).
 * @param {Buffer} buffer
 * @param {{filename?: string, mimetype?: string}} meta
 * @param {object} opts
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
export function uploadImageFromBuffer(buffer, meta = {}, opts = {}) {
  const uploadOpts = {
    folder: DEFAULT_FOLDER,
    resource_type: 'image',
    overwrite: false,
    unique_filename: true,
    ...opts,
  };
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      uploadOpts,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}
