import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth, ADMIN_CREDENTIALS } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in as admin, redirect to /admin
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = loginAdmin(email, password);
    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickFill = () => {
    setEmail(ADMIN_CREDENTIALS.email);
    setPassword(ADMIN_CREDENTIALS.password);
    setErrorMsg('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-brand-surface">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-elevated border border-brand-border p-6 sm:p-8 space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-brand-orangeLight text-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Store Admin Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-brand-dark">
            Admin Management Login
          </h1>
          <p className="text-xs text-brand-muted">
            Access inventory control, add men&apos;s apparel, upload photos, and view customer orders.
          </p>
        </div>

        {/* Credentials Helper Callout */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-brand-dark font-bold">
            <span className="flex items-center gap-1 text-brand-orange">
              <KeyRound className="w-3.5 h-3.5" /> Official Admin Credentials:
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] bg-brand-orange text-white px-2.5 py-0.5 rounded font-semibold hover:bg-brand-orangeHover transition-colors"
            >
              Auto-Fill
            </button>
          </div>
          <div className="font-mono text-slate-700 space-y-0.5 text-[11px]">
            <p><strong>Email:</strong> {ADMIN_CREDENTIALS.email}</p>
            <p><strong>Password:</strong> {ADMIN_CREDENTIALS.password}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Admin Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@likeclothing.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Secret Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-brand transition-all flex items-center justify-center gap-2 group"
          >
            <span>Log In to Store Admin</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};
