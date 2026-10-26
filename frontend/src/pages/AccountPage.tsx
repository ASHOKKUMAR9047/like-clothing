import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, Heart, User, LogOut, ShieldCheck, Truck, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { formatINR, formatDate } from '../utils/formatters';
import { Address } from '../types';

export const AccountPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const navigate = useNavigate();

  const { user, logout, orders, addresses, addAddress, deleteAddress, setDefaultAddress, cancelOrder, isAdmin } = useAuth();
  const { products } = useProducts();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Omit<Address, 'id'>>({
    recipientName: addresses[0]?.recipientName || 'Like Clothing',
    phone: addresses[0]?.phone || '+91 98401 23456',
    addressType: 'Home',
    streetLine1: '',
    streetLine2: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
    isDefault: false,
  });

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.streetLine1 || !newAddr.city || !newAddr.pincode) return;
    addAddress(newAddr);
    setIsAddingAddress(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Account Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-brand-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-brand-orangeLight text-brand-orange flex items-center justify-center font-bold text-base sm:text-xl border-2 border-brand-orange/30 shrink-0">
            {user ? user.fullName.charAt(0) : 'G'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="font-display text-base sm:text-xl font-bold text-brand-dark leading-snug">
                {user ? user.fullName : 'Guest Shopper (LIKE CLOTHING)'}
              </h1>
              {isAdmin && (
                <span className="text-[9px] sm:text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded font-extrabold uppercase shrink-0">
                  Store Admin
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-brand-muted mt-0.5">
              {user ? user.email : 'No password required for shoppers! Direct guest checkout.'}
            </p>
          </div>
        </div>

        {/* Admin Navigation (Only if logged in as Admin) & Logout */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0">
          {isAdmin && (
            <Link
              to="/admin"
              className="text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-brand-dark text-white hover:bg-black transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-orange shrink-0" />
              <span>Go to Admin Portal →</span>
            </Link>
          )}

          {user && (
            <button
              onClick={logout}
              className="text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-brand-border hover:bg-red-50 text-red-600 flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-border gap-2 sm:gap-6 overflow-x-auto text-[11px] sm:text-xs font-bold uppercase tracking-tight sm:tracking-wider no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => handleTabChange('orders')}
          className={`pb-2.5 sm:pb-3 px-2 sm:px-0 flex items-center gap-1 sm:gap-1.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'orders'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('wishlist')}
          className={`pb-2.5 sm:pb-3 px-2 sm:px-0 flex items-center gap-1 sm:gap-1.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'wishlist'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Saved Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('addresses')}
          className={`pb-2.5 sm:pb-3 px-2 sm:px-0 flex items-center gap-1 sm:gap-1.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'addresses'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Delivery Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('profile')}
          className={`pb-2.5 sm:pb-3 px-2 sm:px-0 flex items-center gap-1 sm:gap-1.5 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'profile'
              ? 'border-brand-orange text-brand-orange'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span>Profile Info</span>
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-brand-border space-y-3">
              <p className="font-bold text-base text-brand-dark">No Orders Yet</p>
              <p className="text-xs text-brand-muted">Check out our latest streetwear drops and upgrade your fashion today.</p>
              <Link to="/shop" className="inline-block mt-2 px-6 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                Shop Men&apos;s Drops
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border pb-3 text-xs">
                  <div>
                    <span className="font-bold text-sm text-brand-dark">Order #{ord.orderNumber}</span>
                    <span className="text-brand-muted ml-2">Placed on {formatDate(ord.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                      {ord.status}
                    </span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono font-semibold">
                      {ord.paymentStatus} (Razorpay)
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.productTitle} className="w-12 h-14 rounded object-cover bg-slate-100 border border-brand-border" />
                        )}
                        <div>
                          <p className="font-bold text-brand-dark">{item.productTitle}</p>
                          <p className="text-brand-muted text-[11px]">Size: {item.size} • Color: {item.colorName} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold text-brand-orange">{formatINR(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Tracking & Actions */}
                <div className="pt-3 border-t border-brand-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-brand-muted">
                    <Truck className="w-4 h-4 text-brand-orange" />
                    <span>Courier: <strong>{ord.courierPartner}</strong> ({ord.trackingNumber})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                      <button
                        onClick={() => cancelOrder(ord.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                      >
                        Cancel Order
                      </button>
                    )}
                    <span className="font-bold text-sm text-brand-dark">
                      Total: {formatINR(ord.total)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Saved Wishlist */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 sm:p-10 text-center border border-brand-border space-y-2 sm:space-y-3">
              <p className="font-bold text-sm sm:text-base text-brand-dark">Your Wishlist is Empty</p>
              <p className="text-[11px] sm:text-xs text-brand-muted">Save your favorite oversized tees and shirts here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {wishlistedProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-xl p-3 sm:p-4 border border-brand-border flex gap-3 sm:gap-4 items-center justify-between shadow-xs">
                  <img src={p.images[0]?.url} alt={p.title} className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg object-cover bg-slate-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs sm:text-sm truncate text-brand-dark">{p.title}</p>
                    <p className="text-xs sm:text-sm text-brand-orange font-bold mt-0.5 sm:mt-1">
                      {formatINR(p.salePrice ?? p.basePrice)}
                    </p>
                    <button
                      onClick={() => {
                        addToCart(p, p.variants[0], 1);
                        toggleWishlist(p.id);
                      }}
                      className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-bold text-white bg-brand-orange px-2.5 sm:px-3 py-1 rounded uppercase tracking-wider shadow-xs hover:bg-brand-orangeDark transition-colors"
                    >
                      Move to Bag
                    </button>
                  </div>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="text-slate-400 hover:text-red-600 p-1 shrink-0"
                    title="Remove from wishlist"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-brand-dark">Saved Delivery Addresses</h3>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="text-xs font-bold text-white bg-brand-orange px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            )}
          </div>

          {isAddingAddress && (
            <form onSubmit={handleAddressSubmit} className="bg-white rounded-2xl p-5 border border-brand-border space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newAddr.recipientName}
                  onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                  className="p-2.5 rounded-lg border border-brand-border"
                />
                <input
                  type="text"
                  required
                  placeholder="Phone"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="p-2.5 rounded-lg border border-brand-border"
                />
                <input
                  type="text"
                  required
                  placeholder="Flat / Street Address"
                  value={newAddr.streetLine1}
                  onChange={(e) => setNewAddr({ ...newAddr, streetLine1: e.target.value })}
                  className="sm:col-span-2 p-2.5 rounded-lg border border-brand-border"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="p-2.5 rounded-lg border border-brand-border"
                />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="6-Digit Pincode"
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  className="p-2.5 rounded-lg border border-brand-border"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg">
                  Save Address
                </button>
                <button type="button" onClick={() => setIsAddingAddress(false)} className="px-3 py-2 bg-slate-100 text-xs rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-xl p-5 border border-brand-border space-y-2 relative">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-brand-dark">{addr.recipientName}</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold">{addr.addressType}</span>
                </div>
                <p className="text-xs text-brand-muted">
                  {addr.streetLine1}, {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs font-bold text-brand-dark">📞 {addr.phone}</p>
                <div className="pt-2 flex justify-between items-center text-xs">
                  {addr.isDefault ? (
                    <span className="text-emerald-700 font-bold text-[11px]">✓ Default Address</span>
                  ) : (
                    <button onClick={() => setDefaultAddress(addr.id)} className="text-brand-orange hover:underline text-[11px] font-bold">
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => deleteAddress(addr.id)} className="text-red-500 hover:underline text-[11px]">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Profile Info */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 border border-brand-border max-w-lg space-y-4">
          <h3 className="font-display font-bold text-base text-brand-dark">Customer Profile</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-brand-muted block">Full Name</label>
              <input type="text" readOnly value={user?.fullName || 'Like Clothing Customer'} className="w-full mt-1 p-2.5 rounded-lg border border-brand-border bg-slate-50 font-medium" />
            </div>
            <div>
              <label className="text-brand-muted block">Phone</label>
              <input type="text" readOnly value={user?.phone || '+91 98401 23456'} className="w-full mt-1 p-2.5 rounded-lg border border-brand-border bg-slate-50 font-medium" />
            </div>
            <div>
              <label className="text-brand-muted block">Account Type</label>
              <span className="inline-block mt-1 bg-brand-orangeLight text-brand-orange px-3 py-1 rounded font-bold">
                {isAdmin ? 'Store Administrator' : 'Guest Shopper (No password required)'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
