import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, ProductVariant, Size, Category } from '../types';
import { MEN_CATEGORIES as DEFAULT_CATEGORIES } from '../data/mockData';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount'>) => Promise<Product>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearAllProducts: () => void;
  adjustVariantStock: (productId: string, variantId: string, delta: number) => void;
  resetToDefault: () => void;
  loading: boolean;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  addCategory: (name: string, description?: string) => Promise<Category>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
import { CATALOG_API_BASE as API_BASE } from '../config/api';
const STORAGE_KEY = 'like_clothing_products_v2';
const CATEGORIES_STORAGE_KEY = 'like_clothing_categories_v1';

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(true);

  const mapDbProductToClient = (p: any): Product => ({
    id: p.id,
    sku: p.sku || `LC-${p.id.substring(0, 4)}`,
    title: p.title,
    slug: p.slug,
    category: p.category || 'Oversized & Graphic Tees',
    categoryId: p.categoryId,
    summary: p.summary || p.title,
    description: p.description || p.title,
    fabric: p.fabric || '100% Combed Heavyweight Cotton (240 GSM)',
    careInstructions: p.careInstructions || 'Machine wash cold inside out.',
    basePrice: Number(p.basePrice) || 0,
    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
    discountPercentage: p.discountPercentage ? Number(p.discountPercentage) : undefined,
    isFeatured: !!p.isFeatured,
    isNewArrival: !!p.isNewArrival,
    isBestSeller: !!p.isBestSeller,
    rating: Number(p.rating) || 5.0,
    reviewCount: Number(p.reviewCount) || 1,
    videoUrl: p.videoUrl || undefined,
    images: (p.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText || p.title,
      isPrimary: !!img.isPrimary,
    })),
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      productId: p.id,
      sku: v.sku,
      size: v.size as Size,
      colorName: v.colorName || 'Jet Black',
      colorHex: v.colorHex || '#111111',
      priceAdjustment: Number(v.priceAdjustment) || 0,
      stockQuantity: typeof v.stockQuantity === 'number' ? v.stockQuantity : (!isNaN(Number(v.stockQuantity)) ? Number(v.stockQuantity) : 0),
    })),
    tags: ['Men Fashion', p.category || 'Streetwear', 'LIKE CLOTHING'],
  });

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map(mapDbProductToClient);
          setProducts(mapped);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
          return;
        }
      }
      // If server returned non-ok or empty, do not show phantom cache
      setProducts([]);
    } catch (err) {
      console.warn('Catalog API not reachable', err);
      // Only in network failure, check cache
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
            return;
          }
        }
      } catch {
        // ignore
      }
      setProducts([]);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: Category[] = json.data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            bannerImageUrl: c.bannerImageUrl || '',
            itemCount: c.itemCount || 0,
          }));
          setCategories(mapped);
          localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(mapped));
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch categories from backend, using defaults', err);
    }
  }, []);

  const addCategory = async (name: string, description?: string): Promise<Category> => {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const newCat: Category = {
            id: json.data.id,
            name: json.data.name,
            slug: json.data.slug,
            description: json.data.description,
            bannerImageUrl: json.data.bannerImageUrl,
          };
          setCategories((prev) => {
            const exists = prev.some((c) => c.slug === newCat.slug);
            return exists ? prev : [...prev, newCat];
          });
          return newCat;
        }
      }
    } catch (err) {
      console.error('Error adding category:', err);
    }
    const fallbackCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || `${name} - LIKE CLOTHING`,
    };
    setCategories((prev) => [...prev, fallbackCat]);
    return fallbackCat;
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([refreshProducts(), refreshCategories()]).finally(() => setLoading(false));
  }, [refreshProducts, refreshCategories]);

  const addProduct = async (data: Omit<Product, 'id' | 'slug' | 'rating' | 'reviewCount'>): Promise<Product> => {
    try {
      // 1. Post to Neon PostgreSQL Backend
      const payload = {
        sku: data.sku,
        title: data.title,
        category: data.category,
        categoryId: data.categoryId && data.categoryId.includes('-') && data.categoryId.length === 36 ? data.categoryId : null,
        summary: data.summary,
        description: data.description,
        fabric: data.fabric,
        careInstructions: data.careInstructions,
        basePrice: data.basePrice,
        salePrice: data.salePrice,
        discountPercentage: data.discountPercentage,
        isFeatured: data.isFeatured,
        isNewArrival: data.isNewArrival,
        isBestSeller: data.isBestSeller,
        videoUrl: data.videoUrl || null,
        images: (data.images || []).map((img) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
        })),
        variants: (data.variants || []).map((v) => ({
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          priceAdjustment: v.priceAdjustment,
          stockQuantity: v.stockQuantity,
        })),
      };

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const dbProduct = mapDbProductToClient(json.data);
          setProducts((prev) => [dbProduct, ...prev.filter((p) => p.id !== dbProduct.id)]);
          return dbProduct;
        }
      }
    } catch (err) {
      console.error('Error posting product to database:', err);
    }

    // Fallback optimistic product
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const fallbackProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
      rating: 5.0,
      reviewCount: 1,
    };
    setProducts((prev) => [fallbackProduct, ...prev]);
    return fallbackProduct;
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    // 1. Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );

    // 2. Persist to Database
    try {
      const current = products.find((p) => p.id === id);
      const merged = { ...current, ...updated };

      const payload = {
        sku: merged.sku,
        title: merged.title,
        category: merged.category,
        categoryId: merged.categoryId && merged.categoryId.includes('-') && merged.categoryId.length === 36 ? merged.categoryId : null,
        summary: merged.summary,
        description: merged.description,
        fabric: merged.fabric,
        careInstructions: merged.careInstructions,
        basePrice: merged.basePrice,
        salePrice: merged.salePrice,
        discountPercentage: merged.discountPercentage,
        isFeatured: merged.isFeatured,
        isNewArrival: merged.isNewArrival,
        isBestSeller: merged.isBestSeller,
        videoUrl: merged.videoUrl || null,
        images: (merged.images || []).map((img) => ({
          url: img.url,
          altText: img.altText,
          isPrimary: img.isPrimary,
        })),
        variants: (merged.variants || []).map((v) => ({
          sku: v.sku,
          size: v.size,
          colorName: v.colorName,
          colorHex: v.colorHex,
          priceAdjustment: v.priceAdjustment,
          stockQuantity: v.stockQuantity,
        })),
      };

      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const dbProduct = mapDbProductToClient(json.data);
          setProducts((prev) => prev.map((p) => (p.id === id ? dbProduct : p)));
        }
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    // 1. Optimistic remove
    setProducts((prev) => prev.filter((p) => p.id !== id));

    // 2. Database Delete
    try {
      await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const clearAllProducts = () => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const adjustVariantStock = (productId: string, variantId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          variants: p.variants.map((v) => {
            if (v.id !== variantId) return v;
            return {
              ...v,
              stockQuantity: Math.max(0, v.stockQuantity + delta),
            };
          }),
        };
      })
    );
  };

  const resetToDefault = () => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        clearAllProducts,
        adjustVariantStock,
        resetToDefault,
        loading,
        refreshProducts,
        refreshCategories,
        addCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
};
