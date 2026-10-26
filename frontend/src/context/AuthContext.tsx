import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address, Order, OrderStatus } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAdmin: (email: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  guestUser: { fullName: string; phone: string; email: string };
  setGuestInfo: (info: { fullName: string; phone: string; email: string }) => void;
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => Address;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>) => Order;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin Credentials
export const ADMIN_CREDENTIALS = {
  email: 'admin@likeclothing.com',
  password: 'Admin@123',
  name: 'Store Manager (LIKE CLOTHING)',
};

const INITIAL_ADDRESSES: Address[] = [];

const INITIAL_ORDERS: Order[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('like_clothing_user');
      return saved ? JSON.parse(saved) : null; // Default is guest shopper (no login required!)
    } catch {
      return null;
    }
  });

  const [guestUser, setGuestUser] = useState<{ fullName: string; phone: string; email: string }>(() => {
    try {
      const saved = localStorage.getItem('like_clothing_guest');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName && parsed.fullName !== 'Like Clothing Customer') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return { fullName: '', phone: '', email: '' };
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    try {
      const saved = localStorage.getItem('like_clothing_addresses');
      if (saved) {
        const parsed: Address[] = JSON.parse(saved);
        const userAddresses = parsed.filter(
          (a) => a.recipientName !== 'Karthik Raja' && a.recipientName !== 'Like Clothing'
        );
        return userAddresses;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('like_clothing_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        // Filter out legacy sample orders
        const realOrders = parsed.filter((o) => !o.id.startsWith('ord-m'));
        return realOrders;
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('like_clothing_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('like_clothing_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('like_clothing_guest', JSON.stringify(guestUser));
  }, [guestUser]);

  useEffect(() => {
    localStorage.setItem('like_clothing_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('like_clothing_orders', JSON.stringify(orders));
  }, [orders]);

  // Admin Login with credentials check
  const loginAdmin = (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && pass === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: 'usr-admin-master',
        fullName: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        phone: '+91 98765 43210',
        role: 'Admin',
      };
      setUser(adminUser);
      return { success: true, message: 'Welcome to LIKE CLOTHING Admin Console!' };
    }
    return {
      success: false,
      message: `Invalid admin credentials. Use ${ADMIN_CREDENTIALS.email} / ${ADMIN_CREDENTIALS.password}`,
    };
  };

  const logout = () => {
    setUser(null);
  };

  const setGuestInfo = (info: { fullName: string; phone: string; email: string }) => {
    setGuestUser(info);
  };

  const addAddress = (data: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...data,
      id: `addr-${Date.now()}`,
      isDefault: data.isDefault || addresses.length === 0,
    };
    setAddresses((prev) => {
      if (newAddress.isDefault) {
        return [...prev.map((a) => ({ ...a, isDefault: false })), newAddress];
      }
      return [...prev, newAddress];
    });
    return newAddress;
  };

  const updateAddress = (id: string, updatedFields: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === id) {
          return { ...addr, ...updatedFields };
        }
        if (updatedFields.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      })
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'date'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `LC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      courierPartner: 'Delhivery Express Surface Air',
      trackingNumber: `DL-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'Cancelled' as const } : ord))
    );
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        loginAdmin,
        logout,
        guestUser,
        setGuestInfo,
        addresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        orders,
        createOrder,
        cancelOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
