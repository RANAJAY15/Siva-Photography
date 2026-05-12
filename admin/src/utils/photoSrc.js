/**
 * Returns the correct image URL for a photo object.
 * - In production: uses photo.imageUrl (Cloudinary CDN URL)
 * - Legacy / local dev fallback: uses /uploads/{filename}
 */
export function photoSrc(photo) {
  if (!photo) return '';
  if (photo.imageUrl) return photo.imageUrl;
  if (photo.filename) return `/uploads/${photo.filename}`;
  return '';
}
