/**
 * Media Upload Service (Images & Videos)
 * - Images: Uploaded to backend → saved in wwwroot/uploads/
 * - Videos: Uploaded directly to backend wwwroot/uploads/ or Cloudinary if configured
 * - Supports YouTube, YouTube Shorts, Instagram Reels, and direct MP4 link detection
 */

import { CATALOG_API_BASE, getCloudinaryConfig } from '../config/api';

export interface UploadResult {
  success: boolean;
  url: string;
  provider: 'cdn' | 'backend' | 'cloudinary';
  error?: string;
}

/**
 * Uploads an image file to the backend wwwroot/uploads/.
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
        url: json.data,
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

/**
 * Uploads a video file (.mp4, .webm, .mov) directly from device.
 * First tries backend /upload-video; if Cloudinary is configured, can use Cloudinary.
 */
export async function uploadProductVideo(file: File): Promise<UploadResult> {
  // 1. Try Cloudinary if admin has configured Cloud Name and Upload Preset
  const cloudConfig = getCloudinaryConfig();
  if (cloudConfig.cloudName && cloudConfig.uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudConfig.uploadPreset);
      formData.append('resource_type', 'video');

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudConfig.cloudName}/video/upload`,
        { method: 'POST', body: formData }
      );

      if (cloudRes.ok) {
        const cJson = await cloudRes.json();
        if (cJson.secure_url) {
          return { success: true, url: cJson.secure_url, provider: 'cloudinary' };
        }
      }
    } catch (e) {
      console.warn('Cloudinary upload attempt failed, falling back to backend storage:', e);
    }
  }

  // 2. Default: Upload directly to backend server (saved in wwwroot/uploads/)
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${CATALOG_API_BASE}/upload-video`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (res.ok && json.success && json.data) {
      return {
        success: true,
        url: json.data,
        provider: 'backend',
      };
    } else {
      return {
        success: false,
        url: '',
        provider: 'backend',
        error: json.message || 'Video upload failed. Check file size (max 100MB).',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      url: '',
      provider: 'backend',
      error: err?.message || 'Network error during video upload. Please try a smaller video or check server status.',
    };
  }
}

/**
 * Detects video URL type and returns embed-ready URL or stream source.
 */
export function getVideoEmbedInfo(url: string): {
  type: 'youtube' | 'youtube-shorts' | 'instagram' | 'direct' | 'unknown';
  embedUrl: string;
  canEmbed: boolean;
} {
  if (!url) return { type: 'unknown', embedUrl: '', canEmbed: false };

  // YouTube regular: youtube.com/watch?v=xxx
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      canEmbed: true,
    };
  }

  // YouTube Shorts: youtube.com/shorts/xxx
  const shortsMatch = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/);
  if (shortsMatch) {
    return {
      type: 'youtube-shorts',
      embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0`,
      canEmbed: true,
    };
  }

  // YouTube embed already: youtube.com/embed/xxx
  if (url.includes('youtube.com/embed/')) {
    return { type: 'youtube', embedUrl: url, canEmbed: true };
  }

  // Instagram Reels or Posts: instagram.com/reel/xxx or /p/xxx
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (igMatch) {
    return {
      type: 'instagram',
      embedUrl: `https://www.instagram.com/reel/${igMatch[1]}/embed/`,
      canEmbed: true,
    };
  }
  if (url.includes('instagram.com')) {
    return {
      type: 'instagram',
      embedUrl: url.replace(/\/?(\?.*)?$/, '/embed/'),
      canEmbed: true,
    };
  }

  // Direct MP4 / Server Upload / Cloudinary video
  if (
    url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i) ||
    url.includes('/uploads/') ||
    url.includes('cloudinary.com')
  ) {
    return { type: 'direct', embedUrl: url, canEmbed: true };
  }

  return { type: 'unknown', embedUrl: url, canEmbed: false };
}

