import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Wallet,
  Star,
  Compass,
  ArrowRight,
  Heart,
  Hotel as HotelIcon,
  Utensils,
  Sun,
  Clock,
  Sparkles,
  MessageSquare,
  Send,
} from 'lucide-react';
import { destinationApi, reviewApi } from '../services/api';
import { Destination } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import { WeatherWidget } from '../components/WeatherWidget';
import { useAuth } from '../context/AuthContext';

export const DestinationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'places' | 'hotels' | 'restaurants' | 'weather' | 'reviews'>('places');
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { toggleWishlist, isWishlisted, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const fetchDestination = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await destinationApi.getById(id);
      if (res.data.success) {
        setDestination(res.data.destination);
      }
    } catch (err) {
      console.error('Failed to load destination details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to submit a review.');
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingReview(true);
    try {
      await reviewApi.addReview({
        destinationId: destination!.id,
        rating: newRating,
        comment: newComment,
      });
      setNewComment('');
      await fetchDestination();
    } catch (err) {
      console.error('Failed to submit review', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-500 text-sm">Loading destination details...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Destination Not Found</h2>
        <Link to="/destinations" className="text-brand-600 text-sm font-semibold underline mt-2 block">
          Back to all destinations
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(destination.id);

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Header */}
      <section className="relative h-[480px] bg-slate-900 overflow-hidden">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 text-white">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {destination.state}, {destination.country}
              </span>
              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{destination.rating.toFixed(1)}</span>
                <span className="text-slate-300">({destination.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight">{destination.name}</h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed line-clamp-3">
              {destination.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl">
                <Calendar className="w-4 h-4 text-cyan-300" />
                <div>
                  <span className="block text-[10px] text-slate-300">Best Time to Visit</span>
                  <span className="font-bold">{destination.bestTimeToVisit}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl">
                <Wallet className="w-4 h-4 text-emerald-300" />
                <div>
                  <span className="block text-[10px] text-slate-300">Average Budget</span>
                  <span className="font-bold">₹{destination.averageBudget.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl">
                <Sun className="w-4 h-4 text-amber-300" />
                <div>
                  <span className="block text-[10px] text-slate-300">Current Weather</span>
                  <span className="font-bold">{destination.weatherTemp}°C • {destination.weatherCondition}</span>
                </div>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="pt-3 flex items-center gap-3">
              <button
                onClick={() => navigate(`/itinerary-planner?destinationId=${destination.id}`)}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Itinerary Plan</span>
              </button>

              <button
                onClick={() => toggleWishlist(destination.id)}
                className={`p-3 rounded-xl backdrop-blur-md transition border ${
                  wishlisted
                    ? 'bg-rose-500/90 text-white border-rose-400'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs & Content Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'places', label: `Popular Places (${destination.places?.length || 0})`, icon: <Compass className="w-4 h-4" /> },
            { id: 'hotels', label: `Hotels & Stays (${destination.hotels?.length || 0})`, icon: <HotelIcon className="w-4 h-4" /> },
            { id: 'restaurants', label: `Restaurants & Dining (${destination.restaurants?.length || 0})`, icon: <Utensils className="w-4 h-4" /> },
            { id: 'weather', label: 'Weather Forecast', icon: <Sun className="w-4 h-4" /> },
            { id: 'reviews', label: `Reviews (${destination.reviews?.length || 0})`, icon: <MessageSquare className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 font-bold text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Popular Places */}
        {activeTab === 'places' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Must-Visit Tourist Attractions</h3>
                <p className="text-xs text-slate-500">Popular landmarks, entry fees and visiting hours in {destination.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(destination.places || []).map((place) => (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition flex flex-col"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-brand-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {place.category}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      Best: {place.bestTimeOfDay}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 text-base">{place.name}</h4>
                        <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                          ⭐ {place.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {place.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {place.visitDurationHours} hrs duration
                      </span>
                      <span className="font-bold text-emerald-700">
                        {place.entryFee > 0 ? `Entry: ₹${place.entryFee}` : 'Free Entry'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Hotels */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Recommended Hotels & Resorts</h3>
              <p className="text-xs text-slate-500">Handpicked stays for budget, comfort, and luxury in {destination.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(destination.hotels || []).map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                      ⭐ {hotel.rating}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{hotel.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hotel.address}</span>
                      </p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {(hotel.amenities || []).map((am) => (
                          <span
                            key={am}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            ✓ {am}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Price per night</span>
                        <span className="text-lg font-black text-indigo-700">
                          ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={() => alert(`Inquiry initiated for ${hotel.name}! Rooms available.`)}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition"
                      >
                        Book Stay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Restaurants */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Top Cafes & Dining Spots</h3>
              <p className="text-xs text-slate-500">Authentic regional food and popular local dishes in {destination.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(destination.restaurants || []).map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {restaurant.priceRange}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 text-base">{restaurant.name}</h4>
                        <span className="text-xs font-bold text-amber-500">⭐ {restaurant.rating}</span>
                      </div>
                      <p className="text-xs font-semibold text-brand-600 mt-0.5">{restaurant.cuisine}</p>

                      <div className="mt-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                          Popular Dishes:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(restaurant.popularDishes || []).map((dish) => (
                            <span
                              key={dish}
                              className="text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md"
                            >
                              🍲 {dish}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Weather */}
        {activeTab === 'weather' && (
          <div className="space-y-6">
            <WeatherWidget weather={destination.weather} destinationName={destination.name} />
          </div>
        )}

        {/* Tab 5: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 max-w-4xl">
            {/* Submit Review Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
              <h3 className="text-base font-bold text-slate-900 mb-3">Leave a Review & Rating</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-bold text-slate-700 ml-2">{newRating} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Your Travel Experience</label>
                  <textarea
                    rows={3}
                    placeholder="Very beautiful place and good experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Review</span>
                </button>
              </form>
            </div>

            {/* List Reviews */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">
                Visitor Reviews ({destination.reviews?.length || 0})
              </h4>
              {(destination.reviews || []).map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                        alt={rev.user?.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">{rev.user?.fullName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold text-xs">
                      {'⭐'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Map Section */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-600" />
                <span>Interactive Destination Map</span>
              </h3>
              <p className="text-xs text-slate-500">
                Visual exploration of attractions, resorts, and restaurants across {destination.name}
              </p>
            </div>
          </div>

          <InteractiveMap
            center={[destination.latitude, destination.longitude]}
            zoom={12}
            places={destination.places}
            hotels={destination.hotels}
            restaurants={destination.restaurants}
          />
        </section>
      </div>
    </div>
  );
};
