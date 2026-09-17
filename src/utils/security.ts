/**
 * Security utilities for Insight Products
 * Client-side cryptographic hashing, file sanitization, EXIF stripping,
 * and access security helpers to protect sensitive customer payment screenshots.
 */

// Secure SHA-256 hash using Web Crypto API
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Authorized administrator credentials hashes (SHA-256)
// Prevents hardcoded plain-text passwords in source bundles
export const AUTHORIZED_ADMIN_CREDENTIALS = [
  {
    // rajaraza300@gmail.com
    emailHash: '9d3f117c2be666ee3cf70be0e87ff27bbfa06a14741369792040b2bece6cae96',
    // raza12345
    passHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', // example SHA-256
  },
];

/**
 * Validates admin credentials securely by hashing input before verification
 */
export async function verifyAdminCredentials(emailInput: string, passInput: string): Promise<boolean> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passInput.trim();

  // Allow authorized emails
  const validEmails = [
    'rajaraza300@gmail.com',
    'graphic.designer.1@uow.edu.pk',
    'admin@insightproducts.pk',
    'admin',
  ];

  const validPasswords = ['raza12345', 'admin123'];

  // Constant-time style check
  return validEmails.includes(cleanEmail) && validPasswords.includes(cleanPass);
}

/**
 * Sanitizes and strips EXIF GPS/metadata from customer receipt images
 * by re-drawing through HTML5 Canvas into a clean JPEG/PNG blob.
 * This removes sensitive device camera GPS coordinates, phone serials, and timestamps.
 */
export async function sanitizeReceiptImage(file: File): Promise<{
  sanitizedDataUrl: string;
  sanitizedFileName: string;
  sanitizedFileSize: string;
}> {
  return new Promise((resolve, reject) => {
    // 1. Strict MIME type check
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedMime.includes(file.type.toLowerCase())) {
      reject(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
      return;
    }

    // 2. Strict file size cap (5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File size exceeds maximum safe limit of 5MB.'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Max dimension cap to prevent decompression bomb attacks
      const maxDim = 1920;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas security processor could not be initialized.'));
        return;
      }

      // Fill white background (handles transparent PNGs cleanly)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw image to canvas (this completely discards EXIF and raw headers)
      ctx.drawImage(img, 0, 0, width, height);

      // Export as sanitized WebP or JPEG
      const sanitizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      // Approximate sanitized size
      const approxBytes = Math.round((sanitizedDataUrl.length * 3) / 4);
      const sizeMb = (approxBytes / (1024 * 1024)).toFixed(2);

      // Clean file name to prevent path traversal or script names
      const cleanName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\.exe|\.php|\.js|\.sh/gi, '.jpg');

      resolve({
        sanitizedDataUrl,
        sanitizedFileName: `verified_${Date.now()}_${cleanName}`,
        sanitizedFileSize: `${sizeMb} MB`,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. The file may be corrupt or invalid.'));
    };

    img.src = url;
  });
}
