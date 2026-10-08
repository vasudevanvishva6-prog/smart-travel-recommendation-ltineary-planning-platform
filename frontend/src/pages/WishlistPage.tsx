import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, Trash2, ArrowRight } from 'lucide-react';
import { wishlistApi } from '../services/api';
import { DestinationCard } from '../components/DestinationCard';
import { useAuth } from '../context/AuthContext';

export const WishlistPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistApi.getWishlist();
      if (res.data.success) {
        setWishlist(res.data.wishlist);
      }
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-md">
        <Heart className="w-10 h-10 text-rose-500 fill-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your wishlist</h2>
        <p className="text-xs text-slate-500">
          Save favorite destinations, hotels, and tourist spots to visit later.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>Saved Favorites</span>
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-1">My Travel Wishlist</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Destinations you love and plan to visit in upcoming trips
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-2" />
          <p className="text-slate-500 text-xs">Loading saved destinations...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click the heart icon on any destination card to save it here for later.
            </p>
          </div>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Destinations</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <DestinationCard key={item.id} destination={item.destination} />
          ))}
        </div>
      )}
    </div>
  );
};
