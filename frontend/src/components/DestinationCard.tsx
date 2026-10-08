import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, MapPin, Calendar, Wallet } from 'lucide-react';
import { Destination } from '../types';
import { useAuth } from '../context/AuthContext';

interface DestinationCardProps {
  destination: Destination;
  matchScore?: number;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, matchScore }) => {
  const { toggleWishlist, isWishlisted, isAuthenticated } = useAuth();
  const wishlisted = isWishlisted(destination.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to save destinations to your wishlist.');
      return;
    }
    await toggleWishlist(destination.id);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-xs text-slate-700 hover:text-rose-600 transition shadow-xs z-10"
          title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Match Score Badge (if recommendation) */}
        {matchScore !== undefined && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/95 text-white font-bold text-xs shadow-md backdrop-blur-xs flex items-center gap-1">
            <span>⭐ {matchScore}% Match</span>
          </div>
        )}

        {/* State / Location Tag on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-1 text-xs font-medium drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {destination.state}, {destination.country}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-xs font-semibold">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{destination.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-300">({destination.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Destination Name */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <Link
              to={`/destinations/${destination.id}`}
              className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors"
            >
              {destination.name}
            </Link>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {destination.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs py-2.5 my-2 border-y border-slate-100 text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-400 font-medium">Best Season</span>
                <span className="font-semibold text-slate-700">{destination.bestTimeToVisit}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] text-slate-400 font-medium">Avg Budget</span>
                <span className="font-bold text-emerald-700">
                  ₹{destination.averageBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(destination.categories || []).slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            to={`/destinations/${destination.id}`}
            className="text-center py-2 px-3 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Explore Places
          </Link>
          <Link
            to={`/itinerary-planner?destinationId=${destination.id}`}
            className="text-center py-2 px-3 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition"
          >
            Plan Itinerary
          </Link>
        </div>
      </div>
    </div>
  );
};
