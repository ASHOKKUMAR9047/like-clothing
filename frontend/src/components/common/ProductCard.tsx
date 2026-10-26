import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { formatINR } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, addToCart } = useCart();
  const isWishlisted = isInWishlist(product.id);

  const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url;
  const secondaryImage = product.images[1]?.url || primaryImage;

  const handleQuickAddSize = (e: React.MouseEvent, variant: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, variant, 1);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 0) {
      const firstAvailable = product.variants.find((v) => v.stockQuantity > 0) || product.variants[0];
      addToCart(product, firstAvailable, 1);
    }
  };

  const currentPrice = product.salePrice ?? product.basePrice;
  const clubPrice = Math.round(currentPrice * 0.88);
  const isShoe = product.category?.toLowerCase().includes('shoe') || product.category?.toLowerCase().includes('sneaker');

  const [selectedColorHex, setSelectedColorHex] = React.useState<string>(
    product.variants[0]?.colorHex || '#111111'
  );

  // Group unique colors so identical colors aren't repeated as 4 black dots
  const uniqueColorOptions = React.useMemo(() => {
    const map = new Map<string, { colorName: string; colorHex: string }>();
    product.variants.forEach((v) => {
      const hex = v.colorHex || '#111111';
      if (!map.has(hex)) {
        map.set(hex, { colorName: v.colorName || 'Default', colorHex: hex });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Sort sizes in proper order: S, M, L, XL, XXL, 3XL (or UK 6..11 for shoes)
  const CLOTHING_SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'FreeSize'];
  const SHOE_SIZE_ORDER = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

  const sortedVariants = React.useMemo(() => {
    const orderList = isShoe ? SHOE_SIZE_ORDER : CLOTHING_SIZE_ORDER;
    return [...product.variants].sort((a, b) => {
      const idxA = orderList.indexOf(a.size);
      const idxB = orderList.indexOf(b.size);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.size.localeCompare(b.size);
    });
  }, [product.variants, isShoe]);

  const [isColorModalOpen, setIsColorModalOpen] = React.useState<boolean>(false);

  const selectedColorObj = uniqueColorOptions.find((c) => c.colorHex === selectedColorHex) || uniqueColorOptions[0];
  const productUrl = selectedColorObj?.colorName
    ? `/product/${product.slug}?color=${encodeURIComponent(selectedColorObj.colorName)}`
    : `/product/${product.slug}`;

  return (
    <>
      <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-border hover:border-brand-orange/60 transition-all duration-300 hover:shadow-xl">
        {/* Image Container with 3:4 aspect ratio */}
        <Link to={productUrl} className="relative block aspect-[3/4] overflow-hidden bg-slate-100">
          <img
            src={primaryImage}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Secondary hover preview on desktop */}
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={product.title}
              loading="lazy"
              className="hidden md:block absolute inset-0 w-full h-full object-cover object-top opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isBestSeller && (
              <span className="bg-brand-dark text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-brand-orange" /> Best Seller
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-brand-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                New Drop
              </span>
            )}
            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="bg-black text-brand-orange text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-dark hover:text-brand-orange transition-all hover:scale-110 shadow-xs"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-brand-orange text-brand-orange' : 'stroke-[1.75]'
              }`}
            />
          </button>

          {/* Clean Streetwear Hover Overlay: Click to View Drop and Choose Size */}
          <div className="absolute bottom-0 inset-x-0 bg-brand-dark/90 backdrop-blur-md py-2.5 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 shadow-md flex items-center justify-center gap-1.5 text-white">
            <span className="text-[11px] font-black uppercase tracking-wider">View Drop • Select Size</span>
            <span className="text-brand-orange text-xs font-bold">→</span>
          </div>
        </Link>

        {/* Product Content Details */}
        <div className="p-3.5 flex flex-col flex-1 justify-between">
          <div>
            {/* Category / Fabric */}
            <div className="flex items-center justify-between text-[11px] text-brand-muted mb-1">
              <span className="truncate max-w-[130px] font-medium uppercase tracking-wider text-[10px] text-slate-400">
                {product.category || 'Streetwear'}
              </span>
              <div className="flex items-center gap-0.5 text-amber-600 font-semibold shrink-0">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{product.rating}</span>
                <span className="text-slate-400 text-[10px]">({product.reviewCount})</span>
              </div>
            </div>

            {/* Title */}
            <Link to={productUrl} className="block group-hover:text-brand-orange transition-colors">
              <h3 className="font-bold text-xs sm:text-sm text-brand-dark line-clamp-1 leading-snug">
                {product.title}
              </h3>
            </Link>

            {/* Bewakoof Style: Color Swatches + "Choose your Color" Modal Trigger */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                {uniqueColorOptions.map((c) => {
                  const isSelected = selectedColorHex === c.colorHex;
                  return (
                    <button
                      key={c.colorHex}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedColorHex(c.colorHex);
                      }}
                      title={c.colorName}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        isSelected
                          ? 'ring-2 ring-brand-orange ring-offset-1 scale-125 border-white'
                          : 'border-slate-300 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.colorHex }}
                    />
                  );
                })}
                <span className="text-[10px] text-brand-muted font-medium ml-1">
                  {uniqueColorOptions.find((c) => c.colorHex === selectedColorHex)?.colorName}
                </span>
              </div>

              {/* Bewakoof Style: Quick Color Preview Button */}
              {uniqueColorOptions.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsColorModalOpen(true);
                  }}
                  className="text-[10px] font-bold text-brand-orange hover:underline cursor-pointer"
                  title="View all colorways"
                >
                  +{uniqueColorOptions.length} Colors
                </button>
              )}
            </div>
          </div>

          {/* The Souled Store Style: Price + Member Club Price Tag */}
          <div className="mt-3 pt-2.5 border-t border-brand-border/60">
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-base sm:text-lg text-brand-dark">
                {formatINR(currentPrice)}
              </span>
              {product.salePrice && product.salePrice < product.basePrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatINR(product.basePrice)}
                </span>
              )}
            </div>

            {/* Member Club Price */}
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-orange bg-orange-50 px-2 py-0.5 rounded border border-orange-200 inline-block">
                ₹{clubPrice} for VIP Club
              </span>
              <button
                onClick={handleQuickAdd}
                className="md:hidden text-[11px] font-black text-brand-orange bg-orange-100 hover:bg-brand-orange hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BEWAKOOF-STYLE "CHOOSE YOUR COLOR" MODAL (Screenshot 4) */}
      {isColorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-brand-border animate-scale-up">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-brand-border flex items-start justify-between">
              <div>
                <h3 className="font-black font-display text-base sm:text-lg text-brand-dark uppercase tracking-tight">
                  Choose your Color
                </h3>
                <p className="text-xs text-brand-muted truncate max-w-xs sm:max-w-md mt-0.5">
                  {product.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-brand-dark transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Color Cards Grid (Just like Bewakoof Screenshot 4!) */}
            <div className="p-4 sm:p-5 grid grid-cols-2 gap-3 sm:gap-4 max-h-[60vh] overflow-y-auto">
              {uniqueColorOptions.map((c) => {
                const isSelected = selectedColorHex === c.colorHex;
                return (
                  <div
                    key={c.colorHex}
                    onClick={() => {
                      setSelectedColorHex(c.colorHex);
                      setIsColorModalOpen(false);
                      navigate(`/product/${product.slug}?color=${encodeURIComponent(c.colorName)}`);
                    }}
                    className={`rounded-2xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-lg ${
                      isSelected
                        ? 'border-brand-orange bg-orange-50/30 ring-2 ring-brand-orange/30'
                        : 'border-brand-border hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="aspect-[3/4] relative bg-slate-100 overflow-hidden">
                      <img
                        src={primaryImage}
                        alt={`${product.title} in ${c.colorName}`}
                        className="w-full h-full object-cover object-top"
                      />
                      <span className="absolute top-2 left-2 bg-black/75 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                        {isShoe ? 'Sneaker' : 'Oversized Fit'}
                      </span>
                      <span className="absolute bottom-2 left-2 bg-white/90 text-brand-dark text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                        ★ {product.rating}
                      </span>
                    </div>

                    <div className="p-3 space-y-1 text-left">
                      <p className="font-extrabold text-sm text-brand-dark">
                        {formatINR(currentPrice)}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: c.colorHex }}
                        />
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {c.colorName}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-brand-border bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Tap on any colorway to select
              </span>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(false)}
                className="px-4 py-2 bg-brand-dark text-white font-bold rounded-xl hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
