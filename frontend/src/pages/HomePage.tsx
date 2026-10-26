import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MEN_REVIEWS } from '../data/mockData';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';
import { BrandLogo } from '../components/common/BrandLogo';

import { getShowcaseCards, DEFAULT_SHOWCASE_CARDS, fetchShowcaseCardsFromDb } from '../utils/showcaseConfig';
import { ShowcaseCardConfig } from '../types';
import { API_BASE_URL } from '../config/api';

export const HomePage: React.FC = () => {
  const { products, categories } = useProducts();
  const [selectedHomeCat, setSelectedHomeCat] = useState<string>('all');
  const [showcaseCards, setShowcaseCards] = useState<ShowcaseCardConfig[]>(() => getShowcaseCards());
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<{
    code: string;
    discountPercent: number;
    minOrderValue: number;
    description: string;
  } | null>(null);

  // Load active coupon dynamically from server or local state
  useEffect(() => {
    const fetchActiveCoupon = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/coupons`);
        if (res.ok) {
          const json = await res.json();
          const liveList = json.data || [];
          const active = liveList.find((c: any) => c.isActive);
          if (active) {
            setActiveCoupon({
              code: active.code,
              discountPercent: active.discountPercentage ?? active.discountValue ?? 0,
              minOrderValue: active.minOrderAmount ?? 0,
              description: active.description || '',
            });
            return;
          }
        }
      } catch {
        // Fallback to local storage if API is busy
      }

      const saved = localStorage.getItem('like_clothing_coupons');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          const active = list.find((c: any) => c.isActive);
          if (active) {
            setActiveCoupon({
              code: active.code,
              discountPercent: active.discountPercent ?? active.discountPercentage ?? 0,
              minOrderValue: active.minOrderValue ?? active.minOrderAmount ?? 0,
              description: active.description || '',
            });
          }
        } catch {}
      }
    };

    fetchActiveCoupon();
  }, []);

  // Load from database on mount & listen for live updates from Admin Console
  useEffect(() => {
    fetchShowcaseCardsFromDb().then((cards) => {
      if (cards && cards.length > 0) setShowcaseCards(cards);
    });

    const handleUpdate = () => {
      setShowcaseCards(getShowcaseCards());
    };
    window.addEventListener('like_clothing_showcase_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('like_clothing_showcase_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Moving 3D Carousel Auto-Scroll (Smooth gentle moving effect, pauses on hover)
  useEffect(() => {
    if (isCarouselHovered || showcaseCards.length <= 1) return;

    const timer = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const maxScroll = scrollWidth - clientWidth;
        // If at the end, smoothly rewind to start, else scroll right by card width
        if (scrollLeft >= maxScroll - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 3200);

    return () => clearInterval(timer);
  }, [isCarouselHovered, showcaseCards.length]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter products for the Live Home Catalog Section
  const displayProducts = React.useMemo(() => {
    if (selectedHomeCat === 'all') return products;
    return products.filter((p) => {
      const cat = categories.find((c) => c.slug === selectedHomeCat);
      return (
        (cat && p.categoryId === cat.id) ||
        (cat && p.category?.toLowerCase() === cat.name.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(selectedHomeCat.replace(/-/g, ' ')))
      );
    });
  }, [products, selectedHomeCat, categories]);

  return (
    <div className="space-y-10 sm:space-y-14 pb-20 bg-white">
      {/* 1. BEWAKOOF-STYLE "SHOP FOR MEN" MOVING 3D HERO SHOWCASE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-400/20 via-orange-50/60 to-white pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Top Brand & Tagline with 3D Pill Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md border border-brand-orange/40 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md shadow-brand-orange/10 transform-gpu hover:scale-105 transition-all max-w-[95%]">
            <BrandLogo size="sm" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-brand-orange whitespace-nowrap overflow-hidden text-ellipsis">
              • VIRUDHUNAGAR FLAGSHIP STORE • MEN&apos;S ONLY
            </span>
          </div>

          {/* Trademark "SHOP FOR MEN" Header */}
          <div>
            <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-slate-500 block">
              100% EXCLUSIVE STREETWEAR FOR MEN
            </span>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-brand-dark tracking-tight uppercase mt-1">
              SHOP FOR <span className="text-brand-orange">MEN</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted max-w-lg mx-auto mt-2">
              Heavyweight 240 GSM Combed Cotton • European Linen • Tactical Cargos • Street Kicks
            </p>
          </div>

          {/* Moving 3D Showcase Carousel Track (Dynamic from Database) */}
          <div
            className="relative max-w-6xl mx-auto pt-4 group"
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            {/* Left Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollCarousel('left')}
              className="absolute left-1 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-brand-border shadow-xl flex items-center justify-center text-brand-dark hover:text-brand-orange hover:scale-110 transition-all cursor-pointer"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Right Scroll Arrow */}
            <button
              type="button"
              onClick={() => scrollCarousel('right')}
              className="absolute right-1 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-brand-border shadow-xl flex items-center justify-center text-brand-dark hover:text-brand-orange hover:scale-110 transition-all cursor-pointer"
              aria-label="Next card"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Scroll Container */}
            <div
              ref={carouselRef}
              className="flex items-center gap-5 sm:gap-6 overflow-x-auto py-3 px-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
            >
              {showcaseCards.map((card, idx) => (
                <Link
                  key={card.id || idx}
                  to={`/shop?category=${card.categorySlug}`}
                  className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-center group/card relative rounded-3xl overflow-hidden border-2 border-brand-border/80 hover:border-brand-orange transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-orange/20 bg-white block text-center transform-gpu"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-slate-100 relative">
                    <img
                      src={card.imageUrl}
                      alt={card.title}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/card:scale-108"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_SHOWCASE_CARDS[idx % DEFAULT_SHOWCASE_CARDS.length]?.imageUrl || '';
                      }}
                    />
                    {/* 3D Floating Left Pill Badge */}
                    <span className="absolute top-3.5 left-3.5 bg-brand-orange/95 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-orange-500/30 border border-white/20">
                      {card.badgeLeft}
                    </span>
                    {/* 3D Floating Right Pill Badge */}
                    <span className="absolute top-3.5 right-3.5 bg-black/85 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-md">
                      {card.badgeRight}
                    </span>
                  </div>
                  <div className="p-4 bg-white border-t border-brand-border group-hover/card:bg-amber-50/30 transition-colors">
                    <span className="inline-block px-5 py-2.5 bg-brand-dark group-hover/card:bg-brand-orange text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md group-hover/card:shadow-brand-orange/30 w-full transform group-hover/card:scale-[1.02]">
                      {card.title}
                    </span>
                    <p className="text-[11px] text-brand-muted mt-1 font-medium">{card.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Moving Indicator Tag */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                • Auto-moving carousel • {showcaseCards.length} live drops • Swipe or click arrows
              </span>
            </div>
          </div>

          {/* Trust Highlights with 3D Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-700 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-xs border border-brand-border/60">
              <ShieldCheck className="w-4 h-4 text-brand-orange" /> 100% Combed Cotton
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-xs border border-brand-border/60">
              <Truck className="w-4 h-4 text-brand-orange" /> Pan-India Express Delivery
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-xs border border-brand-border/60">
              <RotateCcw className="w-4 h-4 text-brand-orange" /> 7-Day Easy Exchange
            </span>
          </div>
        </div>
      </section>

      {/* 3. Flash Coupon Banner / Fallback Offers Banner (Screenshot 4) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeCoupon ? (
          <div className="bg-gradient-to-r from-brand-orange via-amber-600 to-brand-orange text-white p-4 sm:p-5 rounded-2xl shadow-brand flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wide">
                  FLAT {activeCoupon.discountPercent}% OFF ON ORDERS ABOVE ₹{activeCoupon.minOrderValue.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-orange-100">
                  Use coupon code <span className="font-mono font-bold bg-white/25 px-1.5 py-0.5 rounded text-white">{activeCoupon.code}</span> at checkout! {activeCoupon.description}
                </p>
              </div>
            </div>
            <Link
              to="/shop"
              className="px-5 py-2.5 bg-white text-brand-dark hover:bg-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
            >
              Shop Discount Drops
            </Link>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-dark via-slate-900 to-brand-dark text-white p-4 sm:p-5 rounded-2xl shadow-brand border border-brand-orange/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/20 border border-brand-orange/40 backdrop-blur-md flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <p className="font-black text-sm uppercase tracking-wide flex items-center gap-2 justify-center sm:justify-start">
                  <span>FREE EXPRESS SHIPPING ACROSS ALL INDIA</span>
                  <span className="text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded-full font-bold">VIP DROP</span>
                </p>
                <p className="text-xs text-slate-300">
                  On all prepaid & COD orders above ₹999 • Dispatched directly from Virudhunagar flagship store
                </p>
              </div>
            </div>
            <Link
              to="/shop"
              className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
            >
              Explore Streetwear Drops
            </Link>
          </div>
        )}
      </section>

      {/* 4. Live Streetwear Drops Grid (Screenshot 3 Flow!) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-brand-border/80 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-orange uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-brand-orange" />
              <span>LIKE CLOTHING • VIRUDHUNAGAR</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-brand-dark tracking-tight mt-0.5">
              ALL MEN&apos;S WEAR
            </h2>
            <p className="text-xs text-brand-muted mt-1">
              Showing {displayProducts.length} live drops available in store right now
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar shrink-0">
            <button
              onClick={() => setSelectedHomeCat('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedHomeCat === 'all'
                  ? 'bg-brand-dark text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Drops
            </button>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedHomeCat(cat.slug)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedHomeCat === cat.slug
                    ? 'bg-brand-orange text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid with Choose Your Color Modal */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View Full Catalog Link */}
        <div className="text-center pt-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-dark hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-md transition-all hover:scale-105"
          >
            <span>View Full Men&apos;s Store Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Customer Reviews Section */}
      <section className="bg-slate-50 py-12 border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">
              Verified Shopper Love
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-brand-dark mt-1">
              Virudhunagar & Tamil Nadu Reviews
            </h2>
            <p className="text-xs text-brand-muted mt-2">
              Over 2,400+ happy men styling LIKE CLOTHING across Tamil Nadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MEN_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-white p-5 rounded-2xl border border-brand-border/80 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-1 text-amber-500">
                  {'★'.repeat(review.rating)}
                </div>
                <h4 className="font-bold text-sm text-brand-dark">{review.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-brand-muted">
                  <span className="font-bold text-brand-dark">{review.userName}</span>
                  <span className="text-emerald-600 font-semibold">✓ Verified Buyer</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
