/**
 * Image Upload Service
 * Posts images to the backend, which automatically uploads them to Free High-Speed Cloud CDN
 * and returns a permanent HTTPS URL (e.g. https://iili.io/...).
 * Zero signup, zero setup, zero configuration required!
 */

import { CATALOG_API_BASE } from '../config/api';

export interface UploadResult {
  success: boolean;
  url: string;
  provider: 'cdn' | 'backend';
  error?: string;
}

/**
 * Uploads an image file to the Cloud CDN via backend.
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${CATALOG_API_BASE}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      return {
        success: true,
        url: json.data, // Permanent Cloud CDN link e.g. https://iili.io/nkPTsbR.jpg
        provider: 'cdn',
      };
    } else {
      return {
        success: false,
        url: '',
        provider: 'backend',
        error: json.message || 'Image upload failed',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      url: '',
      provider: 'backend',
      error: err?.message || 'Network error during image upload',
    };
  }
}
