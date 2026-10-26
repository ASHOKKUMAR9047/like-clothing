/**
 * Centralized API & Cloud Storage Configuration
 * Dynamically adapts to local dev, LAN testing (mobile), or cloud production (Vercel).
 * Eliminates all hardcoded IP addresses from frontend components.
 */

const getBaseApiUrl = (): string => {
  // 1. Explicit environment variable takes precedence
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  // 2. Browser runtime detection
  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;

    // Local loopback development (port 5050 for ASP.NET Core Web API)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5050/api/v1`;
    }

    // Local Area Network (LAN testing from mobile phone e.g. 192.168.x.x)
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return `http://${hostname}:5050/api/v1`;
    }

    // Production (Vercel / Cloud CDN)
    return `${protocol}//${window.location.host}/api/v1`;
  }

  return 'http://localhost:5050/api/v1';
};

export const API_BASE_URL = getBaseApiUrl();
export const CATALOG_API_BASE = `${API_BASE_URL}/catalog`;

/**
 * Cloudinary Free Cloud CDN Configuration
 */
export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

const STORAGE_KEY_CLOUDINARY = 'like_clothing_cloudinary_config';

export const getCloudinaryConfig = (): CloudinaryConfig => {
  // 1. Check admin-saved config in localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CLOUDINARY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.cloudName && parsed.uploadPreset) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse Cloudinary config from localStorage', e);
  }

  // 2. Fall back to Vite environment variables
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  };
};

export const saveCloudinaryConfig = (config: CloudinaryConfig): void => {
  localStorage.setItem(STORAGE_KEY_CLOUDINARY, JSON.stringify(config));
};

export const clearCloudinaryConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY_CLOUDINARY);
};
