import { Product } from '../types';

export const MEN_CATEGORIES = [
  {
    id: 'cat-tees',
    name: 'Oversized & Graphic Tees',
    slug: 'oversized-tees',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    itemCount: 28,
    badge: 'Popular',
    icon: '👕',
  },
  {
    id: 'cat-shirts',
    name: 'Casual & Oxford Shirts',
    slug: 'shirts',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=800&auto=format&fit=crop',
    itemCount: 34,
    badge: 'Trending',
    icon: '👔',
  },
  {
    id: 'cat-cargos',
    name: 'Cargo Pants & Denim',
    slug: 'cargos-denim',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    itemCount: 22,
    badge: 'Hot Fit',
    icon: '👖',
  },
  {
    id: 'cat-shoes',
    name: 'Sneakers & Streetwear Shoes',
    slug: 'sneakers-shoes',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop',
    itemCount: 16,
    badge: 'New Drop',
    icon: '👟',
  },
  {
    id: 'cat-polos',
    name: 'Polos & Classic Fits',
    slug: 'polos',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    itemCount: 19,
    badge: 'Classics',
    icon: '🎽',
  },
  {
    id: 'cat-hoodies',
    name: 'Hoodies & Streetwear Jackets',
    slug: 'hoodies-jackets',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    itemCount: 18,
    badge: 'Winter Drop',
    icon: '🧥',
  },
  {
    id: 'cat-coords',
    name: 'Co-ords & Streetwear Sets',
    slug: 'coords-sets',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=800&auto=format&fit=crop',
    itemCount: 12,
    badge: 'Vacay Vibes',
    icon: '🏖️',
  },
  {
    id: 'cat-ethnic',
    name: 'Men Festive Kurtas & Nehru Sets',
    slug: 'mens-ethnic',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop',
    itemCount: 14,
    badge: 'Festive',
    icon: '🪔',
  },
];

// Clean store: No hardcoded demo products. Products are created and edited directly in Admin Console.
export const INITIAL_MEN_PRODUCTS: Product[] = [];

export const MEN_REVIEWS = [
  {
    id: 'rev-m1',
    userName: 'Rajesh Kumar',
    rating: 5,
    title: 'Insane quality! Fabric is super thick and durable',
    comment: 'The 240 GSM oversized tee fits like an expensive luxury streetwear drop. Print has not faded after 5 washes. Best fit I have found in India.',
    isVerifiedBuyer: true,
    date: '2026-10-18',
  },
  {
    id: 'rev-m2',
    userName: 'Vikram Menon',
    rating: 5,
    title: 'Cargo pants are extremely comfortable with deep pockets',
    comment: 'Pockets are very roomy and practical for phone and wallet. Stitching quality is top notch. Delivery was fast to Chennai in 3 days.',
    isVerifiedBuyer: true,
    date: '2026-10-21',
  },
  {
    id: 'rev-m3',
    userName: 'Arjun Das',
    rating: 5,
    title: 'Linen Cuban shirt is perfect for hot weather',
    comment: 'Pure linen material feels ultra premium. Got compliments at a beach party in Goa. Worth every rupee.',
    isVerifiedBuyer: true,
    date: '2026-10-24',
  },
];
