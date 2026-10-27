import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Heart,
  Star,
  Truck,
  Ruler,
  ShoppingBag,
  Sparkles,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Tag,
  Copy,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  RotateCcw,
  Video,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';
import { SizeGuideModal } from '../components/common/SizeGuideModal';
import { Size, Product } from '../types';
import { MEN_REVIEWS } from '../data/mockData';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const product = products.find((p) => p.slug === slug) || products[0];

  const [activeMediaIndex, setActiveMediaIndex] = useState(0); // 0..images.length, or images.length = video
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [selectedSize, setSelectedSize] = useState<Size>('L');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState<{
    status: 'success' | 'error';
    city: string;
    duration: string;
    badge: string;
    details: string;
  } | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<'fabric' | 'care' | 'shipping' | null>('fabric');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Reviews state
  const [reviewsList, setReviewsList] = useState(MEN_REVIEWS);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState(false);

  // Compute unique colorways across all variants
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    const map = new Map<string, { name: string; hex: string }>();
    product.variants.forEach((v) => {
      if (v.colorName && !map.has(v.colorName)) {
        map.set(v.colorName, {
          name: v.colorName,
          hex: v.colorHex || '#111111',
        });
      }
    });
    return Array.from(map.values());
  }, [product]);

  // Sync color from URL query param (?color=Pure+White) or default to first variant
  useEffect(() => {
    if (!product?.variants?.length) return;

    const urlColor = searchParams.get('color');
    if (urlColor) {
      const match = product.variants.find(
        (v) => v.colorName?.toLowerCase() === urlColor.toLowerCase()
      );
      if (match) {
        setSelectedColor(match.colorName);
        setSelectedSize(match.size || 'L');
        return;
      }
    }

    // Default to first variant
    setSelectedSize(product.variants[0].size || 'L');
    setSelectedColor(product.variants[0].colorName || '');
  }, [product, searchParams]);

  // Reset media preview on product change
  useEffect(() => {
    setActiveMediaIndex(0);
    setIsVideoActive(false);
  }, [product?.id]);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 text-center space-y-4">
        <p className="text-xl font-bold">Product not found</p>
        <Link to="/shop" className="text-brand-orange underline">Return to Shop</Link>
      </div>
    );
  }

  // Selected variant
  const currentVariant =
    product.variants.find((v) => v.size === selectedSize && v.colorName === selectedColor) ||
    product.variants.find((v) => v.size === selectedSize) ||
    product.variants.find((v) => v.colorName === selectedColor) ||
    product.variants[0];

  const currentPrice =
    (product.salePrice ?? product.basePrice) + (currentVariant?.priceAdjustment || 0);

  // Offers & Club prices
  const clubPrice = Math.round(currentPrice * 0.88);
  const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim().length > 0);

  // Recommendations / Suggestions (related products in same or complementary category)
  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  }, [products, product.id]);

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    setSearchParams({ color: colorName }, { replace: true });

    // If an image has altText matching the color, switch to it
    const matchingImgIdx = product.images.findIndex(
      (img) => img.altText?.toLowerCase().includes(colorName.toLowerCase())
    );
    if (matchingImgIdx !== -1) {
      setActiveMediaIndex(matchingImgIdx);
      setIsVideoActive(false);
    }
  };

  // Filter unique sizes for the currently selected colorway (Fixes duplicate S S S buttons)
  const availableSizesForColor = useMemo(() => {
    if (!product?.variants) return [];
    const forColor = product.variants.filter(
      (v) => !selectedColor || !v.colorName || v.colorName.toLowerCase() === selectedColor.toLowerCase()
    );
    const list = forColor.length > 0 ? forColor : product.variants;
    // Map to keep exactly one button per size
    const map = new Map<string, typeof product.variants[0]>();
    list.forEach((v) => {
      if (!map.has(v.size)) {
        map.set(v.size, v);
      }
    });

    const isShoe =
      product.category?.toLowerCase().includes('shoe') ||
      product.category?.toLowerCase().includes('sneaker');
    const orderList = isShoe
      ? ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
      : ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'FreeSize'];

    return Array.from(map.values()).sort((a, b) => {
      const idxA = orderList.indexOf(a.size);
      const idxB = orderList.indexOf(b.size);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.size.localeCompare(b.size);
    });
  }, [product, selectedColor]);

  const calculateDeliveryByPincode = (code: string) => {
    const clean = code.trim();
    if (!/^\d{6}$/.test(clean)) {
      return {
        status: 'error' as const,
        city: '',
        duration: '',
        badge: '',
        details: 'Please enter a valid 6-digit Indian postal code.',
      };
    }

    const prefix3 = parseInt(clean.substring(0, 3), 10);
    const prefix2 = parseInt(clean.substring(0, 2), 10);
    const prefix1 = clean[0];

    // 1. Virudhunagar district (Store location: 626xxx)
    if (prefix3 === 626) {
      return {
        status: 'success' as const,
        city: 'Virudhunagar & Local District',
        duration: 'Same-day or 24 Hours Express',
        badge: '⚡ Local Store Priority',
        details: 'Dispatched directly from LIKE CLOTHING Virudhunagar Flagship Store within 12-24 hours.',
      };
    }

    // 2. Madurai / Tirunelveli / Tuticorin / Dindigul (624, 625, 627, 628)
    if (prefix3 === 625 || prefix3 === 624 || prefix3 === 627 || prefix3 === 628) {
      const cityMap: Record<number, string> = {
        625: 'Madurai / Usilampatti / Tirumangalam',
        624: 'Dindigul',
        627: 'Tirunelveli / Tenkasi',
        628: 'Thoothukudi / Tuticorin',
      };
      return {
        status: 'success' as const,
        city: cityMap[prefix3] || 'South Tamil Nadu',
        duration: '1 - 2 Business Days',
        badge: '⚡ Fast Regional Ground/Air',
        details: `Dispatched from Virudhunagar via Express Courier to ${cityMap[prefix3] || 'South TN'} within 24-48 hours.`,
      };
    }

    // 3. Chennai Metropolitan (600 - 603)
    if (prefix3 >= 600 && prefix3 <= 603) {
      return {
        status: 'success' as const,
        city: 'Chennai & Metropolitan Area',
        duration: '2 Business Days',
        badge: '✈️ Express Air Courier',
        details: 'Next-day air cargo dispatch to Chennai via BlueDart / Delhivery.',
      };
    }

    // 4. Coimbatore, Tiruppur, Salem, Trichy, Erode
    if ([641, 642, 638, 636, 620].includes(prefix3)) {
      const cityMap: Record<number, string> = {
        641: 'Coimbatore',
        642: 'Pollachi',
        638: 'Erode',
        636: 'Salem',
        620: 'Tiruchirappalli (Trichy)',
      };
      return {
        status: 'success' as const,
        city: cityMap[prefix3] || 'Central / Western Tamil Nadu',
        duration: '1 - 2 Business Days',
        badge: '🚚 Tamil Nadu Fast Track',
        details: `Express courier to ${cityMap[prefix3] || 'Tamil Nadu'} in 24-48 hours.`,
      };
    }

    // 5. Rest of Tamil Nadu (60xxxx - 64xxxx)
    if (prefix2 >= 60 && prefix2 <= 64) {
      return {
        status: 'success' as const,
        city: 'Tamil Nadu & Puducherry',
        duration: '2 - 3 Business Days',
        badge: '🚚 State Express',
        details: 'Guaranteed express delivery across Tamil Nadu taluks within 2-3 business days.',
      };
    }

    // 6. Kerala (67xxxx - 69xxxx)
    if (prefix2 >= 67 && prefix2 <= 69) {
      return {
        status: 'success' as const,
        city: 'Kerala',
        duration: '2 - 3 Business Days',
        badge: '🚚 South Corridor Express',
        details: 'Doorstep delivery to Kochi, Trivandrum, Kozhikode within 2-3 business days.',
      };
    }

    // 7. Karnataka & Bengaluru (56xxxx - 59xxxx)
    if (prefix2 >= 56 && prefix2 <= 59) {
      return {
        status: 'success' as const,
        city: prefix2 === 56 ? 'Bengaluru (Bangalore)' : 'Karnataka',
        duration: '2 - 3 Business Days',
        badge: '✈️ Air Express',
        details: 'Direct air parcel to Bengaluru in 2-3 business days.',
      };
    }

    // 8. Andhra & Telangana / Hyderabad (50xxxx - 53xxxx)
    if (prefix2 >= 50 && prefix2 <= 53) {
      return {
        status: 'success' as const,
        city: prefix2 === 50 ? 'Hyderabad / Telangana' : 'Andhra Pradesh',
        duration: '2 - 3 Business Days',
        badge: '✈️ Air Express',
        details: 'Dispatched via express cargo within 2-3 business days.',
      };
    }

    // 9. Maharashtra & Mumbai / Pune (40xxxx - 44xxxx)
    if (prefix2 >= 40 && prefix2 <= 44) {
      return {
        status: 'success' as const,
        city: prefix2 === 40 ? 'Mumbai' : (prefix2 === 41 ? 'Pune' : 'Maharashtra'),
        duration: '3 - 4 Business Days',
        badge: '✈️ Pan-India Air',
        details: 'Air express shipping to Mumbai/Maharashtra in 3-4 business days.',
      };
    }

    // 10. Delhi NCR & North India (11xxxx - 28xxxx)
    if (prefix1 === '1' || prefix1 === '2') {
      return {
        status: 'success' as const,
        city: prefix2 === 11 ? 'Delhi NCR' : 'North India',
        duration: '3 - 4 Business Days',
        badge: '✈️ National Express',
        details: 'Doorstep air delivery across Delhi NCR and North India within 3-4 business days.',
      };
    }

    // 11. Rest of India
    return {
      status: 'success' as const,
      city: 'All India',
      duration: '3 - 5 Business Days',
      badge: '📦 Standard Express',
      details: 'All-India tracked doorstep delivery via BlueDart/Delhivery.',
    };
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const res = calculateDeliveryByPincode(pincode);
    setDeliveryResult(res);
  };

  const handleAddToCart = () => {
    if (currentVariant) {
      addToCart(product, currentVariant, 1);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/bag');
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handlePrevMedia = () => {
    const totalMedia = product.images.length + (hasVideo ? 1 : 0);
    if (totalMedia <= 1) return;
    if (isVideoActive) {
      setIsVideoActive(false);
      setActiveMediaIndex(product.images.length - 1);
    } else if (activeMediaIndex === 0 && hasVideo) {
      setIsVideoActive(true);
    } else {
      setActiveMediaIndex((prev) => Math.max(0, prev - 1));
      setIsVideoActive(false);
    }
  };

  const handleNextMedia = () => {
    const totalMedia = product.images.length + (hasVideo ? 1 : 0);
    if (totalMedia <= 1) return;
    if (activeMediaIndex === product.images.length - 1 && hasVideo) {
      setIsVideoActive(true);
    } else if (isVideoActive) {
      setIsVideoActive(false);
      setActiveMediaIndex(0);
    } else {
      setActiveMediaIndex((prev) => (prev + 1) % product.images.length);
      setIsVideoActive(false);
    }
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      userName: newReviewName.trim(),
      rating: newReviewRating,
      title: newReviewTitle.trim() || 'Verified Purchase',
      comment: newReviewComment.trim(),
      isVerifiedBuyer: true,
      date: 'Just now',
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewSuccessMsg(true);
    setNewReviewName('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setTimeout(() => {
      setIsWriteReviewOpen(false);
      setReviewSuccessMsg(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-12 pb-28 md:pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-brand-muted flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-brand-dark">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-dark">Men&apos;s Wear</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.categoryId}`} className="hover:text-brand-dark">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-brand-dark font-bold truncate max-w-[240px]">{product.title}</span>
      </nav>

      {/* BEWAKOOF-STYLE PRODUCT HERO SECTION (Screenshot 1 & 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* LEFT: Bewakoof Vertical Thumbnails Strip + Sticky Compact Main Photo Card (Screenshot 1) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-start lg:sticky lg:top-24 self-start">
          {/* Vertical Thumbnail Strip (Compact Left Side) */}
          <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[520px] w-full sm:w-20 shrink-0 pb-1 sm:pb-0 no-scrollbar">
            {product.images.map((img, idx) => {
              const isSelected = !isVideoActive && activeMediaIndex === idx;
              return (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => {
                    setActiveMediaIndex(idx);
                    setIsVideoActive(false);
                  }}
                  className={`relative w-16 sm:w-18 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-100 ${isSelected
                      ? 'border-brand-dark shadow-md ring-2 ring-brand-orange/40 scale-102'
                      : 'border-brand-border/80 hover:border-slate-400 opacity-80 hover:opacity-100'
                    }`}
                  title={img.altText || `Angle ${idx + 1}`}
                >
                  <img src={img.url} alt={img.altText || product.title} className="w-full h-full object-cover object-top" />
                  {/* Angle Label badge if specified */}
                  {img.altText && img.altText !== product.title && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-white font-bold py-0.5 text-center truncate">
                      {img.altText}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Video Thumbnail with Bewakoof Play Badge if videoUrl is attached */}
            {hasVideo && (
              <button
                type="button"
                onClick={() => setIsVideoActive(true)}
                className={`relative w-16 sm:w-18 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-900 flex flex-col items-center justify-center text-white ${isVideoActive
                    ? 'border-brand-orange shadow-md ring-2 ring-brand-orange scale-102'
                    : 'border-brand-border/80 hover:border-brand-orange opacity-90'
                  }`}
                title="Watch Product Video"
              >
                {product.images[0]?.url && (
                  <img
                    src={product.images[0].url}
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover opacity-40"
                  />
                )}
                <div className="relative z-10 w-7 h-7 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-md">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
                <span className="relative z-10 text-[9px] font-black uppercase tracking-wider mt-1">
                  Video
                </span>
              </button>
            )}
          </div>

          {/* Center Main Media Preview (Compact Proportion - No Empty Space) */}
          <div className="relative flex-1 w-full max-w-[500px] aspect-[3/4] max-h-[580px] rounded-2xl overflow-hidden bg-slate-100 border border-brand-border shadow-md group">
            {isVideoActive && product.videoUrl ? (
              <div className="w-full h-full bg-black flex items-center justify-center relative">
                {product.videoUrl.includes('youtube.com') || product.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={
                      product.videoUrl.includes('embed')
                        ? product.videoUrl
                        : `https://www.youtube.com/embed/${product.videoUrl.split('v=')[1]?.split('&')[0] || ''}?autoplay=1`
                    }
                    title={product.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={product.videoUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setIsVideoActive(false)}
                  className="absolute top-3 left-3 bg-black/70 hover:bg-black text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm transition-colors"
                >
                  ✕ Close Video
                </button>
              </div>
            ) : (
              <img
                src={product.images[activeMediaIndex]?.url || product.images[0]?.url}
                alt={product.title}
                className="w-full h-full object-cover object-top transition-transform duration-500"
              />
            )}

            {/* Left/Right Next & Prev Navigation Arrows */}
            <button
              type="button"
              onClick={handlePrevMedia}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-brand-dark flex items-center justify-center shadow-md opacity-80 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMedia}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-brand-dark flex items-center justify-center shadow-md opacity-80 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Wishlist Heart Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-dark hover:text-brand-orange shadow-md transition-all hover:scale-110"
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-brand-orange text-brand-orange' : 'stroke-[2]'
                  }`}
              />
            </button>

            {/* Fit Badge */}
            <span className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              {product.category?.includes('Shoe') ? 'Original Drop' : 'Oversized Fit'}
            </span>
          </div>
        </div>

        {/* RIGHT: Bewakoof Product Details & Purchasing Actions (Screenshot 1 & 2) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Brand & Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold text-brand-orange uppercase tracking-wider">
                {product.category}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-brand-muted font-mono font-medium">SKU: {product.sku}</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black text-brand-dark tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Star Rating & Buyer Count */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-black text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{product.rating || '4.9'}</span>
              </div>
              <span className="text-xs text-brand-muted font-medium">
                {product.reviewCount || 128} Verified Buyer Reviews
              </span>
            </div>
          </div>

          {/* Pricing Section with Strike-through and Discount */}
          <div className="p-3.5 bg-brand-surface rounded-2xl border border-brand-border flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black font-display text-brand-dark">
              {formatINR(currentPrice)}
            </span>
            {product.salePrice && product.salePrice < product.basePrice && (
              <span className="text-sm text-slate-400 line-through font-medium">
                {formatINR(product.basePrice)}
              </span>
            )}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="text-xs font-black bg-brand-orange text-white px-2 py-0.5 rounded-md uppercase tracking-wide">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Bewakoof Colorways Selector (Screenshot 1 & 2) */}
          {availableColors.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-brand-dark uppercase tracking-wider">
                  COLORWAY: <span className="text-brand-orange font-black">{selectedColor || availableColors[0]?.name}</span>
                </span>
                <span className="text-[11px] text-brand-muted font-medium">
                  {availableColors.length} Colors Available
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {availableColors.map((c) => {
                  const isSelected =
                    selectedColor.toLowerCase() === c.name.toLowerCase() ||
                    (!selectedColor && availableColors[0]?.name === c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => handleColorSelect(c.name)}
                      title={c.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all p-0.5 cursor-pointer ${isSelected
                          ? 'border-brand-orange scale-110 shadow-md ring-2 ring-brand-orange/40'
                          : 'border-transparent hover:scale-105'
                        }`}
                    >
                      <span
                        className="block w-full h-full rounded-full border border-black/15 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector with Men's Size Guide */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-brand-dark uppercase tracking-wider">Select Size</span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-brand-orange hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" /> Size guide &gt;
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableSizesForColor.map((variant) => {
                const isSelected = selectedSize === variant.size;
                const isOutOfStock = variant.stockQuantity <= 0;

                return (
                  <button
                    key={variant.id}
                    disabled={isOutOfStock}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`min-w-12 h-11 px-3 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center cursor-pointer ${isSelected
                        ? 'bg-brand-dark text-white border-brand-dark shadow-sm'
                        : isOutOfStock
                          ? 'bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed'
                          : 'bg-white text-brand-dark border-brand-border hover:border-brand-dark'
                      }`}
                  >
                    <span>{variant.size}</span>
                  </button>
                );
              })}
            </div>

            {/* Low stock alert */}
            {currentVariant && currentVariant.stockQuantity > 0 && currentVariant.stockQuantity <= 3 && (
              <p className="text-xs text-amber-700 flex items-center gap-1 font-semibold pt-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Hurry! Only {currentVariant.stockQuantity} items left in stock for size {currentVariant.size}!</span>
              </p>
            )}
          </div>

          {/* Bewakoof Style Action Buttons: ADD TO BAG & BUY NOW */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-500 text-brand-dark font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-brand-dark stroke-[2.5]" />
              <span>ADD TO BAG</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-brand transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>BUY NOW</span>
            </button>
          </div>

          {/* BEWAKOOF-STYLE: "Save extra with these offers" (Screenshot 1) */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-orange" />
              <span className="font-extrabold text-xs text-brand-dark uppercase tracking-wider">
                Save Extra With These Offers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Offer 1 */}
              <div className="p-3 bg-white rounded-xl border border-orange-100 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-brand-orange font-black text-xs">
                    <span>🎁 Buy 2 Get 10% OFF</span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Auto-applied in cart on combo orders
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 mt-2 block">
                  ✓ Auto-applied at checkout
                </span>
              </div>

              {/* Offer 2 */}
              <div className="p-3 bg-white rounded-xl border border-orange-100 flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-brand-dark font-black text-xs">
                    <span>⚡ FLAT 20% OFF</span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-0.5">
                    Orders above ₹1,499
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black bg-orange-100 text-brand-orange px-1.5 py-0.5 rounded">
                    LIKE20
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon('LIKE20')}
                    className="text-[10px] font-bold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCoupon === 'LIKE20' ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="p-3.5 bg-white rounded-xl border border-brand-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-orange" />
                <span>Check for Delivery Details</span>
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                FREE SHIPPING above ₹999
              </span>
            </div>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Pincode (e.g. 626001)"
                className="w-full text-xs p-2.5 rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-orange"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-brand-dark hover:bg-black text-white text-xs font-bold rounded-lg shrink-0 uppercase tracking-wider cursor-pointer"
              >
                Check
              </button>
            </form>
            {deliveryResult && deliveryResult.status === 'success' && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{deliveryResult.duration} ({deliveryResult.city})</span>
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {deliveryResult.badge}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  {deliveryResult.details}
                </p>
              </div>
            )}
            {deliveryResult && deliveryResult.status === 'error' && (
              <p className="text-xs text-red-600 font-semibold animate-fade-in">
                {deliveryResult.details}
              </p>
            )}
          </div>

          {/* Fabric, Care, and Highlights Accordions */}
          <div className="divide-y divide-brand-border border-y border-brand-border text-xs">
            <div className="py-3">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'fabric' ? null : 'fabric')}
                className="w-full flex items-center justify-between font-bold text-brand-dark uppercase tracking-wider text-left"
              >
                <span>Key Highlights & Fabric Details</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'fabric' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'fabric' && (
                <div className="pt-2 text-brand-muted space-y-1.5 leading-relaxed animate-fade-in">
                  <p>• <strong>Fabric:</strong> {product.fabric || '100% Combed Heavyweight Cotton'}</p>
                  <p>• <strong>Fit:</strong> Tailored relaxed streetwear silhouette.</p>
                  <p>• <strong>Brand:</strong> LIKE CLOTHING (喜欢) Virudhunagar Flagship Store</p>
                  <p>• <strong>Origin:</strong> Crafted in Tamil Nadu, India</p>
                </div>
              )}
            </div>

            <div className="py-3">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                className="w-full flex items-center justify-between font-bold text-brand-dark uppercase tracking-wider text-left"
              >
                <span>Wash & Care Instructions</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'care' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'care' && (
                <div className="pt-2 text-brand-muted space-y-1.5 leading-relaxed animate-fade-in">
                  <p>• {product.careInstructions || 'Machine wash cold with like colors.'}</p>
                  <p>• Do not tumble dry. Iron inside out if graphic printed.</p>
                </div>
              )}
            </div>

            <div className="py-3">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                className="w-full flex items-center justify-between font-bold text-brand-dark uppercase tracking-wider text-left"
              >
                <span>Free Express Shipping & 7-Day Exchange</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'shipping' && (
                <div className="pt-2 text-brand-muted space-y-1.5 leading-relaxed animate-fade-in">
                  <p>• Free air express shipping on all orders above ₹999.</p>
                  <p>• 7-day hassle-free doorstep size exchange available across all Indian cities.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REQUEST #2: CUSTOMER REVIEWS SECTION WITH STAR BREAKDOWN & WRITE REVIEW */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-orange" />
              <h2 className="font-display text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tight">
                Customer Ratings & Reviews
              </h2>
            </div>
            <p className="text-xs text-brand-muted mt-1">
              Real feedback from verified buyers across India
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsWriteReviewOpen(!isWriteReviewOpen)}
            className="px-5 py-2.5 bg-brand-dark hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer shrink-0"
          >
            {isWriteReviewOpen ? 'Close Form' : '✍️ Write a Review'}
          </button>
        </div>

        {/* Interactive Write Review Form */}
        {isWriteReviewOpen && (
          <form
            onSubmit={handleAddReviewSubmit}
            className="p-5 sm:p-6 bg-brand-surface rounded-2xl border border-brand-orange/40 space-y-4 animate-scale-up"
          >
            <h3 className="font-bold text-sm text-brand-dark uppercase tracking-wider">
              Share Your Experience With This Drop
            </h3>

            {reviewSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Thank you! Your verified review has been published.</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-dark">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 text-amber-500 hover:scale-120 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= newReviewRating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'
                        }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-brand-dark ml-2">
                  {newReviewRating} out of 5 Stars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Your Name (e.g. Karthik S.)"
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-brand-border text-xs focus:ring-1 focus:ring-brand-orange"
              />
              <input
                type="text"
                placeholder="Headline (e.g. Best oversized fit ever!)"
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-brand-border text-xs focus:ring-1 focus:ring-brand-orange"
              />
            </div>

            <textarea
              rows={3}
              required
              placeholder="Tell other streetwear enthusiasts about the fit, fabric quality, and comfort..."
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-brand-border text-xs focus:ring-1 focus:ring-brand-orange"
            />

            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-orange text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-orangeHover transition-colors cursor-pointer"
            >
              Submit Review
            </button>
          </form>
        )}

        {/* Rating Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Score */}
          <div className="md:col-span-4 p-5 bg-brand-surface rounded-2xl border border-brand-border text-center space-y-2">
            <span className="text-5xl font-black font-display text-brand-dark leading-none">
              4.9
            </span>
            <div className="flex items-center justify-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <p className="text-xs text-brand-muted">
              Based on {reviewsList.length + 124} verified ratings
            </p>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="md:col-span-8 space-y-2">
            {[
              { stars: 5, pct: 88, count: 112 },
              { stars: 4, pct: 9, count: 12 },
              { stars: 3, pct: 2, count: 3 },
              { stars: 2, pct: 1, count: 1 },
              { stars: 1, pct: 0, count: 0 },
            ].map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <span className="w-10 font-bold text-brand-dark shrink-0">{row.stars} ★</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-brand-muted shrink-0">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Reviews Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-brand-surface rounded-2xl border border-brand-border/80 space-y-2.5 transition-all hover:border-slate-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="text-[10px] text-brand-muted">{rev.date}</span>
              </div>

              <h4 className="font-bold text-xs sm:text-sm text-brand-dark leading-snug">
                {rev.title}
              </h4>

              <p className="text-xs text-brand-muted leading-relaxed">
                {rev.comment}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-brand-border/60 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-dark text-white font-bold flex items-center justify-center text-[10px]">
                    {rev.userName[0]?.toUpperCase()}
                  </span>
                  <span className="font-bold text-brand-dark">{rev.userName}</span>
                </div>
                <span className="text-emerald-700 font-extrabold flex items-center gap-1 text-[10px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* REQUEST #2: STREETWEAR SUGGESTIONS & RELATED DROPS ("You May Also Like") */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-brand-border pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                <span>COMPLETE THE FIT</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-brand-dark uppercase tracking-tight mt-0.5">
                You May Also Like
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              <span>View All Drops</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* STICKY BOTTOM ACTION BAR (Mobile Viewport < 768px) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-brand-muted uppercase tracking-wider block">Price</span>
          <span className="text-lg font-black text-brand-dark leading-none font-display">
            {formatINR(currentPrice)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <button
            onClick={handleAddToCart}
            className="w-1/2 py-2.5 bg-amber-400 text-brand-dark font-black text-xs rounded-xl shadow-xs uppercase tracking-wider"
          >
            Add
          </button>
          <button
            onClick={handleBuyNow}
            className="w-1/2 py-2.5 bg-brand-orange text-white font-black text-xs rounded-xl shadow-brand uppercase tracking-wider"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Men's Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
};
