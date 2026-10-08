import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserPreference } from '../types';
import { authApi, wishlistApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  wishlistIds: string[];
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
  verifyOtp: (email: string, otp: string) => Promise<any>;
  sendOtp: (email: string, purpose?: string) => Promise<any>;
  updatePreferences: (pref: Partial<UserPreference>) => Promise<any>;
  refreshProfile: () => Promise<void>;
  toggleWishlist: (destinationId: string) => Promise<boolean>;
  isWishlisted: (destinationId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('travel_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistApi.getWishlist();
      if (res.data.success) {
        setWishlistIds(res.data.wishlist.map((item: any) => item.destinationId));
      }
    } catch (_e) {
      // Ignore
    }
  };

  const refreshProfile = async () => {
    if (!localStorage.getItem('travel_token')) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authApi.getProfile();
      if (res.data.success) {
        setUser(res.data.user);
        await fetchWishlist();
      }
    } catch (_e) {
      localStorage.removeItem('travel_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      localStorage.setItem('travel_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      await fetchWishlist();
    }
    return res.data;
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    if (res.data.success) {
      localStorage.setItem('travel_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const res = await authApi.verifyOtp(email, otp);
    if (res.data.success && user) {
      setUser({ ...user, isVerified: true });
    }
    return res.data;
  };

  const sendOtp = async (email: string, purpose?: string) => {
    const res = await authApi.sendOtp(email, purpose);
    return res.data;
  };

  const updatePreferences = async (pref: Partial<UserPreference>) => {
    const res = await authApi.updatePreferences(pref);
    if (res.data.success && user) {
      setUser({
        ...user,
        preference: res.data.preference,
      });
    }
    return res.data;
  };

  const toggleWishlist = async (destinationId: string): Promise<boolean> => {
    if (!token) return false;
    try {
      const res = await wishlistApi.toggle(destinationId);
      if (res.data.success) {
        if (res.data.isSaved) {
          setWishlistIds((prev) => [...prev, destinationId]);
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== destinationId));
        }
        return res.data.isSaved;
      }
    } catch (_e) {
      // Ignore
    }
    return false;
  };

  const isWishlisted = (destinationId: string) => {
    return wishlistIds.includes(destinationId);
  };

  const logout = () => {
    localStorage.removeItem('travel_token');
    setToken(null);
    setUser(null);
    setWishlistIds([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        loading,
        wishlistIds,
        login,
        register,
        logout,
        verifyOtp,
        sendOtp,
        updatePreferences,
        refreshProfile,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
