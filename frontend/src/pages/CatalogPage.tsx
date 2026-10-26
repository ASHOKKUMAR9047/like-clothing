import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/common/ProductCard';
import { Size } from '../types';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories } = useProducts();

  const selectedCategory = searchParams.get('category') || 'all';
  const searchQueryParam = searchParams.get('search') || '';

  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [priceRange, setPriceRange] = useState<'all' | 'under799' | '799to1499' | 'above1500'>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const isShoeCategory =
    selectedCategory === 'sneakers-shoes' ||
    selectedCategory.toLowerCase().includes('shoe') ||
    selectedCategory.toLowerCase().includes('sneaker');

  const availableSizes: Size[] = isShoeCategory
    ? ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11']
    : ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const handleSelectSize = (size: Size) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSelectCategory = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', slug);
    }
    setSelectedSizes([]);
    setSearchParams(nextParams);
    if (isMobileFilterOpen) setIsMobileFilterOpen(false);
  };

  const resetAllFilters = () => {
    setSelectedSizes([]);
    setPriceRange('all');
    setSortBy('featured');
    setSearchParams({});
    if (isMobileFilterOpen) setIsMobileFilterOpen(false);
  };

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  // Filter products cleanly
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category filter
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          const targetClean = selectedCategory.toLowerCase().replace(/[-_]/g, ' ');

          const matchesCategory =
            (cat && product.categoryId === cat.id) ||
            (cat && product.category && product.category.toLowerCase().includes(cat.name.toLowerCase())) ||
            (product.category && product.category.toLowerCase().includes(targetClean)) ||
            (product.title && product.title.toLowerCase().includes(targetClean)) ||
            (product.slug && product.slug.toLowerCase().includes(selectedCategory.toLowerCase()));

          if (!matchesCategory) return false;
        }

        // Search Query filter
        if (searchQueryParam) {
          const query = searchQueryParam.toLowerCase();
          const matchesTitle = product.title.toLowerCase().includes(query);
          const matchesSku = product.sku.toLowerCase().includes(query);
          const matchesFabric = product.fabric?.toLowerCase().includes(query);
          const matchesTag = product.tags?.some((t) => t.toLowerCase().includes(query));
          if (!matchesTitle && !matchesSku && !matchesFabric && !matchesTag) return false;
        }

        // Price filter
        const currentPrice = product.salePrice ?? product.basePrice;
        if (priceRange === 'under799' && currentPrice >= 799) return false;
        if (priceRange === '799to1499' && (currentPrice < 799 || currentPrice > 1499)) return false;
        if (priceRange === 'above1500' && currentPrice < 1500) return false;

        // Size filter
        if (selectedSizes.length > 0) {
          const hasMatchingSize = product.variants.some(
            (v) => selectedSizes.includes(v.size) && v.stockQuantity > 0
          );
          if (!hasMatchingSize) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.basePrice;
        const priceB = b.salePrice ?? b.basePrice;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
        if (sortBy === 'newest') return b.isNewArrival ? -1 : 1;
        return 0;
      });
  }, [products, selectedCategory, searchQueryParam, priceRange, selectedSizes, sortBy, categories]);

  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    selectedSizes.length +
    (priceRange !== 'all' ? 1 : 0) +
    (searchQueryParam ? 1 : 0);

  return (
    <div className="bg-slate-50/60 min-h-screen pb-24">
      {/* 1. Bewakoof-Style Clean Breadcrumbs & Page Header */}
      <div className="bg-white border-b border-brand-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-1.5 text-xs text-brand-muted mb-1.5">
            <Link to="/" className="hover:text-brand-orange transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/shop" className="hover:text-brand-orange transition-colors">
              Men
            </Link>
            {activeCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-brand-dark font-semibold truncate max-w-[200px]">
                  {activeCategoryObj.name}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-brand-dark">
                {activeCategoryObj ? activeCategoryObj.name : "Men's Streetwear & Clothing"}
              </h1>
              <p className="text-xs text-brand-muted mt-0.5">
                {searchQueryParam
                  ? `Search results for "${searchQueryParam}" • ${filteredProducts.length} items found`
                  : `Explore ${filteredProducts.length} fresh streetwear drops engineered for men`}
              </p>
            </div>

            {/* Mobile Filter & Sort Trigger Buttons */}
            <div className="flex items-center gap-2 lg:hidden pt-2">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-dark shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              <div className="flex-1 relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-dark shadow-2xs focus:outline-none"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bewakoof-Style 2-Column Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: Sticky Filters (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 space-y-6">
            <div className="bg-white rounded-2xl border border-brand-border p-5 shadow-xs space-y-6">
              {/* Filter Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-orange" />
                  <span className="font-bold text-sm uppercase tracking-wider text-brand-dark">
                    Filters
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* 1. Category Filter Accordion */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Categories
                </h3>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-orange-50 text-brand-orange font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Men&apos;s Wear</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{products.length}</span>
                  </button>

                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.slug;
                    const catCount = products.filter(
                      (p) =>
                        p.categoryId === cat.id ||
                        p.category?.toLowerCase() === cat.name.toLowerCase() ||
                        p.category?.toLowerCase().includes(cat.slug.replace(/-/g, ' '))
                    ).length;

                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.slug)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                          isSelected
                            ? 'bg-orange-50 text-brand-orange font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate pr-2">{cat.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {cat.slug === 'sneakers-shoes' && (
                            <span className="text-[8px] px-1 bg-red-600 text-white rounded font-black">
                              HOT
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-semibold">{catCount}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Size Filter Boxes */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {isShoeCategory ? 'Shoe Size' : 'Sizes'}
                  </h3>
                  {selectedSizes.length > 0 && (
                    <button
                      onClick={() => setSelectedSizes([])}
                      className="text-[10px] text-brand-orange font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSelectSize(sz)}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-brand-orange text-white border-brand-orange shadow-xs scale-105'
                            : 'bg-white hover:bg-slate-50 text-brand-dark border-brand-border'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Price Filter */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Price
                </h3>
                <div className="space-y-1.5 text-xs">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under799', label: 'Under ₹799' },
                    { id: '799to1499', label: '₹799 - ₹1,499' },
                    { id: 'above1500', label: '₹1,500 & Above' },
                  ].map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-brand-dark py-0.5"
                    >
                      <input
                        type="radio"
                        name="price-filter"
                        checked={priceRange === p.id}
                        onChange={() => setPriceRange(p.id as any)}
                        className="text-brand-orange focus:ring-brand-orange h-3.5 w-3.5"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Store Guarantee Box */}
              <div className="pt-4 border-t border-slate-100 bg-orange-50/50 p-3 rounded-xl border border-orange-100/60 text-[11px] text-brand-dark space-y-1">
                <p className="font-bold text-brand-orange flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>VIRUDHUNAGAR FLAGSHIP</span>
                </p>
                <p className="text-slate-600 leading-tight text-[10px]">
                  100% genuine combed cotton streetwear, pre-shrunk & bio-washed.
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT COLUMN: Products Grid & Top Sort Bar */}
          <main className="lg:col-span-9 space-y-5">
            {/* Desktop Sort & Active Tags Bar */}
            <div className="hidden lg:flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-brand-border shadow-2xs">
              {/* Active Filter Tags */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 text-brand-orange border border-orange-200 text-xs font-bold">
                    <span>{activeCategoryObj?.name}</span>
                    <button
                      onClick={() => handleSelectCategory('all')}
                      className="hover:text-black ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedSizes.map((sz) => (
                  <span
                    key={sz}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold"
                  >
                    <span>Size: {sz}</span>
                    <button onClick={() => handleSelectSize(sz)} className="hover:text-red-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {priceRange !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold">
                    <span>
                      {priceRange === 'under799'
                        ? 'Under ₹799'
                        : priceRange === '799to1499'
                        ? '₹799 - ₹1,499'
                        : '₹1,500+'}
                    </span>
                    <button onClick={() => setPriceRange('all')} className="hover:text-red-500 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {activeFiltersCount === 0 && (
                  <span className="text-slate-400 text-xs font-medium">
                    Showing all available fits
                  </span>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Sort By:</span>
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-brand-border rounded-lg px-3 py-1.5 text-xs text-brand-dark font-bold cursor-pointer focus:outline-none focus:border-brand-orange"
                >
                  <option value="featured">Recommended (Featured)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                  <option value="newest">Newest Arrivals First</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid or Elegant Fallback */}
            {filteredProducts.length === 0 ? (
              <div className="space-y-8">
                {/* Bewakoof-Style Empty State: Friendly, No Admin Buttons! */}
                <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-brand-border shadow-xs space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-brand-dark">
                    Curating Fresh Drops in {activeCategoryObj ? activeCategoryObj.name : 'this category'}!
                  </h3>
                  <p className="text-xs text-brand-muted max-w-md mx-auto">
                    New collections are currently in stitching and quality-check. Explore our active trending streetwear fits below:
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={resetAllFilters}
                      className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all shadow-brand cursor-pointer"
                    >
                      Show All Available Drops
                    </button>
                  </div>
                </div>

                {/* Show active available store products so screen is never blank */}
                {products.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      Trending Bestsellers You Might Like:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                      {products.slice(0, 4).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FILTER MODAL */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end lg:hidden animate-fade-in">
          <div className="w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-slide-up">
            <div className="p-4 border-b border-brand-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-orange" />
                <h3 className="font-bold text-sm text-brand-dark uppercase tracking-wider">
                  Filters & Categories
                </h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-black rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Category */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Category
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      selectedCategory === 'all'
                        ? 'bg-brand-orange text-white border-brand-orange'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    All Fits ({products.length})
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCategory(c.slug)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                        selectedCategory === c.slug
                          ? 'bg-brand-orange text-white border-brand-orange'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Sizes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSelectSize(sz)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold ${
                        selectedSizes.includes(sz)
                          ? 'bg-brand-orange text-white border-brand-orange'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Price Range
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'under799', label: 'Under ₹799' },
                    { id: '799to1499', label: '₹799 - ₹1,499' },
                    { id: 'above1500', label: '₹1,500 & Above' },
                  ].map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-slate-700">
                      <input
                        type="radio"
                        name="mobile-price"
                        checked={priceRange === p.id}
                        onChange={() => setPriceRange(p.id as any)}
                        className="text-brand-orange"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-brand-border bg-slate-50 flex items-center gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-white bg-brand-orange rounded-xl shadow-brand"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
