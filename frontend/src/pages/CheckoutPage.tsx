import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Check, ShieldCheck, CreditCard, ArrowLeft, UserCheck, Plus, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/formatters';
import { Address } from '../types';
import { RazorpayModal } from '../components/common/RazorpayModal';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, subtotal, discount, shippingFee, total, clearCart } = useCart();
  const { addresses, addAddress, createOrder } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    return addresses.length > 0 ? addresses[0].id : '';
  });

  const [isAddingNewAddress, setIsAddingNewAddress] = useState<boolean>(() => {
    return addresses.length === 0;
  });

  const [guestDetails, setGuestDetails] = useState(() => {
    if (addresses.length > 0 && addresses[0]) {
      return {
        recipientName: addresses[0].recipientName || '',
        phone: addresses[0].phone || '',
        streetLine1: addresses[0].streetLine1 || '',
        streetLine2: addresses[0].streetLine2 || '',
        city: addresses[0].city || '',
        state: addresses[0].state || 'Tamil Nadu',
        pincode: addresses[0].pincode || '',
      };
    }
    try {
      const draft = localStorage.getItem('like_clothing_checkout_draft');
      if (draft) return JSON.parse(draft);
    } catch {
      // fallback
    }
    return {
      recipientName: '',
      phone: '',
      streetLine1: '',
      streetLine2: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
    };
  });

  // Auto-save draft so user never loses address even without placing order
  useEffect(() => {
    try {
      localStorage.setItem('like_clothing_checkout_draft', JSON.stringify(guestDetails));
    } catch {
      // ignore
    }
  }, [guestDetails]);

  const [addressSavedNotice, setAddressSavedNotice] = useState(false);

  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrderNumber, setPendingOrderNumber] = useState(`LC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [formErrors, setFormErrors] = useState<{
    recipientName?: string;
    phone?: string;
    streetLine1?: string;
    city?: string;
    pincode?: string;
  }>({});

  // Sync if addresses change
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0].id);
      setGuestDetails({
        recipientName: addresses[0].recipientName,
        phone: addresses[0].phone,
        streetLine1: addresses[0].streetLine1,
        streetLine2: addresses[0].streetLine2 || '',
        city: addresses[0].city,
        state: addresses[0].state || 'Tamil Nadu',
        pincode: addresses[0].pincode,
      });
      setIsAddingNewAddress(false);
    } else if (addresses.length === 0) {
      setIsAddingNewAddress(true);
    }
  }, [addresses]);

  if (cart.length === 0) {
    navigate('/bag');
    return null;
  }

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setFormErrors({});
    setGuestDetails({
      recipientName: addr.recipientName,
      phone: addr.phone,
      streetLine1: addr.streetLine1,
      streetLine2: addr.streetLine2 || '',
      city: addr.city,
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode,
    });
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // If using a saved address, no input validation needed
    if (addresses.length > 0 && !isAddingNewAddress) {
      if (!selectedAddressId) {
        alert('Please select a delivery address.');
        return;
      }
      const newOrderNum = `LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setPendingOrderNumber(newOrderNum);
      setIsRazorpayModalOpen(true);
      return;
    }

    // Custom inline validation - replaces browser native "Please fill out this field" tooltip
    const errors: typeof formErrors = {};
    if (!guestDetails.recipientName.trim()) {
      errors.recipientName = 'Please enter your full delivery name';
    }
    if (!guestDetails.phone.trim()) {
      errors.phone = 'Mobile number is required for courier delivery OTP';
    } else if (guestDetails.phone.trim().replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!guestDetails.streetLine1.trim()) {
      errors.streetLine1 = 'Please enter your flat / door number and street address';
    }
    if (!guestDetails.city.trim()) {
      errors.city = 'Please enter your city / town';
    }
    if (!guestDetails.pincode.trim()) {
      errors.pincode = 'Please enter your 6-digit postal pincode';
    } else if (guestDetails.pincode.trim().length < 6) {
      errors.pincode = 'Pincode must be exactly 6 digits';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const newOrderNum = `LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setPendingOrderNumber(newOrderNum);
    setIsRazorpayModalOpen(true);
  };

  const handleSaveAddressExplicitly = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const errors: typeof formErrors = {};
    if (!guestDetails.recipientName.trim()) {
      errors.recipientName = 'Please enter your full delivery name';
    }
    if (!guestDetails.phone.trim()) {
      errors.phone = 'Mobile number is required for courier delivery OTP';
    } else if (guestDetails.phone.trim().replace(/\D/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number';
    }
    if (!guestDetails.streetLine1.trim()) {
      errors.streetLine1 = 'Please enter your flat / door number and street address';
    }
    if (!guestDetails.city.trim()) {
      errors.city = 'Please enter your city / town';
    }
    if (!guestDetails.pincode.trim()) {
      errors.pincode = 'Please enter your 6-digit postal pincode';
    } else if (guestDetails.pincode.trim().length < 6) {
      errors.pincode = 'Pincode must be exactly 6 digits';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    const newAddr = addAddress({
      recipientName: guestDetails.recipientName.trim(),
      phone: guestDetails.phone.trim(),
      addressType: 'Home',
      streetLine1: guestDetails.streetLine1.trim(),
      streetLine2: guestDetails.streetLine2.trim(),
      city: guestDetails.city.trim(),
      state: guestDetails.state.trim() || 'Tamil Nadu',
      pincode: guestDetails.pincode.trim(),
      isDefault: true,
    });

    setSelectedAddressId(newAddr.id);
    setIsAddingNewAddress(false);
    setAddressSavedNotice(true);
    setTimeout(() => setAddressSavedNotice(false), 4000);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    setIsRazorpayModalOpen(false);
    setIsSubmitting(true);

    const shippingAddress: Address = {
      id: selectedAddressId && !isAddingNewAddress ? selectedAddressId : `addr-${Date.now()}`,
      recipientName: guestDetails.recipientName.trim(),
      phone: guestDetails.phone.trim(),
      addressType: 'Home',
      streetLine1: guestDetails.streetLine1.trim(),
      streetLine2: guestDetails.streetLine2.trim(),
      city: guestDetails.city.trim(),
      state: guestDetails.state.trim() || 'Tamil Nadu',
      pincode: guestDetails.pincode.trim(),
      isDefault: true,
    };

    // Save newly entered address to user profile for future checkouts
    if (isAddingNewAddress || addresses.length === 0) {
      addAddress(shippingAddress);
    }

    setTimeout(() => {
      const order = createOrder({
        status: 'Confirmed',
        paymentStatus: 'Paid',
        shippingAddress,
        items: cart.map((item) => ({
          id: `item-${Date.now()}-${Math.random()}`,
          productTitle: item.product.title,
          variantSku: item.variant.sku,
          size: item.variant.size,
          colorName: item.variant.colorName,
          imageUrl: item.product.images[0]?.url || '',
          unitPrice: (item.product.salePrice ?? item.product.basePrice) + item.variant.priceAdjustment,
          quantity: item.quantity,
          lineTotal:
            ((item.product.salePrice ?? item.product.basePrice) + item.variant.priceAdjustment) *
            item.quantity,
        })),
        subtotal,
        discount,
        shippingFee,
        total,
      });

      clearCart();
      setIsSubmitting(false);
      navigate(`/order-confirmed/${order.orderNumber}?payId=${paymentId}`);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-dark">
            Quick Express Checkout
          </h1>
          <p className="text-xs text-brand-muted mt-0.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-orange" />
            <span>Frictionless Checkout • Instant Delivery Setup</span>
          </p>
        </div>
        <Link
          to="/bag"
          className="text-xs text-brand-orange hover:underline flex items-center gap-1 font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Bag
        </Link>
      </div>

      <form onSubmit={handleInitiatePayment} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Address Selection & Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h2 className="font-display text-base font-bold text-brand-dark flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>1. {addresses.length > 0 && !isAddingNewAddress ? 'Select Delivery Address' : 'Add Delivery Address'}</span>
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewAddress(!isAddingNewAddress);
                    setFormErrors({});
                    if (!isAddingNewAddress) {
                      setGuestDetails({
                        recipientName: '',
                        phone: '',
                        streetLine1: '',
                        streetLine2: '',
                        city: '',
                        state: 'Tamil Nadu',
                        pincode: '',
                      });
                    } else if (addresses[0]) {
                      handleSelectSavedAddress(addresses[0]);
                    }
                  }}
                  className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
                >
                  {isAddingNewAddress ? (
                    '← Use Saved Address'
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Address</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Saved Addresses List (if available and not adding new) */}
            {addresses.length > 0 && !isAddingNewAddress ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 font-semibold">Choose your delivery destination:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                          isSelected
                            ? 'border-brand-orange bg-orange-50/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 mb-1.5 inline-block">
                              {addr.addressType || 'Home'}
                            </span>
                            <p className="font-bold text-xs text-brand-dark">{addr.recipientName}</p>
                            <p className="text-xs text-slate-600 mt-1">{addr.streetLine1}</p>
                            {addr.streetLine2 && <p className="text-xs text-slate-600">{addr.streetLine2}</p>}
                            <p className="text-xs text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-xs text-brand-muted mt-1.5">Mobile: {addr.phone}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-brand-orange shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Add New Address Form */
              <div className="space-y-3">
                {addresses.length === 0 && (
                  <div className="p-3 bg-brand-surface rounded-xl border border-brand-border text-xs text-slate-600">
                    Welcome! Please enter your delivery address below. It will be saved securely for fast 1-click checkout next time.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rajinikanth J"
                      value={guestDetails.recipientName}
                      onChange={(e) => {
                        setGuestDetails({ ...guestDetails, recipientName: e.target.value });
                        if (formErrors.recipientName) setFormErrors({ ...formErrors, recipientName: undefined });
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs focus:ring-1 transition-colors ${
                        formErrors.recipientName
                          ? 'border-red-500 bg-red-50/20 focus:ring-red-500'
                          : 'border-brand-border focus:ring-brand-orange'
                      }`}
                    />
                    {formErrors.recipientName && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        ⚠️ {formErrors.recipientName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Mobile Phone Number (For Courier OTP) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9840123456"
                      value={guestDetails.phone}
                      onChange={(e) => {
                        setGuestDetails({ ...guestDetails, phone: e.target.value });
                        if (formErrors.phone) setFormErrors({ ...formErrors, phone: undefined });
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs focus:ring-1 transition-colors ${
                        formErrors.phone
                          ? 'border-red-500 bg-red-50/20 focus:ring-red-500'
                          : 'border-brand-border focus:ring-brand-orange'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        ⚠️ {formErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">
                      Flat / House No. / Building / Street <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Door No. 12, 3rd Cross Street, Anna Nagar"
                      value={guestDetails.streetLine1}
                      onChange={(e) => {
                        setGuestDetails({ ...guestDetails, streetLine1: e.target.value });
                        if (formErrors.streetLine1) setFormErrors({ ...formErrors, streetLine1: undefined });
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs focus:ring-1 transition-colors ${
                        formErrors.streetLine1
                          ? 'border-red-500 bg-red-50/20 focus:ring-red-500'
                          : 'border-brand-border focus:ring-brand-orange'
                      }`}
                    />
                    {formErrors.streetLine1 && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        ⚠️ {formErrors.streetLine1}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={guestDetails.city}
                      onChange={(e) => {
                        setGuestDetails({ ...guestDetails, city: e.target.value });
                        if (formErrors.city) setFormErrors({ ...formErrors, city: undefined });
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs focus:ring-1 transition-colors ${
                        formErrors.city
                          ? 'border-red-500 bg-red-50/20 focus:ring-red-500'
                          : 'border-brand-border focus:ring-brand-orange'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        ⚠️ {formErrors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      6-Digit Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 600001"
                      value={guestDetails.pincode}
                      onChange={(e) => {
                        setGuestDetails({ ...guestDetails, pincode: e.target.value });
                        if (formErrors.pincode) setFormErrors({ ...formErrors, pincode: undefined });
                      }}
                      className={`w-full p-2.5 rounded-lg border text-xs focus:ring-1 transition-colors ${
                        formErrors.pincode
                          ? 'border-red-500 bg-red-50/20 focus:ring-red-500'
                          : 'border-brand-border focus:ring-brand-orange'
                      }`}
                    />
                    {formErrors.pincode && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">
                        ⚠️ {formErrors.pincode}
                      </p>
                    )}
                  </div>

                  {/* Explicit Save Address Button */}
                  <div className="sm:col-span-2 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-brand-border/60">
                    <button
                      type="button"
                      onClick={handleSaveAddressExplicitly}
                      className="px-5 py-2.5 bg-brand-dark hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Save Address For Future Orders</span>
                    </button>
                    <p className="text-[11px] text-slate-500 font-medium">
                      ✓ Stored permanently on device even if you don&apos;t place order now
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Address Confirmation Alert */}
            {addressSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Delivery Address Saved Successfully! Your destination is secured for 1-click checkout.</span>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
            <h2 className="font-display text-base font-bold text-brand-dark flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-orange" /> 2. Payment Gateway
            </h2>

            <div className="p-4 rounded-xl border-2 border-brand-orange bg-orange-50/40 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-brand-dark">
                    Razorpay Online Gateway (Instant UPI & Cards)
                  </span>
                  <span className="text-[10px] bg-brand-orange text-white px-2 py-0.5 rounded font-bold">
                    Official Sandbox Mode
                  </span>
                </div>
                <p className="text-xs text-brand-muted">
                  Supports Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, and NetBanking.
                </p>
              </div>
              <ShieldCheck className="w-6 h-6 text-brand-orange shrink-0" />
            </div>
          </div>
        </div>

        {/* Right: Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-4 sticky top-28">
          <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-xs space-y-4">
            <h3 className="font-display text-base font-bold text-brand-dark border-b border-brand-border pb-3">
              Order Review ({cart.length} items)
            </h3>

            {/* Quick Line items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => {
                const img = item.product.images[0]?.url;
                const price =
                  (item.product.salePrice ?? item.product.basePrice) + item.variant.priceAdjustment;

                return (
                  <div key={item.id} className="flex gap-3 text-xs items-center">
                    {img ? (
                      <img src={img} alt={item.product.title} className="w-12 h-14 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-14 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                        No Img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-dark truncate">{item.product.title}</p>
                      <p className="text-[11px] text-brand-muted">
                        Size: {item.variant.size} • Qty: {item.quantity}
                      </p>
                      <p className="font-semibold text-brand-dark">{formatINR(price * item.quantity)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-brand-border pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Pan-India Express Delivery</span>
                <span>{shippingFee === 0 ? 'FREE' : formatINR(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-brand-dark pt-2 border-t border-brand-border">
                <span>Final Payable</span>
                <span className="text-brand-orange text-base">{formatINR(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-brand-orange hover:bg-brand-orangeHover disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-brand transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing Order...
                </>
              ) : (
                `PAY VIA RAZORPAY (${formatINR(total)})`
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              256-Bit SSL Encrypted Payment Portal • 7-Day Doorstep Exchange Policy
            </p>
          </div>
        </div>
      </form>

      {/* Razorpay Sandbox Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onDismiss={() => setIsRazorpayModalOpen(false)}
        amount={total}
        orderNumber={pendingOrderNumber}
        customerName={guestDetails.recipientName}
        customerPhone={guestDetails.phone}
        onSuccess={(paymentId) => handlePaymentSuccess(paymentId)}
      />
    </div>
  );
};
