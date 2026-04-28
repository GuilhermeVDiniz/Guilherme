import type { ValidationResult } from './auth';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB = 5,242,880 bytes

export function validateFileUpload(mimeType: string, sizeInBytes: number): ValidationResult {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return { valid: false, error: 'File type must be JPEG, PNG, or WebP' };
  }
  if (sizeInBytes > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must not exceed 5 MB' };
  }
  return { valid: true };
}
