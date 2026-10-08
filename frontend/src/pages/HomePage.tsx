import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Compass,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Tag,
  Star,
  Users2,
  Calendar,
  Wallet,
} from 'lucide-react';
import { destinationApi } from '../services/api';
import { DestinationCard } from '../components/DestinationCard';
import { PreferenceModal } from '../components/PreferenceModal';
import { Destination } from '../types';

export const HomePage: React.FC = () => {
  const [popular, setPopular] = useState<Destination[]>([]);
  const [trendingPlaces, setTrendingPlaces] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [preferenceModalOpen, setPreferenceModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await destinationApi.getFeatured();
        if (res.data.success) {
          setPopular(res.data.popularDestinations);
          setTrendingPlaces(res.data.trendingPlaces);
          setCategories(res.data.categories);
          setPackages(res.data.packages);
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePreferencesApplied = (pref: any) => {
    navigate(
      `/recommendations?budget=${pref.budget}&duration=${pref.durationDays}&type=${pref.travelType}&interests=${pref.interests.join(',')}`
    );
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Background decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-cyan-200 shadow-md">
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin-slow" />
            <span>AI-Powered Travel Recommendation & Day-by-Day Itinerary Planner</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-md">
            Plan Your Dream Vacation in <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Minutes, Not Hours
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Enter your budget, trip duration, and interests. Our smart recommendation engine curates
            the ideal destination, day-by-day activities, weather alerts, and cost breakdown.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 sm:p-3 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-3 text-slate-800"
            >
              <div className="flex items-center gap-2 flex-1 px-4 w-full">
                <Search className="w-5 h-5 text-brand-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Where do you want to travel? (e.g. Kerala, Goa, Ooty...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm sm:text-base outline-none bg-transparent placeholder-slate-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreferenceModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl sm:rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition"
                >
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Trip Filter
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/30 transition"
                >
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Smart Recommendation Banner */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
            <span>Popular Searches:</span>
            {['Ooty (₹8,000)', 'Kerala Backwaters', 'Goa Beaches', 'Manali Snow Valley', 'Coorg Hills'].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    const place = tag.split(' ')[0];
                    navigate(`/destinations?search=${place}`);
                  }}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Smart Recommendation</h4>
              <p className="text-xs text-slate-500">AI match score by budget & interest</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Day-by-Day Itinerary</h4>
              <p className="text-xs text-slate-500">Morning, Noon & Evening plans</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Budget Breakdown</h4>
              <p className="text-xs text-slate-500">Transport, hotel, food & ticket costs</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Interactive Map Route</h4>
              <p className="text-xs text-slate-500">Attractions, hotels & dining pins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600">
              <TrendingUp className="w-4 h-4" />
              <span>Top Rated Destinations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Popular Travel Hotspots
            </h2>
          </div>
          <Link
            to="/destinations"
            className="flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* Travel Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Browse By Interest
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Choose Your Travel Style
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Whether you seek adrenaline rushes in Manali or tranquil backwaters in Kerala, explore curated trips.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/destinations?category=${encodeURIComponent(cat.name)}`}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 shadow-md hover:shadow-xl transition-all"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-xs text-cyan-300 font-semibold">{cat.count} Places</span>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Special Offers & Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Limited Time Deals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Curated Travel Packages
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 overflow-hidden">
                <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md">
                  {pkg.discount}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md">
                  {pkg.duration}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                    {pkg.tag}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-0.5 leading-snug">
                    {pkg.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pkg.destinations.join(' • ')}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 line-through">
                      ₹{pkg.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <div className="text-base font-black text-emerald-700">
                      ₹{pkg.offerPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const firstDest = pkg.destinations[0];
                      navigate(`/destinations?search=${firstDest}`);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-brand-600 text-white transition"
                  >
                    View Plan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-700 via-indigo-700 to-cyan-600 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wider uppercase">
              Free Smart Planner
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Ready to Explore? Let AI Build Your Custom Itinerary.
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Tell us your budget, group size, and interests. Get day-by-day morning, afternoon, and
              evening schedules with map routes in seconds.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setPreferenceModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-white text-brand-700 hover:bg-slate-100 font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              Set Preferences
            </button>
            <Link
              to="/recommendations"
              className="px-6 py-3.5 rounded-2xl bg-black/30 hover:bg-black/40 border border-white/30 text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Try Recommendations
            </Link>
          </div>
        </div>
      </section>

      {/* Preferences modal */}
      <PreferenceModal
        isOpen={preferenceModalOpen}
        onClose={() => setPreferenceModalOpen(false)}
        onSubmit={handlePreferencesApplied}
      />
    </div>
  );
};
