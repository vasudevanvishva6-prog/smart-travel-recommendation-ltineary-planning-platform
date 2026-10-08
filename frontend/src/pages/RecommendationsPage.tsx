import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Wallet,
  Users2,
  Heart,
  User,
  Users,
  MapPin,
  Star,
  RefreshCw,
} from 'lucide-react';
import { recommendationApi } from '../services/api';
import { RecommendationResult } from '../types';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_INTERESTS = [
  { id: 'Nature', label: 'Nature', emoji: '🌲' },
  { id: 'Adventure', label: 'Adventure', emoji: '🧗' },
  { id: 'Beach', label: 'Beach', emoji: '🏖️' },
  { id: 'Historical', label: 'Historical', emoji: '🏰' },
  { id: 'Shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'Food', label: 'Food', emoji: '🍲' },
  { id: 'Religious', label: 'Religious', emoji: '🛕' },
];

const TRAVEL_TYPES = [
  { id: 'SOLO', label: 'Solo', icon: <User className="w-4 h-4" /> },
  { id: 'COUPLE', label: 'Couple', icon: <Heart className="w-4 h-4" /> },
  { id: 'FAMILY', label: 'Family', icon: <Users className="w-4 h-4" /> },
  { id: 'FRIENDS', label: 'Friends', icon: <Users2 className="w-4 h-4" /> },
];

export const RecommendationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize from searchParams, user preference or default prompt example
  const [budget, setBudget] = useState<number>(
    Number(searchParams.get('budget')) || user?.preference?.budget || 20000
  );
  const [durationDays, setDurationDays] = useState<number>(
    Number(searchParams.get('duration')) || user?.preference?.durationDays || 4
  );
  const [travelType, setTravelType] = useState<string>(
    searchParams.get('type') || user?.preference?.travelType || 'FRIENDS'
  );
  const [interests, setInterests] = useState<string[]>(
    searchParams.get('interests')
      ? (searchParams.get('interests')?.split(',') as string[])
      : user?.preference?.interests || ['Adventure', 'Nature']
  );

  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await recommendationApi.getRecommendations({
        budget,
        durationDays,
        travelType,
        interests,
      });
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      budget: budget.toString(),
      duration: durationDays.toString(),
      type: travelType,
      interests: interests.join(','),
    });
    fetchRecommendations();
  };

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      if (interests.length > 1) {
        setInterests(interests.filter((item) => item !== id));
      }
    } else {
      setInterests([...interests, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Recommendation Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">
            Smart Destination Recommendations
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Our multi-criteria algorithm evaluates your budget, trip duration, travel party, and
            activity preferences to rank the top matching destinations with real-time percentage
            affinity scores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-md sticky top-24 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Trip Preferences</span>
            </h3>
            <button
              onClick={() => {
                setBudget(20000);
                setDurationDays(4);
                setTravelType('FRIENDS');
                setInterests(['Adventure', 'Nature']);
              }}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              Reset Example
            </button>
          </div>

          <form onSubmit={handleApplyFilter} className="space-y-6">
            {/* Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Target Budget
                </label>
                <span className="text-base font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg">
                  ₹{budget.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="60000"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹5,000</span>
                <span>₹20,000</span>
                <span>₹60,000</span>
              </div>
            </div>

            {/* Duration Days */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Duration (Days)
                </label>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {durationDays} Days
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 7].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationDays(d)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition ${
                      durationDays === d
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Type */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Travel Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TRAVEL_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTravelType(t.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      travelType === t.id
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
                Interests & Themes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_INTERESTS.map((item) => {
                  const selected = interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                        selected
                          ? 'bg-brand-50 border-brand-500 text-brand-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Matches...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Update Recommendations</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Results Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recommended Destinations</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sorted by AI match score based on budget, duration, party & interests
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
              {recommendations.length} Matches Found
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-3xl bg-slate-200 animate-pulse" />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No destinations matched perfectly</h3>
              <p className="text-xs text-slate-500 mt-1">Try expanding your budget or selecting more interests.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {recommendations.map((dest, rank) => (
                <div
                  key={dest.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row group"
                >
                  {/* Thumbnail / Image */}
                  <div className="md:w-64 h-52 md:h-auto relative overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={dest.heroImage}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span>#{rank + 1} Rank</span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Bar: Name + Match Score */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-600 transition">
                              {dest.name}
                            </h3>
                            <span className="text-xs font-semibold text-slate-500">
                              ({dest.state})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-500" />
                              {dest.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>Best Time: {dest.bestTimeToVisit}</span>
                          </div>
                        </div>

                        {/* Match Percentage Pill */}
                        <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-sm flex items-center gap-1 shadow-xs">
                          <span>⭐ {dest.matchPercentage}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {dest.description}
                      </p>

                      {/* Match Reasons Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {dest.matchReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-100"
                          >
                            <CheckCircle2 className="w-3 h-3 text-brand-600" />
                            <span>{reason}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action & Cost */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Estimated Cost ({durationDays} Days)
                        </span>
                        <div className="text-base font-black text-slate-900">
                          ₹{dest.estimatedCostForTrip.toLocaleString('en-IN')}
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            (Avg ₹{dest.averageBudget.toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/destinations/${dest.id}`)}
                          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/itinerary-planner?destinationId=${dest.id}&days=${durationDays}&budget=${budget}&type=${travelType}`
                            )
                          }
                          className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition flex items-center gap-1.5"
                        >
                          <span>Generate Itinerary</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
