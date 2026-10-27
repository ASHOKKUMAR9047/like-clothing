import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  Plus,
  Clock,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Pencil,
  Eye,
  X,
  Star,
  Truck,
  RotateCcw,
  Boxes,
  FileText,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  ExternalLink,
  Palette,
  Ticket,
  Tag,
  Copy,
  Video,
  Play,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductContext';
import { MEN_CATEGORIES } from '../data/mockData';
import { formatINR, formatDate } from '../utils/formatters';
import { Size, Product, ProductImage, ProductVariant, Order, OrderStatus, Coupon, ShowcaseCardConfig } from '../types';
import { BrandLogo } from '../components/common/BrandLogo';
import { uploadProductImage, uploadProductVideo } from '../services/cloudinaryService';
import { API_BASE_URL } from '../config/api';
import { getShowcaseCards, saveShowcaseCards, DEFAULT_SHOWCASE_CARDS, fetchShowcaseCardsFromDb, deleteShowcaseCardDb } from '../utils/showcaseConfig';

export interface ColorOption {
  name: string;
  hex: string;
}

export const PRESET_COLORS: ColorOption[] = [
  { name: 'Jet Black', hex: '#111111' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Olive Green', hex: '#4B5320' },
  { name: 'Navy Blue', hex: '#1B2A4A' },
  { name: 'Charcoal Grey', hex: '#36454F' },
  { name: 'Maroon / Wine', hex: '#701C1C' },
  { name: 'Rust Orange', hex: '#D95D39' },
  { name: 'Beige / Khaki', hex: '#C2B280' },
  { name: 'Sage Green', hex: '#9EAA94' },
  { name: 'Lavender', hex: '#9B72CF' },
  { name: 'Chocolate Brown', hex: '#4A2E18' },
  { name: 'Mustard Yellow', hex: '#D4A017' },
];

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, orders, logout, updateOrderStatus } = useAuth();
  const { products, categories, addProduct, updateProduct, deleteProduct, clearAllProducts, adjustVariantStock, addCategory } = useProducts();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'inventory' | 'coupons' | 'banners'>('products');
  const [showcaseCards, setShowcaseCards] = useState<ShowcaseCardConfig[]>(() => getShowcaseCards());
  const [isUploadingShowcase, setIsUploadingShowcase] = useState<number | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Discount Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('like_clothing_coupons');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: '',
    minOrderValue: '',
    description: '',
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCoupons(json.data);
          localStorage.setItem('like_clothing_coupons', JSON.stringify(json.data));
          return;
        }
      }
    } catch (err) {
      console.warn('Could not fetch coupons from server', err);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Multiple Image state for Creation
  const [createImages, setCreateImages] = useState<ProductImage[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [createVideoUrl, setCreateVideoUrl] = useState('');
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const createVideoFileInputRef = useRef<HTMLInputElement>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const ANGLE_OPTIONS = [
    'Front View',
    'Back View',
    'Side Angle',
    'Model Close-up',
    'Detail View',
  ];

  const updateCreateImageAngle = (imgId: string, angle: string) => {
    setCreateImages((prev) =>
      prev.map((img) => (img.id === imgId ? { ...img, altText: angle } : img))
    );
  };

  const updateEditImageAngle = (imgId: string, angle: string) => {
    setEditImages((prev) =>
      prev.map((img) => (img.id === imgId ? { ...img, altText: angle } : img))
    );
  };

  // Colorways for Creation
  const [createColors, setCreateColors] = useState<ColorOption[]>([
    { name: 'Jet Black', hex: '#111111' },
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#D95D39');

  // Multiple Image state for Editing
  const [editImages, setEditImages] = useState<ProductImage[]>([]);
  const [editUrlInput, setEditUrlInput] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editVideoFileInputRef = useRef<HTMLInputElement>(null);

  // Colorways for Editing
  const [editColors, setEditColors] = useState<ColorOption[]>([]);
  const [editCustomColorName, setEditCustomColorName] = useState('');
  const [editCustomColorHex, setEditCustomColorHex] = useState('#D95D39');

  // New product form state
  const [newProduct, setNewProduct] = useState<{
    title: string;
    category: string;
    categoryId: string;
    sku: string;
    fabric: string;
    careInstructions: string;
    basePrice: string | number;
    salePrice: string | number;
    stockS: string | number;
    stockM: string | number;
    stockL: string | number;
    stockXL: string | number;
    stockXXL: string | number;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
  }>({
    title: '',
    category: 'Oversized & Graphic Tees',
    categoryId: 'cat-tees',
    sku: `LC-${Math.floor(100 + Math.random() * 900)}`,
    fabric: '100% Combed Heavyweight Cotton (240 GSM)',
    careInstructions: 'Machine wash cold inside out.',
    basePrice: '',
    salePrice: '',
    stockS: '',
    stockM: '',
    stockL: '',
    stockXL: '',
    stockXXL: '',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
  });

  // Edit form state
  const [editForm, setEditForm] = useState<{
    title: string;
    category: string;
    categoryId: string;
    fabric: string;
    careInstructions: string;
    basePrice: string | number;
    salePrice: string | number;
    stockS: string | number;
    stockM: string | number;
    stockL: string | number;
    stockXL: string | number;
    stockXXL: string | number;
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
  }>({
    title: '',
    category: '',
    categoryId: '',
    fabric: '',
    careInstructions: '',
    basePrice: '',
    salePrice: '',
    stockS: '',
    stockM: '',
    stockL: '',
    stockXL: '',
    stockXXL: '',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  });

  // Protect Admin Route: Redirect if not logged in
  React.useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  // Handle Multiple Photos Selection for Create Form (Uploads to Cloudinary CDN or fallback backend)
  const handleCreatePhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploadingPhoto(true);
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await uploadProductImage(file);
          if (result.success && result.url) {
            setCreateImages((prev) => [
              ...prev,
              {
                id: `img-${Date.now()}-${i}`,
                url: result.url,
                altText: file.name,
                isPrimary: prev.length === 0,
              },
            ]);
            setNotification(`✓ Uploaded ${file.name} to Cloud CDN!`);
          } else {
            alert(`Failed to upload ${file.name}: ${result.error || 'Check network connection'}`);
          }
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      } finally {
        setIsUploadingPhoto(false);
        e.target.value = '';
      }
    }
  };

  const handleCreateVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingVideo(true);
      try {
        const result = await uploadProductVideo(file);
        if (result.success && result.url) {
          setCreateVideoUrl(result.url);
          setNotification(`✓ Uploaded video "${file.name}" successfully!`);
        } else {
          alert(`Failed to upload ${file.name}: ${result.error || 'Check server connection'}`);
        }
      } catch (err: any) {
        alert(`Failed to upload video: ${err?.message || 'Network error'}`);
      } finally {
        setIsUploadingVideo(false);
        e.target.value = '';
      }
    }
  };

  const handleAddCreateUrl = () => {
    if (urlInput.trim()) {
      setCreateImages((prev) => [
        ...prev,
        {
          id: `img-url-${Date.now()}`,
          url: urlInput.trim(),
          altText: 'Product Photo',
          isPrimary: prev.length === 0,
        },
      ]);
      setUrlInput('');
    }
  };

  const setCreatePrimary = (imgId: string) => {
    setCreateImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === imgId }))
    );
  };

  const removeCreateImage = (imgId: string) => {
    setCreateImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imgId);
      if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  // Handle Multiple Photos Selection for Edit Form
  const handleEditPhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsUploadingPhoto(true);
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const result = await uploadProductImage(file);
          if (result.success && result.url) {
            setEditImages((prev) => [
              ...prev,
              {
                id: `img-${Date.now()}-${i}`,
                url: result.url,
                altText: file.name,
                isPrimary: prev.length === 0,
              },
            ]);
            setNotification(`✓ Uploaded ${file.name} to Cloud CDN!`);
          } else {
            alert(`Failed to upload ${file.name}: ${result.error || 'Check network connection'}`);
          }
        }
      } catch (err) {
        console.error('Failed to upload image:', err);
      } finally {
        setIsUploadingPhoto(false);
        e.target.value = '';
      }
    }
  };

  const handleEditVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingVideo(true);
      try {
        const result = await uploadProductVideo(file);
        if (result.success && result.url) {
          setEditVideoUrl(result.url);
          setNotification(`✓ Uploaded video "${file.name}" successfully!`);
        } else {
          alert(`Failed to upload ${file.name}: ${result.error || 'Check server connection'}`);
        }
      } catch (err: any) {
        alert(`Failed to upload video: ${err?.message || 'Network error'}`);
      } finally {
        setIsUploadingVideo(false);
        e.target.value = '';
      }
    }
  };

  const handleAddEditUrl = () => {
    if (editUrlInput.trim()) {
      setEditImages((prev) => [
        ...prev,
        {
          id: `img-url-${Date.now()}`,
          url: editUrlInput.trim(),
          altText: 'Product Photo',
          isPrimary: prev.length === 0,
        },
      ]);
      setEditUrlInput('');
    }
  };

  const setEditPrimary = (imgId: string) => {
    setEditImages((prev) =>
      prev.map((img) => ({ ...img, isPrimary: img.id === imgId }))
    );
  };

  const removeEditImage = (imgId: string) => {
    setEditImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imgId);
      if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditImages(p.images || []);
    setEditVideoUrl(p.videoUrl || '');

    const existingColors = Array.from(
      new Map(
        p.variants
          .filter((v) => v.colorName)
          .map((v) => [v.colorName, { name: v.colorName, hex: v.colorHex || '#111111' }])
      ).values()
    );
    setEditColors(existingColors.length > 0 ? existingColors : [{ name: 'Jet Black', hex: '#111111' }]);

    const isShoe = p.category?.toLowerCase().includes('shoe') || p.category?.toLowerCase().includes('sneaker');
    const sVariant = p.variants.find((v) => isShoe ? v.size === 'UK 6' : v.size === 'S');
    const mVariant = p.variants.find((v) => isShoe ? v.size === 'UK 7' : v.size === 'M');
    const lVariant = p.variants.find((v) => isShoe ? v.size === 'UK 8' : v.size === 'L');
    const xlVariant = p.variants.find((v) => isShoe ? v.size === 'UK 9' : v.size === 'XL');
    const xxlVariant = p.variants.find((v) => isShoe ? v.size === 'UK 10' : v.size === 'XXL');

    setEditForm({
      title: p.title,
      category: p.category,
      categoryId: p.categoryId,
      fabric: p.fabric,
      careInstructions: p.careInstructions,
      basePrice: p.basePrice,
      salePrice: p.salePrice || p.basePrice,
      stockS: sVariant ? sVariant.stockQuantity : 0,
      stockM: mVariant ? mVariant.stockQuantity : 0,
      stockL: lVariant ? lVariant.stockQuantity : 0,
      stockXL: xlVariant ? xlVariant.stockQuantity : 0,
      stockXXL: xxlVariant ? xxlVariant.stockQuantity : 0,
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
    });
  };

  // Submit Product Edit
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const basePriceNum = Number(editForm.basePrice) || 0;
    const salePriceNum = Number(editForm.salePrice) || basePriceNum;
    const discount = basePriceNum > 0 ? Math.round(((basePriceNum - salePriceNum) / basePriceNum) * 100) : 0;

    const parseStock = (val: string | number) => {
      const n = parseInt(String(val), 10);
      return isNaN(n) || n < 0 ? 0 : n;
    };

    const isShoe = editForm.category?.toLowerCase().includes('shoe') || editForm.category?.toLowerCase().includes('sneaker');
    const colorsToUse = editColors.length > 0 ? editColors : [{ name: 'Jet Black', hex: '#111111' }];
    const sizes: Array<{ size: Size; stock: number }> = isShoe ? [
      { size: 'UK 6', stock: parseStock(editForm.stockS) },
      { size: 'UK 7', stock: parseStock(editForm.stockM) },
      { size: 'UK 8', stock: parseStock(editForm.stockL) },
      { size: 'UK 9', stock: parseStock(editForm.stockXL) },
      { size: 'UK 10', stock: parseStock(editForm.stockXXL) },
    ] : [
      { size: 'S', stock: parseStock(editForm.stockS) },
      { size: 'M', stock: parseStock(editForm.stockM) },
      { size: 'L', stock: parseStock(editForm.stockL) },
      { size: 'XL', stock: parseStock(editForm.stockXL) },
      { size: 'XXL', stock: parseStock(editForm.stockXXL) },
    ];

    const updatedVariants: ProductVariant[] = [];
    const baseEditSku = editingProduct.sku || `LC-${Date.now().toString().slice(-4)}`;
    colorsToUse.forEach((c, cIdx) => {
      const cCode = c.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || `C${cIdx + 1}`;
      sizes.forEach((s) => {
        updatedVariants.push({
          id: `v-${editingProduct.id}-${cIdx}-${s.size.toLowerCase().replace(/\s+/g, '')}`,
          productId: editingProduct.id,
          sku: `${baseEditSku}-${cCode}-${s.size.replace(/\s+/g, '')}`,
          size: s.size,
          colorName: c.name,
          colorHex: c.hex,
          priceAdjustment: 0,
          stockQuantity: s.stock,
        });
      });
    });

    await updateProduct(editingProduct.id, {
      title: editForm.title,
      category: editForm.category,
      categoryId: editForm.categoryId,
      fabric: editForm.fabric,
      careInstructions: editForm.careInstructions,
      basePrice: basePriceNum,
      salePrice: salePriceNum,
      discountPercentage: discount > 0 ? discount : 0,
      isFeatured: editForm.isFeatured,
      isNewArrival: editForm.isNewArrival,
      isBestSeller: editForm.isBestSeller,
      videoUrl: editVideoUrl.trim() || undefined,
      images: editImages.length > 0 ? editImages : editingProduct.images,
      variants: updatedVariants,
    });

    setEditingProduct(null);
    setNotification(`Successfully updated "${editForm.title}"! Changes saved successfully.`);
    setTimeout(() => setNotification(''), 5000);
  };

  // Submit Product Creation
  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title) return;

    setIsPublishing(true);
    try {
      const basePriceNum = Number(newProduct.basePrice) || 0;
      const salePriceNum = Number(newProduct.salePrice) || basePriceNum;
      const discount = basePriceNum > 0 ? Math.round(((basePriceNum - salePriceNum) / basePriceNum) * 100) : 0;

      if (createImages.length === 0) {
        alert('Please add at least one product photo (Upload from device or enter image URL) before publishing.');
        setIsPublishing(false);
        return;
      }

      const finalImages = createImages;

      const colorsToUse = createColors.length > 0 ? createColors : [{ name: 'Jet Black', hex: '#111111' }];
      const parseStock = (val: string | number) => {
        const n = parseInt(String(val), 10);
        return isNaN(n) || n < 0 ? 0 : n;
      };
      const isShoe = newProduct.category?.toLowerCase().includes('shoe') || newProduct.category?.toLowerCase().includes('sneaker');
      const sizes: Array<{ size: Size; stock: number }> = isShoe ? [
        { size: 'UK 6', stock: parseStock(newProduct.stockS) },
        { size: 'UK 7', stock: parseStock(newProduct.stockM) },
        { size: 'UK 8', stock: parseStock(newProduct.stockL) },
        { size: 'UK 9', stock: parseStock(newProduct.stockXL) },
        { size: 'UK 10', stock: parseStock(newProduct.stockXXL) },
      ] : [
        { size: 'S', stock: parseStock(newProduct.stockS) },
        { size: 'M', stock: parseStock(newProduct.stockM) },
        { size: 'L', stock: parseStock(newProduct.stockL) },
        { size: 'XL', stock: parseStock(newProduct.stockXL) },
        { size: 'XXL', stock: parseStock(newProduct.stockXXL) },
      ];

      const variants: ProductVariant[] = [];
      const baseCreateSku = newProduct.sku || `LC-${Date.now().toString().slice(-4)}`;
      colorsToUse.forEach((c, cIdx) => {
        const cCode = c.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || `C${cIdx + 1}`;
        sizes.forEach((s) => {
          variants.push({
            id: `v-${Date.now()}-${cIdx}-${s.size.toLowerCase().replace(/\s+/g, '')}`,
            productId: '',
            sku: `${baseCreateSku}-${cCode}-${s.size.replace(/\s+/g, '')}`,
            size: s.size,
            colorName: c.name,
            colorHex: c.hex,
            priceAdjustment: 0,
            stockQuantity: s.stock,
          });
        });
      });

      await addProduct({
        sku: newProduct.sku,
        title: newProduct.title,
        category: newProduct.category,
        categoryId: newProduct.categoryId,
        summary: `${newProduct.title} crafted in ${newProduct.fabric}.`,
        description: `Premium men's clothing item by LIKE CLOTHING. Crafted in ${newProduct.fabric}. Update Your Fashion.`,
        fabric: newProduct.fabric,
        careInstructions: newProduct.careInstructions,
        basePrice: basePriceNum,
        salePrice: salePriceNum,
        discountPercentage: discount > 0 ? discount : 0,
        isFeatured: newProduct.isFeatured,
        isNewArrival: newProduct.isNewArrival,
        isBestSeller: newProduct.isBestSeller,
        videoUrl: createVideoUrl.trim() || undefined,
        images: finalImages,
        variants: variants,
        tags: ['Men Fashion', newProduct.category, 'LIKE CLOTHING'],
      });

      setIsAddingProduct(false);
      setCreateImages([]);
      setCreateVideoUrl('');
      setCreateColors([{ name: 'Jet Black', hex: '#111111' }]);
      setNewProduct({
        title: '',
        category: 'Oversized & Graphic Tees',
        categoryId: 'cat-tees',
        sku: `LC-${Math.floor(100 + Math.random() * 900)}`,
        fabric: '100% Combed Heavyweight Cotton (240 GSM)',
        careInstructions: 'Machine wash cold inside out.',
        basePrice: '',
        salePrice: '',
        stockS: '',
        stockM: '',
        stockL: '',
        stockXL: '',
        stockXXL: '',
        isFeatured: true,
        isNewArrival: true,
        isBestSeller: false,
      });
      setNotification(`Successfully added "${newProduct.title}" to store catalog!`);
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    const cleanCode = newCoupon.code.trim().toUpperCase().replace(/\s+/g, '');
    const discountNum = Number(newCoupon.discountPercent) || 10;
    const minOrder = Number(newCoupon.minOrderValue) || 0;

    const optimisticCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: cleanCode,
      discountPercent: discountNum,
      minOrderValue: minOrder,
      description: newCoupon.description.trim() || `${discountNum}% off store discount`,
      isActive: true,
    };

    setCoupons((prev) => [optimisticCoupon, ...prev.filter((c) => c.code !== cleanCode)]);
    setIsAddingCoupon(false);
    setNewCoupon({ code: '', discountPercent: '', minOrderValue: '', description: '' });

    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          discountPercent: discountNum,
          minOrderValue: minOrder,
          description: optimisticCoupon.description,
          isActive: true,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCoupons((prev) => [json.data, ...prev.filter((c) => c.code !== cleanCode)]);
        }
      }
    } catch (err) {
      console.error('Error saving coupon to server:', err);
    }

    setNotification(`Promo coupon "${cleanCode}" (${discountNum}% off) is now active and saved!`);
    setTimeout(() => setNotification(''), 5000);
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      try {
        await fetch(`${API_BASE_URL}/coupons/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Error deleting coupon:', err);
      }
      setNotification(`Coupon ${code} removed successfully.`);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    try {
      await fetch(`${API_BASE_URL}/coupons/${id}/toggle`, { method: 'PUT' });
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    }
  };

  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [clearAllConfirmText, setClearAllConfirmText] = useState('');

  const handleConfirmClearAll = () => {
    if (clearAllConfirmText.trim().toUpperCase() === 'CLEAR') {
      clearAllProducts();
      setIsClearAllModalOpen(false);
      setClearAllConfirmText('');
      setNotification('All products removed from database. Store catalog is clean and ready for fresh drops!');
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const totalSales = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const totalUnits = products.reduce(
    (total, p) => total + p.variants.reduce((vSum, v) => vSum + v.stockQuantity, 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Top Admin Header */}
      <div className="bg-brand-dark text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-elevated">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" showTagline={false} />
            <span className="text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded font-extrabold uppercase">
              Admin Operations
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display mt-2">
            LIKE CLOTHING • Store Console
          </h1>
          <p className="text-xs text-slate-300">
            Manager: <strong>{user?.fullName}</strong> ({user?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-semibold px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> View Live Storefront
          </Link>
          <button
            onClick={logout}
            className="text-xs font-semibold px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Store Operations KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted text-xs mb-1">
            <span>Total Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-display text-brand-orange">{formatINR(totalSales)}</p>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Paid via Razorpay</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted text-xs mb-1">
            <span>Customer Orders</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-display text-brand-dark">{orders.length}</p>
          <p className="text-[10px] text-blue-600 font-medium mt-1">Verified Purchases</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted text-xs mb-1">
            <span>Men&apos;s Products</span>
            <Package className="w-4 h-4 text-brand-orange" />
          </div>
          <p className="text-2xl font-bold font-display text-brand-dark">{products.length}</p>
          <p className="text-[10px] text-brand-muted mt-1">Active in store catalog</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-border shadow-xs">
          <div className="flex items-center justify-between text-brand-muted text-xs mb-1">
            <span>Total Stock Units</span>
            <Boxes className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold font-display text-purple-700">{totalUnits} pcs</p>
          <p className="text-[10px] text-purple-600 mt-1">Across all sizes S-XXL</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'products'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          Product Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          Recent Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          Inventory Stock Control
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'coupons'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Discount Coupons ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'banners'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Home Showcase 3D Banners (3 Cards)</span>
        </button>
      </div>

      {/* TAB 1: Product Catalog Management */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-display text-brand-dark">
                Men&apos;s Apparel & Catalog
              </h2>
              <p className="text-xs text-brand-muted">
                Add, edit, upload multiple photos, and organize men&apos;s clothing items.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {products.length > 0 && (
                <button
                  onClick={() => {
                    setIsClearAllModalOpen(true);
                    setClearAllConfirmText('');
                  }}
                  className="px-3.5 py-2.5 text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  title="Wipe sample products"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Products</span>
                </button>
              )}

              {!isAddingProduct && (
                <button
                  id="add-new-product-btn"
                  onClick={() => setIsAddingProduct(true)}
                  className="px-6 py-3.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-brand flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                  <span>+ ADD NEW DROP / PRODUCT</span>
                </button>
              )}
            </div>
          </div>

          {/* ADD PRODUCT FORM (SUPPORTS MULTIPLE PHOTO UPLOADS) */}
          {isAddingProduct && (
            <form onSubmit={handleCreateProductSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-brand-orange/40 shadow-xl space-y-6 animate-slide-up">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brand-orange animate-ping" />
                  <h3 className="font-display font-bold text-base text-brand-dark">
                    Publish New Men&apos;s Clothing Product
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setCreateImages([]);
                  }}
                  className="text-xs text-brand-muted hover:text-brand-dark font-bold"
                >
                  ✕ Close Form
                </button>
              </div>

              {/* Multiple Photos Upload Section */}
              <div className="p-5 bg-brand-surface rounded-2xl border border-brand-border space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                    Product Photography ({createImages.length} Photos Added)
                  </label>
                  <span className="text-[11px] text-brand-orange font-semibold">
                    *Select multiple photos from device or paste web URLs
                  </span>
                </div>

                {/* Upload Buttons & URL Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="file"
                    ref={createFileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleCreatePhotosSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingPhoto}
                    onClick={() => createFileInputRef.current?.click()}
                    className="px-4 py-3 bg-brand-dark hover:bg-black disabled:opacity-60 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Uploading Photos to Server...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-brand-orange" />
                        <span>Upload Multiple Photos From Device</span>
                      </>
                    )}
                  </button>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste image web URL (https://...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl border border-brand-border text-xs focus:ring-1 focus:ring-brand-orange"
                    />
                    <button
                      type="button"
                      onClick={handleAddCreateUrl}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-brand-dark text-xs font-bold rounded-xl transition-colors shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                {/* Photos Gallery Preview with Cover Photo Selector */}
                {createImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                    {createImages.map((img) => (
                      <div
                        key={img.id}
                        className={`relative rounded-xl overflow-hidden aspect-[3/4] border-2 group bg-slate-100 ${
                          img.isPrimary ? 'border-brand-orange shadow-md' : 'border-brand-border'
                        }`}
                      >
                        <img src={img.url} alt={img.altText} className="w-full h-full object-cover" />

                        {img.isPrimary && (
                          <span className="absolute top-1.5 left-1.5 bg-brand-orange text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-white" /> Cover Photo
                          </span>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setCreatePrimary(img.id)}
                              className="px-2 py-1 bg-white text-brand-dark font-bold text-[10px] rounded hover:bg-orange-50 transition-colors"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeCreateImage(img.id)}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Angle / View Selector Tag */}
                        <div className="absolute bottom-1 inset-x-1 z-10">
                          <select
                            value={img.altText || 'Front View'}
                            onChange={(e) => updateCreateImageAngle(img.id, e.target.value)}
                            className="w-full text-[9px] font-bold bg-white/95 text-brand-dark px-1 py-0.5 rounded shadow-xs border border-slate-300"
                          >
                            {ANGLE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-brand-orange/40 rounded-xl p-8 text-center bg-white space-y-2">
                    <ImageIcon className="w-8 h-8 text-brand-orange mx-auto opacity-70" />
                    <p className="text-xs font-bold text-brand-dark">No Photos Uploaded Yet</p>
                    <p className="text-[11px] text-brand-muted">
                      Click the black button above to upload front, back, and detail photos of the apparel.
                    </p>
                  </div>
                )}

                {/* Product Video Section (Upload or Paste Link) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-brand-border space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-brand-orange" />
                      <span>Product Video Attachment (Bewakoof-Style Thumbnail Video)</span>
                    </label>
                    <span className="text-[10px] text-brand-muted font-mono">Optional</span>
                  </div>

                  {/* Hidden Video File Input */}
                  <input
                    type="file"
                    ref={createVideoFileInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleCreateVideoSelect}
                    className="hidden"
                  />

                  {/* Upload from Computer / Mobile Button */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => createVideoFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {isUploadingVideo ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uploading Video File...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-brand-orange" />
                          <span>Upload Video File (MP4, WEBM, MOV)</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-brand-muted font-medium">Max 100MB</span>
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center gap-2 text-[10px] text-brand-muted uppercase font-bold">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span>OR Paste Video URL</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* URL Input */}
                  <input
                    type="url"
                    placeholder="YouTube Shorts URL, Instagram Reel, or direct MP4 link"
                    value={createVideoUrl}
                    onChange={(e) => setCreateVideoUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-brand-border focus:ring-1 focus:ring-brand-orange bg-white"
                  />

                  {createVideoUrl && (
                    <div className="p-2.5 bg-orange-50 border border-brand-orange/30 rounded-xl text-xs flex items-center justify-between text-brand-dark font-medium">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Play className="w-4 h-4 text-brand-orange fill-brand-orange shrink-0" />
                        <span className="truncate">
                          Video attached: <strong className="text-brand-orange font-mono text-[11px]">{createVideoUrl}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreateVideoUrl('')}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-bold hover:underline shrink-0 px-2 py-0.5 bg-rose-50 rounded-lg border border-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acid-Wash Oversized Heavyweight T-Shirt"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={isCustomCategory ? '__custom__' : newProduct.category}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        const selected = categories.find((c) => c.name === e.target.value);
                        setNewProduct({
                          ...newProduct,
                          category: e.target.value,
                          categoryId: selected?.id || '',
                        });
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="__custom__">✨ + Add New Category (Custom)...</option>
                  </select>

                  {isCustomCategory && (
                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        placeholder="Type new category name (e.g. Formal Shirts, Denim Shorts)"
                        value={customCategoryInput}
                        onChange={(e) => {
                          setCustomCategoryInput(e.target.value);
                          setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                            categoryId: '',
                          });
                        }}
                        className="w-full p-2.5 rounded-lg border-2 border-brand-orange bg-orange-50/20 text-xs font-semibold focus:outline-none"
                        autoFocus
                      />
                      <p className="text-[10px] text-brand-muted">
                        New category will be automatically created in database and available across the store!
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fabric & Material</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100% Combed Cotton 240 GSM"
                    value={newProduct.fabric}
                    onChange={(e) => setNewProduct({ ...newProduct, fabric: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 1999"
                    value={newProduct.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 1199"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-orange"
                  />
                </div>
              </div>

              {/* Colorways Selection */}
              <div className="space-y-3 bg-brand-surface p-4 rounded-xl border border-brand-border">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-brand-dark uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-brand-orange" />
                    <span>Apparel Colors ({createColors.length} selected)</span>
                  </label>
                  <span className="text-[10px] text-brand-muted">
                    Click preset or add custom color
                  </span>
                </div>

                {/* Active Selected Colors */}
                <div className="flex flex-wrap gap-2">
                  {createColors.map((color) => (
                    <span
                      key={color.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-orange text-brand-dark rounded-full text-xs font-semibold shadow-xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (createColors.length > 1) {
                            setCreateColors(createColors.filter((c) => c.name !== color.name));
                          }
                        }}
                        className="hover:text-red-600 transition-colors ml-0.5"
                        title="Remove color"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Preset Suggestions */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-1.5">Quick Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = createColors.some((c) => c.name === preset.name);
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (createColors.length > 1) {
                                setCreateColors(createColors.filter((c) => c.name !== preset.name));
                              }
                            } else {
                              setCreateColors([...createColors, preset]);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            isSelected
                              ? 'bg-brand-orange text-white border-brand-orange shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-brand-border flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Custom Color:</span>
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={(e) => setCustomColorHex(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                    title="Pick color"
                  />
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Acid Lime)"
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-brand-border bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customColorName.trim()) {
                        setCreateColors([...createColors, { name: customColorName.trim(), hex: customColorHex }]);
                        setCustomColorName('');
                      }
                    }}
                    className="px-3 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              {/* Size Quantities & Stock */}
              {(() => {
                const isShoe = newProduct.category?.toLowerCase().includes('shoe') || newProduct.category?.toLowerCase().includes('sneaker');
                return (
                  <div className="space-y-2 text-xs">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider">
                      {isShoe ? "Initial Stock Quantities (UK Shoe Sizes)" : "Initial Stock Quantities Per Men's Size"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-0.5">{isShoe ? "UK 6" : "Size S"}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={newProduct.stockS}
                          onChange={(e) => setNewProduct({ ...newProduct, stockS: e.target.value })}
                          className="w-full p-2 rounded-lg border border-brand-border"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">{isShoe ? "UK 7" : "Size M"}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={newProduct.stockM}
                          onChange={(e) => setNewProduct({ ...newProduct, stockM: e.target.value })}
                          className="w-full p-2 rounded-lg border border-brand-border"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">{isShoe ? "UK 8" : "Size L"}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={newProduct.stockL}
                          onChange={(e) => setNewProduct({ ...newProduct, stockL: e.target.value })}
                          className="w-full p-2 rounded-lg border border-brand-border"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">{isShoe ? "UK 9" : "Size XL"}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={newProduct.stockXL}
                          onChange={(e) => setNewProduct({ ...newProduct, stockXL: e.target.value })}
                          className="w-full p-2 rounded-lg border border-brand-border"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5">{isShoe ? "UK 10" : "Size XXL"}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={newProduct.stockXXL}
                          onChange={(e) => setNewProduct({ ...newProduct, stockXXL: e.target.value })}
                          className="w-full p-2 rounded-lg border border-brand-border"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-brand-border">
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-6 py-3 bg-brand-orange hover:bg-brand-orangeHover disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-brand transition-all flex items-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving Product...
                    </>
                  ) : (
                    'Publish to Live Store'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-brand-dark text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Product Cards Grid with Edit & Delete Buttons */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
                const primaryImg = p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-brand-border p-4 flex gap-4 items-start shadow-xs hover:shadow-md transition-shadow relative"
                  >
                    <img
                      src={primaryImg}
                      alt={p.title}
                      className="w-20 h-28 rounded-xl object-cover bg-slate-100 shrink-0 border border-brand-border"
                    />
                    <div className="flex-1 truncate space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">
                          {p.category}
                        </span>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                          {p.images.length} {p.images.length === 1 ? 'photo' : 'photos'}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-brand-dark truncate">{p.title}</h4>
                      <p className="text-[11px] text-brand-muted font-mono">SKU: {p.sku}</p>

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="font-bold text-sm text-brand-orange">
                          {formatINR(p.salePrice ?? p.basePrice)}
                        </span>
                        {p.salePrice && (
                          <span className="text-xs text-brand-muted line-through">
                            {formatINR(p.basePrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-brand-border/60 text-[11px]">
                        <span className="text-slate-600">
                          Stock: <strong>{totalStock} pcs</strong>
                        </span>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"
                            title="Edit this apparel"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete from store"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-brand-border p-8 space-y-3">
              <Package className="w-12 h-12 text-brand-orange/60 mx-auto" />
              <h3 className="font-display font-bold text-lg text-brand-dark">No Products In Store</h3>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                No hardcoded clothing items remain. Click &quot;+ Add New Men&apos;s Apparel&quot; above to publish your first drop with photos and pricing!
              </p>
              <button
                onClick={() => setIsAddingProduct(true)}
                className="mt-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-xl shadow-brand"
              >
                + Add First Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-brand-border animate-slide-up">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-brand-orange" />
                <h3 className="font-display font-bold text-base text-brand-dark">
                  Edit Apparel: {editingProduct.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-xs text-slate-400 hover:text-brand-dark font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-6">
              {/* Edit Photos Gallery */}
              <div className="p-4 bg-brand-surface rounded-xl border border-brand-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-brand-dark uppercase tracking-wider block">
                    Product Photos ({editImages.length})
                  </label>
                  <span className="text-[10px] text-brand-orange font-semibold">
                    *Change cover photo or add more angles
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleEditPhotosSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3 py-2 bg-brand-dark hover:bg-black text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-brand-orange" />
                    <span>Upload From Device</span>
                  </button>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste photo URL..."
                      value={editUrlInput}
                      onChange={(e) => setEditUrlInput(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-brand-border text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddEditUrl}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-lg"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                  {editImages.map((img) => (
                    <div
                      key={img.id}
                      className={`relative rounded-lg overflow-hidden aspect-[3/4] border-2 group bg-slate-100 ${
                        img.isPrimary ? 'border-brand-orange' : 'border-brand-border'
                      }`}
                    >
                      <img src={img.url} alt="Variant" className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 bg-brand-orange text-white text-[8px] font-bold px-1 py-0.2 rounded">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setEditPrimary(img.id)}
                            className="px-1.5 py-0.5 bg-white text-[9px] font-bold rounded"
                          >
                            Set Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeEditImage(img.id)}
                          className="p-1 bg-red-600 text-white rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Angle Selector */}
                      <div className="absolute bottom-1 inset-x-1 z-10">
                        <select
                          value={img.altText || 'Front View'}
                          onChange={(e) => updateEditImageAngle(img.id, e.target.value)}
                          className="w-full text-[8px] font-bold bg-white/95 text-brand-dark px-0.5 py-0.5 rounded shadow-xs border border-slate-300"
                        >
                          {ANGLE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Product Video Attachment (Upload or Paste Link) */}
                <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-brand-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-brand-orange" />
                      <span>Product Video Attachment (Bewakoof-Style Thumbnail Video)</span>
                    </label>
                    <span className="text-[10px] text-brand-muted">Optional</span>
                  </div>

                  {/* Hidden Edit Video File Input */}
                  <input
                    type="file"
                    ref={editVideoFileInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                    onChange={handleEditVideoSelect}
                    className="hidden"
                  />

                  {/* Upload from Computer / Mobile Button */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => editVideoFileInputRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {isUploadingVideo ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Uploading Video...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-brand-orange" />
                          <span>Upload Video File (MP4, WEBM, MOV)</span>
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-brand-muted">Max 100MB</span>
                  </div>

                  {/* OR Divider */}
                  <div className="flex items-center gap-2 text-[9px] text-brand-muted uppercase font-bold">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span>OR Paste Video URL</span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>

                  {/* URL Input */}
                  <input
                    type="url"
                    placeholder="YouTube Shorts URL, Instagram Reel, or direct MP4 link"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-brand-border bg-white focus:ring-1 focus:ring-brand-orange"
                  />

                  {editVideoUrl && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-900">
                      <div className="flex items-center gap-1.5 truncate pr-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] truncate">
                          Video: <strong className="font-mono text-emerald-700">{editVideoUrl}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditVideoUrl('')}
                        className="text-[10px] text-rose-600 hover:text-rose-800 font-bold hover:underline shrink-0 px-2 py-0.5 bg-rose-50 rounded border border-rose-200"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Details Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => {
                      const selected = categories.find((c) => c.name === e.target.value);
                      setEditForm({
                        ...editForm,
                        category: e.target.value,
                        categoryId: selected?.id || '',
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fabric & Material</label>
                  <input
                    type="text"
                    required
                    value={editForm.fabric}
                    onChange={(e) => setEditForm({ ...editForm, fabric: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Selling Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.salePrice}
                    onChange={(e) => setEditForm({ ...editForm, salePrice: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  />
                </div>
              </div>

              {/* Edit Colorways Selection */}
              <div className="space-y-3 bg-brand-surface p-4 rounded-xl border border-brand-border">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-brand-dark uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-brand-orange" />
                    <span>Apparel Colors ({editColors.length} selected)</span>
                  </label>
                  <span className="text-[10px] text-brand-muted">
                    Click preset or add custom color
                  </span>
                </div>

                {/* Active Selected Colors */}
                <div className="flex flex-wrap gap-2">
                  {editColors.map((color) => (
                    <span
                      key={color.name}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-orange text-brand-dark rounded-full text-xs font-semibold shadow-xs"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (editColors.length > 1) {
                            setEditColors(editColors.filter((c) => c.name !== color.name));
                          }
                        }}
                        className="hover:text-red-600 transition-colors ml-0.5"
                        title="Remove color"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Preset Suggestions */}
                <div>
                  <p className="text-[11px] font-bold text-slate-500 mb-1.5">Quick Presets:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((preset) => {
                      const isSelected = editColors.some((c) => c.name === preset.name);
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              if (editColors.length > 1) {
                                setEditColors(editColors.filter((c) => c.name !== preset.name));
                              }
                            } else {
                              setEditColors([...editColors, preset]);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            isSelected
                              ? 'bg-brand-orange text-white border-brand-orange shadow-xs'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Input */}
                <div className="pt-2 border-t border-brand-border flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Custom Color:</span>
                  <input
                    type="color"
                    value={editCustomColorHex}
                    onChange={(e) => setEditCustomColorHex(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5 bg-white"
                    title="Pick color"
                  />
                  <input
                    type="text"
                    placeholder="Color Name (e.g. Acid Lime)"
                    value={editCustomColorName}
                    onChange={(e) => setEditCustomColorName(e.target.value)}
                    className="p-1.5 text-xs rounded-lg border border-brand-border bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editCustomColorName.trim()) {
                        setEditColors([...editColors, { name: editCustomColorName.trim(), hex: editCustomColorHex }]);
                        setEditCustomColorName('');
                      }
                    }}
                    className="px-3 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              {/* Sizes Stock Inputs */}
              {(() => {
                const isShoe = editForm.category?.toLowerCase().includes('shoe') || editForm.category?.toLowerCase().includes('sneaker');
                return (
                  <div className="space-y-2 text-xs">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider">
                      {isShoe ? "Update Shoe Sizes (UK)" : "Update Size Quantities"}
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <label className="block text-slate-500 mb-0.5 text-center font-bold">{isShoe ? "UK 6" : "S"}</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stockS}
                          onChange={(e) => setEditForm({ ...editForm, stockS: e.target.value })}
                          className="w-full p-2 rounded border border-brand-border text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5 text-center font-bold">{isShoe ? "UK 7" : "M"}</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stockM}
                          onChange={(e) => setEditForm({ ...editForm, stockM: e.target.value })}
                          className="w-full p-2 rounded border border-brand-border text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5 text-center font-bold">{isShoe ? "UK 8" : "L"}</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stockL}
                          onChange={(e) => setEditForm({ ...editForm, stockL: e.target.value })}
                          className="w-full p-2 rounded border border-brand-border text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5 text-center font-bold">{isShoe ? "UK 9" : "XL"}</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stockXL}
                          onChange={(e) => setEditForm({ ...editForm, stockXL: e.target.value })}
                          className="w-full p-2 rounded border border-brand-border text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-0.5 text-center font-bold">{isShoe ? "UK 10" : "XXL"}</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.stockXXL}
                          onChange={(e) => setEditForm({ ...editForm, stockXXL: e.target.value })}
                          className="w-full p-2 rounded border border-brand-border text-center font-bold"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-3 pt-4 border-t border-brand-border">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-brand"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-brand-dark text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: Orders Management */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden shadow-xs space-y-4 p-6">
          <div className="flex justify-between items-center border-b border-brand-border pb-3">
            <div>
              <h2 className="font-display font-bold text-base text-brand-dark">Customer Orders</h2>
              <p className="text-xs text-brand-muted">
                Click on any order to view full customer details, ordered items, and update shipping status.
              </p>
            </div>
            <span className="text-xs font-bold bg-brand-orangeLight text-brand-orange px-3 py-1 rounded-full">
              {orders.length} Total Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-brand-dark font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer Name & Phone</th>
                  <th className="py-3 px-4">Delivery City</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Order Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {orders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-orange-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-orange">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-brand-dark">{ord.shippingAddress.recipientName}</p>
                      <p className="text-brand-muted text-[11px]">{ord.shippingAddress.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      {ord.shippingAddress.city}, {ord.shippingAddress.state}
                    </td>
                    <td className="py-3.5 px-4 font-bold">{formatINR(ord.total)}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                        {ord.paymentStatus} (Razorpay)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="px-3 py-1 bg-brand-dark hover:bg-black text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-brand-orange" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL / DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-brand-border animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-brand-orangeLight text-brand-orange px-2 py-0.5 rounded">
                  Customer Order Details
                </span>
                <h3 className="font-display font-bold text-lg text-brand-dark mt-1">
                  Order {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-brand-muted">Placed on {formatDate(selectedOrder.date)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-xs text-slate-400 hover:text-brand-dark font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Order Status Changer */}
            <div className="p-4 bg-orange-50 border border-brand-orange/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-brand-dark block">Update Fulfillment Status:</span>
                <span className="text-slate-600 text-[11px]">
                  Current status: <strong>{selectedOrder.status}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    updateOrderStatus(selectedOrder.id, newStatus);
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                    setNotification(`Order ${selectedOrder.orderNumber} status updated to "${newStatus}"!`);
                    setTimeout(() => setNotification(''), 4000);
                  }}
                  className="bg-white border border-brand-orange font-bold text-brand-dark rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-brand-orange text-xs"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing / Packing</option>
                  <option value="Shipped">Shipped via Delhivery</option>
                  <option value="Delivered">Delivered to Customer</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-brand-border space-y-2">
                <h4 className="font-bold text-brand-dark flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <UserCheck className="w-4 h-4 text-brand-orange" /> Customer Information
                </h4>
                <p className="font-bold text-sm text-brand-dark">{selectedOrder.shippingAddress.recipientName}</p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-brand-orange" /> {selectedOrder.shippingAddress.phone}
                </p>
                <p className="text-[11px] text-slate-500">Shopper Mode: Direct Guest Checkout</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-brand-border space-y-2">
                <h4 className="font-bold text-brand-dark flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-4 h-4 text-brand-orange" /> Delivery Address
                </h4>
                <p className="text-slate-700 leading-snug">
                  {selectedOrder.shippingAddress.streetLine1}
                  {selectedOrder.shippingAddress.streetLine2 ? `, ${selectedOrder.shippingAddress.streetLine2}` : ''}
                </p>
                {selectedOrder.shippingAddress.landmark && (
                  <p className="text-slate-500 text-[11px]">Landmark: {selectedOrder.shippingAddress.landmark}</p>
                )}
                <p className="font-bold text-slate-800">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Ordered Items Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-brand-dark">
                Items Purchased ({selectedOrder.items.length})
              </h4>
              <div className="border border-brand-border rounded-xl overflow-hidden divide-y divide-brand-border text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.productTitle}
                        className="w-12 h-14 rounded-lg object-cover bg-slate-100 border border-brand-border shrink-0"
                      />
                      <div>
                        <p className="font-bold text-brand-dark">{item.productTitle}</p>
                        <p className="text-[11px] text-brand-muted">
                          Size: <strong>{item.size}</strong> • Qty: <strong>{item.quantity}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">SKU: {item.variantSku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-dark">{formatINR(item.lineTotal)}</p>
                      <p className="text-[10px] text-brand-muted">({formatINR(item.unitPrice)} each)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logistics & Payment Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-brand-border text-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <CreditCard className="w-4 h-4" />
                  <span>Payment Verified (Razorpay)</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Express Air Logistics: <strong>{selectedOrder.courierPartner || 'Delhivery Express'}</strong>
                </p>
                {selectedOrder.trackingNumber && (
                  <p className="font-mono text-[11px] text-brand-muted">
                    Tracking #: {selectedOrder.trackingNumber}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{formatINR(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{formatINR(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping Fee:</span>
                  <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatINR(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-brand-dark pt-1 border-t border-brand-border">
                  <span>Total Paid:</span>
                  <span className="text-brand-orange">{formatINR(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-brand-dark text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
              >
                Close Order View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Inventory Stock Control */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-brand-border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-display font-bold text-base text-brand-dark">Real-Time Men&apos;s Stock Audit</h2>
              <p className="text-xs text-brand-muted">Adjust variant stock (+ / -) directly for any clothing piece.</p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
              {totalUnits} Total Units In Stock
            </span>
          </div>

          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-brand-border bg-brand-surface space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-brand-dark">{p.title}</h4>
                  <span className="font-mono text-xs text-brand-muted">{p.sku}</span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {p.variants.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white p-2.5 rounded-lg border border-brand-border flex items-center gap-3 text-xs"
                    >
                      <div>
                        <span className="font-bold text-brand-dark">Size {v.size}</span>
                        <span className="block text-[10px] text-brand-muted">Stock: <strong>{v.stockQuantity}</strong></span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => adjustVariantStock(p.id, v.id, -1)}
                          className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <button
                          onClick={() => adjustVariantStock(p.id, v.id, 1)}
                          className="w-6 h-6 rounded bg-brand-orange text-white font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Promo Discount Coupons Management */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-display text-brand-dark flex items-center gap-2">
                <Ticket className="w-5 h-5 text-brand-orange" />
                <span>Store Promo Discount Coupons</span>
              </h2>
              <p className="text-xs text-brand-muted">
                Create and manage promo discount codes for customers to apply in bag and checkout.
              </p>
            </div>

            <button
              onClick={() => setIsAddingCoupon(true)}
              className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-brand flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Promo Coupon</span>
            </button>
          </div>

          {/* New Coupon Creation Form */}
          {isAddingCoupon && (
            <form
              onSubmit={handleCreateCouponSubmit}
              className="bg-white rounded-2xl border border-brand-orange p-6 shadow-sm space-y-4 animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h3 className="font-bold text-sm text-brand-dark flex items-center gap-2">
                  <Tag className="w-4 h-4 text-brand-orange" />
                  <span>Create New Discount Coupon</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingCoupon(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Coupon Promo Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE30"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-lg border border-brand-border uppercase font-mono font-bold focus:ring-1 focus:ring-brand-orange"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Capital letters, no spaces</span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Discount Percentage (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    placeholder="e.g. 20"
                    value={newCoupon.discountPercent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (No minimum)"
                    value={newCoupon.minOrderValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-orange"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Optional: Leave 0 for all orders</span>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-slate-700 font-bold mb-1">Promo Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% off for festive season on all men's streetwear orders"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-brand-border"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase rounded-xl transition-all shadow-brand"
                >
                  Publish & Activate Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCoupon(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-brand-dark text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Coupons List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 bg-white ${
                  coupon.isActive
                    ? 'border-brand-border shadow-xs hover:border-brand-orange'
                    : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold bg-orange-100 text-brand-orange">
                      {coupon.discountPercent}% OFF
                    </span>
                    <h3 className="text-base font-black font-mono text-brand-dark tracking-wider flex items-center gap-1.5">
                      <span>{coupon.code}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(coupon.code);
                          setNotification(`Copied coupon code ${coupon.code} to clipboard!`);
                          setTimeout(() => setNotification(''), 3000);
                        }}
                        title="Copy code"
                        className="text-slate-400 hover:text-brand-orange"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {coupon.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{coupon.description}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {coupon.minOrderValue && coupon.minOrderValue > 0
                      ? `Min Order: ₹${coupon.minOrderValue}`
                      : 'No Min Order Required'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(coupon.id)}
                      className="text-[11px] font-bold text-slate-600 hover:text-brand-orange underline"
                    >
                      {coupon.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Home Showcase 3D Banners (3 Large Cards) Management */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
            <div>
              <h2 className="text-xl font-bold font-display uppercase tracking-tight text-brand-dark flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-orange" />
                <span>Home Page Moving 3D Showcase Cards ({showcaseCards.length})</span>
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Stored permanently in Neon PostgreSQL <code className="bg-slate-100 text-brand-orange px-1 py-0.5 rounded font-mono font-bold">ShowcaseBanners</code> table. Add, edit, or delete as many moving cards as you want!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Auto-Saved to DB (Table: ShowcaseBanners)</span>
              </span>

              <button
                type="button"
                onClick={async () => {
                  const newCard: ShowcaseCardConfig = {
                    id: `card-${Date.now()}`,
                    categorySlug: categories[0]?.slug || 'all',
                    badgeLeft: 'NEW DROP',
                    badgeRight: '2026',
                    title: `STREET DROP ${showcaseCards.length + 1}`,
                    subtitle: 'Exclusive Streetwear Edition',
                    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=800&auto=format&fit=crop',
                  };
                  const updated = [...showcaseCards, newCard];
                  setShowcaseCards(updated);
                  await saveShowcaseCards(updated);
                  setNotification(`✓ Card ${updated.length} added & auto-saved to Neon DB (ShowcaseBanners)!`);
                  setTimeout(() => setNotification(''), 4000);
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Card</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await saveShowcaseCards(showcaseCards);
                  setNotification('✓ All Showcase Cards Published & Synchronized to Neon Database (ShowcaseBanners)!');
                  setTimeout(() => setNotification(''), 4000);
                }}
                className="px-4 py-2 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase rounded-xl transition-all shadow-brand flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish Live to Storefront</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm('Reset showcase cards to official defaults?')) {
                    setShowcaseCards(DEFAULT_SHOWCASE_CARDS);
                    await saveShowcaseCards(DEFAULT_SHOWCASE_CARDS);
                    setNotification('Reset to default showcase banners!');
                    setTimeout(() => setNotification(''), 3000);
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Cards Editor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcaseCards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="bg-white rounded-2xl border-2 border-brand-border/80 overflow-hidden shadow-sm hover:border-brand-orange/60 transition-all flex flex-col"
              >
                {/* Header with Slot & Delete Button */}
                <div className="p-3 bg-brand-surface border-b border-brand-border flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-brand-dark">
                    Card {idx + 1}: {card.title}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-brand-orange text-white font-bold px-2 py-0.5 rounded-full uppercase">
                      Slot {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (showcaseCards.length <= 1) {
                          alert('You must keep at least 1 showcase card.');
                          return;
                        }
                        if (confirm(`Delete Card "${card.title}"?`)) {
                          await deleteShowcaseCardDb(card.id);
                          const updated = showcaseCards.filter((_, i) => i !== idx);
                          setShowcaseCards(updated);
                          await saveShowcaseCards(updated);
                          setNotification(`Card ${idx + 1} deleted from database.`);
                          setTimeout(() => setNotification(''), 3000);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Live Preview */}
                <div className="p-4 bg-slate-50 flex flex-col items-center">
                  <div className="w-40 aspect-[3/4] rounded-2xl overflow-hidden relative shadow-md border border-slate-200 bg-slate-200">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_SHOWCASE_CARDS[idx]?.imageUrl || '';
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-brand-orange text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                      {card.badgeLeft}
                    </span>
                    <span className="absolute top-2 right-2 bg-black/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                      {card.badgeRight}
                    </span>
                    <div className="absolute bottom-2 left-2 right-2 text-center bg-black/70 backdrop-blur-xs text-white text-[10px] font-black py-1 px-1 rounded-lg">
                      {card.title}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Live Card Preview</p>
                </div>

                {/* Edit Form */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Card Image URL</label>
                      <input
                        type="url"
                        value={card.imageUrl}
                        onChange={(e) => {
                          const updated = [...showcaseCards];
                          updated[idx] = { ...updated[idx], imageUrl: e.target.value };
                          setShowcaseCards(updated);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-2 text-xs rounded-lg border border-brand-border bg-white focus:ring-1 focus:ring-brand-orange"
                      />
                    </div>

                    {/* Direct File Upload via Cloudinary */}
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Or Upload From Device</label>
                      <label className="flex items-center justify-center gap-1.5 p-2 bg-amber-50 hover:bg-amber-100 border border-brand-orange/40 rounded-lg cursor-pointer text-brand-dark font-bold text-xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-brand-orange" />
                        <span>{isUploadingShowcase === idx ? 'Uploading to Cloud...' : 'Choose Device Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingShowcase !== null}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setIsUploadingShowcase(idx);
                              const uploaded = await uploadProductImage(file);
                              const updated = [...showcaseCards];
                              updated[idx] = { ...updated[idx], imageUrl: uploaded.url };
                              setShowcaseCards(updated);
                              await saveShowcaseCards(updated);
                              setNotification(`✓ Photo uploaded for Card ${idx + 1} & auto-saved to Neon DB (ShowcaseBanners)!`);
                              setTimeout(() => setNotification(''), 4000);
                            } catch (err: any) {
                              alert(`Upload failed: ${err.message || 'Please try another photo'}`);
                            } finally {
                              setIsUploadingShowcase(null);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Left Badge</label>
                        <input
                          type="text"
                          value={card.badgeLeft}
                          onChange={(e) => {
                            const updated = [...showcaseCards];
                            updated[idx] = { ...updated[idx], badgeLeft: e.target.value };
                            setShowcaseCards(updated);
                          }}
                          onBlur={async () => {
                            await saveShowcaseCards(showcaseCards);
                          }}
                          placeholder="e.g. 240 GSM COTTON"
                          className="w-full p-2 text-xs rounded-lg border border-brand-border"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Right Badge</label>
                        <input
                          type="text"
                          value={card.badgeRight}
                          onChange={(e) => {
                            const updated = [...showcaseCards];
                            updated[idx] = { ...updated[idx], badgeRight: e.target.value };
                            setShowcaseCards(updated);
                          }}
                          onBlur={async () => {
                            await saveShowcaseCards(showcaseCards);
                          }}
                          placeholder="e.g. OVERSIZED"
                          className="w-full p-2 text-xs rounded-lg border border-brand-border"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Card Title</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => {
                          const updated = [...showcaseCards];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setShowcaseCards(updated);
                        }}
                        onBlur={async () => {
                          await saveShowcaseCards(showcaseCards);
                        }}
                        placeholder="e.g. OVERSIZED TEES"
                        className="w-full p-2 text-xs rounded-lg border border-brand-border font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Subtitle / Material Drip</label>
                      <input
                        type="text"
                        value={card.subtitle}
                        onChange={(e) => {
                          const updated = [...showcaseCards];
                          updated[idx] = { ...updated[idx], subtitle: e.target.value };
                          setShowcaseCards(updated);
                        }}
                        onBlur={async () => {
                          await saveShowcaseCards(showcaseCards);
                        }}
                        placeholder="e.g. Graphic, Plain & Acid-Wash Drips"
                        className="w-full p-2 text-xs rounded-lg border border-brand-border"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Link Category</label>
                      <select
                        value={card.categorySlug}
                        onChange={async (e) => {
                          const updated = [...showcaseCards];
                          updated[idx] = { ...updated[idx], categorySlug: e.target.value };
                          setShowcaseCards(updated);
                          await saveShowcaseCards(updated);
                        }}
                        className="w-full p-2 text-xs rounded-lg border border-brand-border bg-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name} ({c.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLEAR ALL PRODUCTS SAFETY CONFIRMATION MODAL */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-red-200 animate-scale-up">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-brand-dark uppercase tracking-tight">
                  Clear All Products?
                </h3>
                <p className="text-xs text-red-700 font-semibold">
                  Safety Confirmation Required
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-brand-muted">
              <p className="leading-relaxed">
                Are you sure you want to delete all <strong className="text-brand-dark">{products.length} products</strong> from the store? This will permanently wipe all active drops from your Neon PostgreSQL database.
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="block text-[11px] font-bold text-brand-dark uppercase tracking-wider">
                  Type <span className="text-red-600 font-mono font-black">CLEAR</span> below to confirm:
                </label>
                <input
                  type="text"
                  placeholder="Type CLEAR"
                  value={clearAllConfirmText}
                  onChange={(e) => setClearAllConfirmText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono text-xs uppercase tracking-wider bg-white focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearAllModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-brand-dark text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={clearAllConfirmText.trim().toUpperCase() !== 'CLEAR'}
                  onClick={handleConfirmClearAll}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Wipe All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
