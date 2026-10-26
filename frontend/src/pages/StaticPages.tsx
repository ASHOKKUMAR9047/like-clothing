import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CheckCircle2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
    <div className="text-center space-y-3">
      <div className="flex justify-center">
        <BrandLogo size="lg" />
      </div>
      <h1 className="font-display text-3xl sm:text-5xl font-black text-brand-dark uppercase">
        UPDATE YOUR FASHION • 喜欢
      </h1>
      <p className="text-xs sm:text-sm text-brand-muted max-w-xl mx-auto leading-relaxed">
        LIKE CLOTHING is an authentic Indian streetwear and men&apos;s fashion label dedicated to heavyweight fabrics, boxy oversized cuts, and contemporary casuals.
      </p>
    </div>

    <div className="aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-brand-border">
      <img
        src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop"
        alt="LIKE CLOTHING Streetwear Workshop"
        className="w-full h-full object-cover"
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-brand-dark">Heavyweight 240 GSM Fabric</h3>
        <p>
          We reject thin, flimsy fabrics. Our oversized tees, cargo trousers, and hoodies are engineered from 100% pre-shrunk combed cotton that hangs with a structured, confident drop.
        </p>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-brand-dark">Urban & Festive Silhouettes</h3>
        <p>
          From Tokyo-inspired streetwear graphic drops to European linen Cuban collar shirts and festive raw silk kurtas, LIKE CLOTHING updates your wardrobe for every occasion.
        </p>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl font-bold text-brand-dark">Get In Touch With LIKE CLOTHING</h1>
        <p className="text-xs sm:text-sm text-brand-muted">
          Customer support, bulk orders, size inquiries, and store assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-brand-border space-y-4 text-xs">
          <h3 className="font-display text-base font-bold text-brand-dark">Flagship Store & Support</h3>
          <div className="space-y-2 text-slate-600">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
              <span><strong>Store & HQ:</strong> Like Clothing, 7, Bsnl Office, Katchery Rd, opposite side, Madura Coats Colony, Sivagami Puram, Virudhunagar, Tamil Nadu 626001</span>
            </p>
            <p className="flex items-center gap-2 pt-2">
              <Phone className="w-4 h-4 text-brand-orange shrink-0" />
              <span>+91 98401 23456</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-orange shrink-0" />
              <span>Likeclothing7@gmail.com</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border">
          {submitted ? (
            <div className="text-center py-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm text-brand-dark">Message Sent Successfully</p>
              <p className="text-xs text-brand-muted">Our customer service team will reply within 3 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <input type="text" required placeholder="Your Name" className="w-full p-2.5 rounded-lg border border-brand-border" />
              <input type="email" required placeholder="Email Address" className="w-full p-2.5 rounded-lg border border-brand-border" />
              <input type="tel" required placeholder="Mobile Phone (+91)" className="w-full p-2.5 rounded-lg border border-brand-border" />
              <textarea rows={3} required placeholder="Your question or order inquiry..." className="w-full p-2.5 rounded-lg border border-brand-border" />
              <button type="submit" className="w-full py-3 bg-brand-orange text-white font-bold rounded-lg uppercase tracking-wider hover:bg-brand-orangeHover transition-colors">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const PoliciesPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
    <h1 className="font-display text-3xl font-bold text-brand-dark">LIKE CLOTHING Store Policies</h1>

    <div className="space-y-3 bg-white p-6 rounded-2xl border border-brand-border">
      <h3 className="font-bold text-base text-brand-dark flex items-center gap-2">
        <Truck className="w-4 h-4 text-brand-orange" /> Pan-India Express Delivery
      </h3>
      <p>
        Orders are processed and dispatched within 24 hours. Express air logistics via Delhivery and BlueDart delivers to all Indian metros in 2-4 business days. Free shipping on all orders above ₹1,499.
      </p>
    </div>

    <div className="space-y-3 bg-white p-6 rounded-2xl border border-brand-border">
      <h3 className="font-bold text-base text-brand-dark flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-brand-orange" /> 7-Day Doorstep Size Exchange
      </h3>
      <p>
        If the fit isn&apos;t what you expected, request a size exchange within 7 days of delivery through your Account or by WhatsApp/Calling our support number.
      </p>
    </div>

    <div className="space-y-3 bg-white p-6 rounded-2xl border border-brand-border">
      <h3 className="font-bold text-base text-brand-dark flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-brand-orange" /> Razorpay 100% Secure Payments
      </h3>
      <p>
        UPI (Google Pay, PhonePe, Paytm, Cred), RuPay, Visa, Mastercard, and NetBanking are processed securely with 256-bit encryption.
      </p>
    </div>
  </div>
);

export const NotFoundPage: React.FC = () => (
  <div className="max-w-md mx-auto my-20 p-8 text-center space-y-4">
    <p className="font-display text-6xl font-black text-brand-orange">404</p>
    <h2 className="font-display text-2xl font-bold text-brand-dark">Page Not Found</h2>
    <p className="text-xs text-brand-muted">
      The streetwear piece or page you are looking for does not exist.
    </p>
    <Link
      to="/"
      className="inline-block px-6 py-3 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-brand"
    >
      Return to Store
    </Link>
  </div>
);
