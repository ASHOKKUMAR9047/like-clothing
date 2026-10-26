export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL' | 'FreeSize' | 'UK 6' | 'UK 7' | 'UK 8' | 'UK 9' | 'UK 10' | 'UK 11' | string;

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: Size;
  colorName: string;
  colorHex: string;
  priceAdjustment: number;
  stockQuantity: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  isPrimary: boolean;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedBuyer: boolean;
  date: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  category: string;
  categoryId: string;
  summary: string;
  description: string;
  fabric: string;
  careInstructions: string;
  basePrice: number;
  salePrice?: number;
  discountPercentage?: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  rating: number;
  reviewCount: number;
  videoUrl?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressType: 'Home' | 'Work' | 'Other';
  streetLine1: string;
  streetLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export type OrderStatus = 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderItem {
  id: string;
  productTitle: string;
  variantSku: string;
  size: Size;
  colorName: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  courierPartner?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'Customer' | 'Admin';
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minOrderValue?: number;
  description: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bannerImageUrl?: string;
  itemCount?: number;
}

export interface ShowcaseCardConfig {
  id: string;
  categorySlug: string;
  badgeLeft: string;
  badgeRight: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

