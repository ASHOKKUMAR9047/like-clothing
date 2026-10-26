import { ShowcaseCardConfig } from '../types';
import { CATALOG_API_BASE } from '../config/api';

export const SHOWCASE_STORAGE_KEY = 'like_clothing_showcase_banners';

export const DEFAULT_SHOWCASE_CARDS: ShowcaseCardConfig[] = [
  {
    id: 'card-1',
    categorySlug: 'oversized-tees',
    badgeLeft: '240 GSM COTTON',
    badgeRight: 'OVERSIZED',
    title: 'OVERSIZED TEES',
    subtitle: 'Graphic, Plain & Acid-Wash Drips',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'card-2',
    categorySlug: 'shirts',
    badgeLeft: 'PURE LINEN',
    badgeRight: 'CUBAN COLLAR',
    title: 'SHIRTS & POLOS',
    subtitle: 'European Linen & Oxford Fits',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'card-3',
    categorySlug: 'cargos-denim',
    badgeLeft: 'HOT FIT',
    badgeRight: '6-POCKETS',
    title: 'CARGOS & DENIM',
    subtitle: 'Tactical Streetwear & Relaxed Denim',
    imageUrl: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop',
  },
];

export async function fetchShowcaseCardsFromDb(): Promise<ShowcaseCardConfig[]> {
  try {
    const res = await fetch(`${CATALOG_API_BASE}/showcase-banners`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const mapped: ShowcaseCardConfig[] = json.data.map((b: any) => ({
          id: b.id,
          categorySlug: b.categorySlug || 'all',
          badgeLeft: b.badgeLeft || 'POPULAR',
          badgeRight: b.badgeRight || 'TRENDING',
          title: b.title,
          subtitle: b.subtitle || '',
          imageUrl: b.imageUrl,
        }));
        localStorage.setItem(SHOWCASE_STORAGE_KEY, JSON.stringify(mapped));
        return mapped;
      }
    }
  } catch (err) {
    console.warn('Could not load banners from backend database, using local cache', err);
  }
  return getShowcaseCards();
}

export function getShowcaseCards(): ShowcaseCardConfig[] {
  try {
    const raw = localStorage.getItem(SHOWCASE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse showcase banners from storage', err);
  }
  return DEFAULT_SHOWCASE_CARDS;
}

export async function saveShowcaseCards(cards: ShowcaseCardConfig[]): Promise<void> {
  try {
    localStorage.setItem(SHOWCASE_STORAGE_KEY, JSON.stringify(cards));
    window.dispatchEvent(new CustomEvent('like_clothing_showcase_updated', { detail: cards }));

    // Persist to Neon PostgreSQL Database
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.id);
      await fetch(`${CATALOG_API_BASE}/showcase-banners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isGuid ? c.id : undefined,
          title: c.title,
          subtitle: c.subtitle,
          badgeLeft: c.badgeLeft,
          badgeRight: c.badgeRight,
          imageUrl: c.imageUrl,
          categorySlug: c.categorySlug,
          displayOrder: i + 1,
          isActive: true,
        }),
      });
    }
  } catch (err) {
    console.error('Failed to save showcase banners to database', err);
  }
}

export async function deleteShowcaseCardDb(id: string): Promise<void> {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isGuid) {
    try {
      await fetch(`${CATALOG_API_BASE}/showcase-banners/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete banner on backend', err);
    }
  }
}
