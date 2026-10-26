import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-brand-orange shadow-inner">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
          Upgrade your wardrobe with our latest heavyweight oversized tees, casual shirts, and cargo pants.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-xs tracking-widest uppercase rounded-xl shadow-brand transition-all"
        >
          <span>Shop Men&apos;s Drops</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      <div className="border-b border-brand-border pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark">
          Shopping Bag ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Review your selected fits before proceeding to Razorpay express checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const itemPrice =
              (item.product.salePrice ?? item.product.basePrice) + item.variant.priceAdjustment;
            const primaryImage =
              item.product.images.find((img) => img.isPrimary)?.url || item.product.images[0]?.url;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-border shadow-xs flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                {/* Image & Product info */}
                <div className="flex items-center gap-4 flex-1">
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="w-20 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-brand-border"
                  >
                    <img
                      src={primaryImage}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">
                      {item.product.category}
                    </span>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="block font-bold text-sm text-brand-dark hover:text-brand-orange transition-colors line-clamp-1"
                    >
                      {item.product.title}
                    </Link>
                    <div className="text-xs text-brand-muted flex items-center gap-2">
                      <span>Size: <strong>{item.variant.size}</strong></span>
                      <span>•</span>
                      <span>Color: <strong>{item.variant.colorName}</strong></span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">SKU: {item.variant.sku}</div>

                    <div className="sm:hidden font-bold text-brand-orange text-sm pt-1">
                      {formatINR(itemPrice * item.quantity)}
                    </div>
                  </div>
                </div>

                {/* Stepper & Price on Desktop */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/60">
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-brand-border rounded-lg bg-slate-50 p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-slate-200 rounded transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-brand-dark">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= Math.max(item.variant.stockQuantity || 0, 10)}
                      className="w-8 h-8 flex items-center justify-center text-brand-dark hover:bg-slate-200 rounded transition-colors disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Desktop Price */}
                  <div className="hidden sm:block text-right min-w-[100px]">
                    <div className="font-bold text-base text-brand-orange">
                      {formatINR(itemPrice * item.quantity)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[11px] text-brand-muted">
                        {formatINR(itemPrice)} each
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4 sticky top-28">
          {/* Coupon Code Box */}
          <div className="bg-white rounded-2xl p-5 border border-brand-border shadow-xs space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark uppercase tracking-wider">
              <Tag className="w-4 h-4 text-brand-orange" />
              <span>Promo Codes & Offers</span>
            </div>

            {couponCode ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold">{couponCode}</span> applied!
                    <span className="block text-[11px] text-emerald-700">
                      You saved {formatINR(discount)} on this drop!
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-emerald-900 font-bold text-xs hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code: LIKE20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-brand-border focus:ring-1 focus:ring-brand-orange uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold rounded-lg shrink-0 uppercase tracking-wider transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p
                    className={`text-[11px] font-semibold ${
                      couponMessage.isError ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
                <div className="text-[11px] text-brand-muted">
                  💡 Use coupon <strong className="text-brand-orange">LIKE20</strong> for 20% discount on your order!
                </div>
              </form>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-brand-dark border-b border-brand-border pb-3">
              Order Total Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal</span>
                <span className="font-bold text-brand-dark">{formatINR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-brand-muted">
                <span>Pan-India Delivery</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(shippingFee)}</span>
              </div>

              <div className="border-t border-brand-border pt-3 flex justify-between items-baseline text-base font-bold text-brand-dark">
                <span>Final Amount</span>
                <span className="text-xl text-brand-orange font-display">{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-brand transition-all flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-brand-muted pt-2 text-center">
              <ShieldCheck className="w-4 h-4 text-brand-orange" />
              <span>Razorpay 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
