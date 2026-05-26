/**
 * Client-side uploads to Cloudinary (images / raw files).
 * Configure an **unsigned** upload preset in the Cloudinary dashboard, or use signed uploads from a backend for production.
 *
 * Firebase Storage is intentionally not used — media is stored on Cloudinary per product direction.
 */

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured(): boolean {
  return Boolean(cloudName && uploadPreset && cloudName.length > 0 && uploadPreset.length > 0);
}

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

/**
 * Upload a file via unsigned preset (browser-safe). For sensitive assets, use signed uploads from Cloud Functions / API.
 */
export async function uploadToCloudinary(
  file: File,
  options?: { folder?: string; resourceType?: 'image' | 'raw' | 'video' | 'auto' }
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured (VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET).');
  }

  const resourceType = options?.resourceType ?? 'auto';
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset!);
  if (options?.folder) {
    body.append('folder', options.folder);
  }

  const res = await fetch(endpoint, { method: 'POST', body });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }

  const json = (await res.json()) as {
    secure_url: string;
    public_id: string;
    width?: number;
    height?: number;
  };

  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
  };
}
