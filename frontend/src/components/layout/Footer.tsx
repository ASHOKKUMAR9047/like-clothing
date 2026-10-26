import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Award, Check } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-brand-dark text-slate-200 pt-12 pb-24 md:pb-12 border-t border-brand-charcoal">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/10 text-center">
          <div className="flex flex-col items-center">
            <Award className="w-6 h-6 text-brand-orange mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">100% Heavyweight Cotton</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">240 GSM pre-shrunk & durable fabrics</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="w-6 h-6 text-brand-orange mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Express Pan-India Delivery</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Free shipping on orders above ₹1,499</p>
          </div>
          <div className="flex flex-col items-center">
            <RotateCcw className="w-6 h-6 text-brand-orange mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">7-Day Easy Exchange</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Hassle-free size & style swaps</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-brand-orange mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Razorpay Secure Checkout</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Encrypted UPI, Cards & NetBanking</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white p-2 rounded-xl inline-block shadow-md">
              <BrandLogo size="md" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              LIKE CLOTHING (喜欢) — UPDATE YOUR FASHION. Redefining modern Indian men&apos;s fashion with heavyweight oversized tees, breathable Cuban linen shirts, tactical cargo pants, and signature festive ensembles.
            </p>
            <div className="text-xs text-slate-400 space-y-1.5 pt-1">
              <p className="leading-snug">
                📍 <strong>Store & HQ:</strong> Like Clothing, 7, Bsnl Office, Katchery Rd, opposite side, Madura Coats Colony, Sivagami Puram, Virudhunagar, Tamil Nadu 626001
              </p>
              <p>📞 Customer Support: +91 98401 23456</p>
              <p>✉️ Inquiries: Likeclothing7@gmail.com</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Men&apos;s Drops
            </p>
            <ul className="text-xs space-y-2 text-slate-300">
              <li><Link to="/shop?category=oversized-tees" className="hover:text-brand-orange transition-colors">Oversized Tees</Link></li>
              <li><Link to="/shop?category=shirts" className="hover:text-brand-orange transition-colors">Linen & Oxford Shirts</Link></li>
              <li><Link to="/shop?category=cargos-denim" className="hover:text-brand-orange transition-colors">Cargo Pants & Jeans</Link></li>
              <li><Link to="/shop?category=hoodies-jackets" className="hover:text-brand-orange transition-colors">Hoodies & Jackets</Link></li>
              <li><Link to="/shop?category=mens-ethnic" className="hover:text-brand-orange transition-colors">Festive Kurta Sets</Link></li>
            </ul>
          </div>

          {/* Store Support */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Store Support
            </p>
            <ul className="text-xs space-y-2 text-slate-300">
              <li><Link to="/account" className="hover:text-brand-orange transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-brand-orange transition-colors">About LIKE Brand</Link></li>
              <li><Link to="/contact" className="hover:text-brand-orange transition-colors">Contact Store</Link></li>
              <li><Link to="/policies" className="hover:text-brand-orange transition-colors">Shipping & Returns</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-orange">
              Update Your Fashion
            </p>
            <p className="text-xs text-slate-300">
              Get notified of limited streetwear drops, secret flash sales, and new seasonal collections.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs px-3 py-2.5 rounded-l-md w-full focus:outline-none focus:border-brand-orange"
                />
                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-orangeHover text-white px-4 py-2.5 text-xs font-bold rounded-r-md tracking-wider uppercase transition-colors shrink-0"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Welcome to LIKE CLOTHING updates!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Credits & Payment Logos */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} LIKE CLOTHING (喜欢). All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-brand-orange font-semibold">Razorpay Verified:</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold">UPI</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold">Google Pay</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold">PhonePe</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold">RuPay</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-semibold">Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
