import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';
import { API_BASE_URL } from '../config/api';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[]; // product IDs
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  couponCode: string;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('like_clothing_cart');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed.map((item) => ({
          ...item,
          variant: {
            ...item.variant,
            stockQuantity: Math.max(item.variant?.stockQuantity || 0, 10),
          },
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      // Clear legacy miraya keys
      localStorage.removeItem('miraya_wishlist');
      localStorage.removeItem('miraya_cart');
      const saved = localStorage.getItem('like_clothing_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [couponCode, setCouponCode] = useState<string>('');
  const [couponPercent, setCouponPercent] = useState<number>(0);

  useEffect(() => {
    fetch(`${API_BASE_URL}/coupons`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.success && Array.isArray(json.data)) {
          localStorage.setItem('like_clothing_coupons', JSON.stringify(json.data));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('like_clothing_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('like_clothing_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const maxStock = Math.max(variant.stockQuantity || 0, 10);
    const normalizedVariant = { ...variant, stockQuantity: maxStock };

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.variant.id === variant.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex].quantity = Math.min(newQty, maxStock);
        return updated;
      }
      return [
        ...prev,
        {
          id: `${product.id}-${variant.id}-${Date.now()}`,
          product,
          variant: normalizedVariant,
          quantity: Math.min(quantity, maxStock),
        },
      ];
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === cartItemId) {
          const maxStock = Math.max(item.variant.stockQuantity || 0, 10);
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponPercent(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter a coupon code.' };

    // 1. Check dynamic coupons added via Admin Console
    try {
      const saved = localStorage.getItem('like_clothing_coupons');
      if (saved) {
        const coupons: Array<{ code: string; discountPercent: number; minOrderValue?: number; isActive: boolean }> = JSON.parse(saved);
        const match = coupons.find((c) => c.code.toUpperCase() === clean && c.isActive);
        if (match) {
          if (match.minOrderValue && subtotal < match.minOrderValue) {
            return {
              success: false,
              message: `Minimum order value of ₹${match.minOrderValue} required for coupon ${clean}.`,
            };
          }
          setCouponCode(match.code.toUpperCase());
          setCouponPercent(match.discountPercent);
          return { success: true, message: `${match.code} applied! ${match.discountPercent}% discount granted.` };
        }
      }
    } catch {
      // fallback
    }

    if (clean === 'LIKE20') {
      setCouponCode('LIKE20');
      setCouponPercent(20);
      return { success: true, message: 'LIKE20 applied! 20% discount granted.' };
    }
    if (clean === 'UPDATE10') {
      setCouponCode('UPDATE10');
      setCouponPercent(10);
      return { success: true, message: 'UPDATE10 applied! 10% discount granted.' };
    }
    return { success: false, message: 'Invalid coupon code. Try LIKE20 or UPDATE10' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponPercent(0);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = (item.product.salePrice ?? item.product.basePrice) + item.variant.priceAdjustment;
    return sum + price * item.quantity;
  }, 0);

  const discount = couponPercent > 0 ? Math.round((subtotal * couponPercent) / 100) : 0;
  const shippingFee = subtotal > 1499 || subtotal === 0 ? 0 : 99;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const totalItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        couponCode,
        couponDiscount: discount,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shippingFee,
        total,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
