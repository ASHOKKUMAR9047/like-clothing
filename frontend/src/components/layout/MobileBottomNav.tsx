import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const MobileBottomNav: React.FC = () => {
  const { totalItemsCount, wishlist } = useCart();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/shop', icon: Compass },
    { label: 'Wishlist', path: '/account?tab=wishlist', icon: Heart, badge: wishlist.length },
    { label: 'Bag', path: '/bag', icon: ShoppingBag, badge: totalItemsCount },
    { label: 'Account', path: '/account', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-brand-border pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-1 text-center transition-colors relative ${
                  isActive ? 'text-brand-orange font-bold' : 'text-slate-500 hover:text-brand-dark'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-brand-orange stroke-[2.5]' : 'stroke-[1.75]'}`} />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-brand-orange text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-white shadow-xs">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange absolute bottom-0" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
