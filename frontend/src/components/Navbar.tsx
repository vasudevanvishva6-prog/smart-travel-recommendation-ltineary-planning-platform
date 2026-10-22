import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Heart,
  Calendar,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  MapPin,
  Sparkles,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, wishlistIds } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-cyan-600 bg-clip-text text-transparent">
                WanderSmart
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                AI Planner
              </span>
            </div>
          </Link>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Ooty, Kerala, Goa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200/70 focus:bg-white focus:ring-2 focus:ring-brand-500 rounded-full border-none outline-none transition-all"
              />
            </div>
          </form>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/recommendations"
              className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full border border-brand-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
              Smart Recommendations
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Live Explore
            </Link>
            <Link
              to="/destinations"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              Destinations
            </Link>
            <Link
              to="/my-trips"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              My Trips
            </Link>
            <Link
              to="/wishlist"
              className="relative flex items-center text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5 text-slate-600 hover:text-rose-500 transition-colors" />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
          </div>

          {/* User / Auth Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1.5 rounded-lg hover:bg-amber-200 transition"
              >
                <Shield className="w-3.5 h-3.5 text-amber-700" />
                Admin
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 py-1 px-2.5 rounded-full hover:bg-slate-100 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg shadow-xs shadow-brand-500/20 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              placeholder="Search destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 rounded-lg border-none"
            />
          </form>
          <Link
            to="/recommendations"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-brand-700 font-semibold bg-brand-50 px-3 py-2 rounded-lg"
          >
            <Sparkles className="w-4 h-4" />
            Smart Recommendations
          </Link>
          <Link
            to="/destinations"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 font-medium px-3 py-2 rounded-lg hover:bg-slate-100"
          >
            Destinations
          </Link>
          <Link
            to="/my-trips"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 font-medium px-3 py-2 rounded-lg hover:bg-slate-100"
          >
            <Calendar className="w-4 h-4" />
            My Trips
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-slate-700 font-medium px-3 py-2 rounded-lg hover:bg-slate-100"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            Saved Wishlist ({wishlistIds.length})
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-amber-800 font-semibold bg-amber-50 px-3 py-2 rounded-lg"
            >
              <Shield className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-slate-700 font-medium px-3 py-2 rounded-lg hover:bg-slate-100"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile ({user.fullName})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-rose-600 font-medium px-3 py-2 rounded-lg hover:bg-rose-50 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
