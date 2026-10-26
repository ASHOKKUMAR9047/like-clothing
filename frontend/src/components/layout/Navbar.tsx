import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X, Flame, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { MEN_CATEGORIES } from '../../data/mockData';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const { totalItemsCount, wishlist } = useCart();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-brand-border transition-all">
      {/* Top Streetwear Announcement Bar */}
      <div className="bg-brand-dark text-white py-1.5 px-3 text-xs tracking-wider font-semibold uppercase text-center flex items-center justify-center gap-2 overflow-hidden shadow-xs">
        <Flame className="w-3.5 h-3.5 text-brand-orange animate-pulse shrink-0" />
        <span className="truncate">
          UPDATE YOUR FASHION • Free Express Shipping on orders above ₹1,499 • Use code <strong className="text-brand-orange underline">LIKE20</strong> for 20% off
        </span>
        <Flame className="w-3.5 h-3.5 text-brand-orange animate-pulse shrink-0 hidden sm:inline" />
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          {/* Mobile Menu & Search Button */}
          <div className="flex items-center md:hidden z-10">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 -ml-1 text-brand-dark hover:text-brand-orange transition-colors outline-none focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 text-brand-dark hover:text-brand-orange transition-colors outline-none focus:outline-none"
              aria-label="Open search drawer"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Brand Mark (Official LIKE CLOTHING Logo) - Perfectly centered on Mobile, left-aligned on Desktop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:static md:inset-auto md:pointer-events-auto md:justify-start shrink-0 md:mr-6 lg:mr-8 xl:mr-10">
            <div className="pointer-events-auto">
              <BrandLogo size="md" />
            </div>
          </div>

          {/* Desktop Left Links for Men (Clean, Single Line, No Wrapping) */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5 text-xs font-bold uppercase tracking-wider text-brand-dark shrink-0">
            <Link
              to="/shop"
              className={`py-1 whitespace-nowrap shrink-0 outline-none focus:outline-none transition-colors ${
                location.pathname === '/shop' && !location.search.includes('category=')
                  ? 'text-brand-orange border-b-2 border-brand-orange'
                  : 'hover:text-brand-orange'
              }`}
            >
              All Men&apos;s Wear
            </Link>
            <Link
              to="/shop?category=oversized-tees"
              className={`py-1 whitespace-nowrap shrink-0 outline-none focus:outline-none transition-colors ${
                location.search.includes('category=oversized-tees')
                  ? 'text-brand-orange border-b-2 border-brand-orange'
                  : 'hover:text-brand-orange'
              }`}
            >
              Oversized Tees
            </Link>
            <Link
              to="/shop?category=shirts"
              className={`py-1 whitespace-nowrap shrink-0 outline-none focus:outline-none transition-colors ${
                location.search.includes('category=shirts')
                  ? 'text-brand-orange border-b-2 border-brand-orange'
                  : 'hover:text-brand-orange'
              }`}
            >
              Shirts
            </Link>
            <Link
              to="/shop?category=cargos-denim"
              className={`py-1 whitespace-nowrap shrink-0 outline-none focus:outline-none transition-colors ${
                location.search.includes('category=cargos-denim')
                  ? 'text-brand-orange border-b-2 border-brand-orange'
                  : 'hover:text-brand-orange'
              }`}
            >
              Cargos
            </Link>
            <Link
              to="/shop?category=sneakers-shoes"
              className={`py-1 whitespace-nowrap shrink-0 outline-none focus:outline-none transition-colors flex items-center gap-1 ${
                location.search.includes('category=sneakers-shoes')
                  ? 'text-brand-orange border-b-2 border-brand-orange'
                  : 'hover:text-brand-orange'
              }`}
            >
              <span>Sneakers</span>
              <span className="text-[9px] px-1 py-0.2 bg-brand-orange text-white rounded font-black tracking-normal">
                HOT
              </span>
            </Link>
            <Link
              to="/shop?category=hoodies-jackets"
              className={`py-1 whitespace-nowrap shrink-0 outline-none focus:outline-none transition-colors ${
                location.search.includes('category=hoodies-jackets')
                  ? 'text-brand-orange border-b-2 border-brand-orange'
                  : 'hover:text-brand-orange'
              }`}
            >
              Hoodies
            </Link>
            <Link
              to="/shop?category=coords-sets"
              className={`py-1 whitespace-nowrap shrink-0 outline-none focus:outline-none transition-colors ${
                location.search.includes('category=coords-sets')
                  ? 'text-brand-orange border-b-2 border-brand-orange'
                  : 'hover:text-brand-orange'
              }`}
            >
              Co-ords
            </Link>
          </nav>

          {/* Right Action Icons (Proper Spacing & Alignment) */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0 z-10">
            {/* Desktop Search Trigger */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search tees, shirts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-32 lg:w-40 xl:w-52 pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-100 border border-brand-border outline-none focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                />
                <Search className="w-3.5 h-3.5 text-brand-muted absolute left-2.5 top-2 pointer-events-none" />
              </form>
            </div>

            {/* Wishlist Link */}
            <Link
              to="/account?tab=wishlist"
              className="p-1.5 sm:p-2 text-brand-dark hover:text-brand-orange relative transition-colors outline-none focus:outline-none"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag */}
            <Link
              to="/bag"
              className="p-1.5 sm:p-2 text-brand-dark hover:text-brand-orange relative transition-colors outline-none focus:outline-none"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-orange text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Customer Account & Orders */}
            <Link
              to="/account"
              className="p-1.5 sm:p-2 text-brand-dark hover:text-brand-orange relative transition-colors outline-none focus:outline-none"
              title="My Account & Orders"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Admin Console Direct Link (Only visible to authenticated store admin) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-dark hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-xs transition-all border border-brand-orange/40 whitespace-nowrap shrink-0 outline-none focus:outline-none"
                title="Admin Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-orange" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar Dropdown */}
        {isSearchOpen && (
          <div className="py-2.5 px-1 border-t border-brand-border md:hidden animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search oversized tees, shirts, cargos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-12 py-2 text-sm rounded-lg bg-slate-100 border border-brand-border focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
              <Search className="w-4 h-4 text-brand-muted absolute left-3 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-white px-4 pt-3 pb-6 space-y-4 animate-slide-up shadow-xl">
          <div className="space-y-1">
            <p className="text-[11px] font-bold tracking-widest text-brand-orange uppercase mb-2">
              Men&apos;s Categories
            </p>
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-brand-dark border-b border-slate-100"
            >
              All Men&apos;s Clothing
            </Link>
            {MEN_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm text-slate-700 hover:text-brand-orange"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-brand-border space-y-2 text-sm">
            <Link
              to="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs text-slate-700 hover:text-brand-orange font-semibold py-1.5"
            >
              <User className="w-4 h-4 text-brand-orange" />
              <span>My Account & Orders</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs text-white font-bold bg-brand-dark hover:bg-black px-4 py-2.5 rounded-lg shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-brand-orange" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
