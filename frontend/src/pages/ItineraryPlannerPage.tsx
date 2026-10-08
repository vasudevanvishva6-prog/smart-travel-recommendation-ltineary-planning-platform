import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Wallet,
  Clock,
  Printer,
  Share2,
  Bookmark,
  MapPin,
  Utensils,
  Sun,
  CheckCircle2,
  AlertCircle,
  Car,
  Compass,
} from 'lucide-react';
import { itineraryApi, destinationApi } from '../services/api';
import { GeneratedItinerary, Destination } from '../types';
import { BudgetPlannerWidget } from '../components/BudgetPlannerWidget';
import { WeatherWidget } from '../components/WeatherWidget';
import { InteractiveMap } from '../components/InteractiveMap';
import { useAuth } from '../context/AuthContext';

export const ItineraryPlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestId, setSelectedDestId] = useState<string>(
    searchParams.get('destinationId') || ''
  );
  const [durationDays, setDurationDays] = useState<number>(
    Number(searchParams.get('days')) || 4
  );
  const [travelType, setTravelType] = useState<string>(
    searchParams.get('type') || 'FRIENDS'
  );
  const [userBudget, setUserBudget] = useState<number>(
    Number(searchParams.get('budget')) || 20000
  );

  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load all destinations for dropdown selection
  useEffect(() => {
    destinationApi.getAll().then((res) => {
      if (res.data.success && res.data.destinations.length > 0) {
        setDestinations(res.data.destinations);
        if (!selectedDestId) {
          setSelectedDestId(res.data.destinations[0].id);
        }
      }
    });
  }, []);

  // Generate itinerary automatically when inputs are ready
  const generateItinerary = async (destId = selectedDestId) => {
    if (!destId) return;
    setLoading(true);
    setSavedSuccess(false);
    try {
      const res = await itineraryApi.generate({
        destinationId: destId,
        durationDays,
        travelType,
        userBudget,
      });
      if (res.data.success) {
        setItinerary(res.data.itinerary);
      }
    } catch (err) {
      console.error('Failed to generate itinerary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDestId) {
      generateItinerary(selectedDestId);
    }
  }, [selectedDestId, durationDays, travelType, userBudget]);

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to save this trip to your account.');
      navigate('/login');
      return;
    }
    if (!itinerary) return;

    setSavingTrip(true);
    try {
      await itineraryApi.saveTrip({
        destinationId: itinerary.destination.id,
        title: `${itinerary.destination.name} – ${durationDays} Days Trip`,
        durationDays,
        travelType,
        userBudget,
        budget: itinerary.budget,
        days: itinerary.days,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to save trip', err);
      alert('Failed to save trip. Please try again.');
    } finally {
      setSavingTrip(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${itinerary?.destination.name} Travel Itinerary`,
        text: `Check out my ${durationDays}-day travel plan for ${itinerary?.destination.name}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Trip itinerary link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Control Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Automated Day-by-Day Generator
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Trip Itinerary & Budget Planner
            </h1>
          </div>

          {/* Quick Config Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Destination Selector */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Destination
              </label>
              <select
                value={selectedDestId}
                onChange={(e) => setSelectedDestId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Duration
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                {[2, 3, 4, 5, 7].map((d) => (
                  <option key={d} value={d}>
                    {d} Days / {d - 1} Nights
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Type */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Travel Party
              </label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="SOLO">Solo Traveler</option>
                <option value="COUPLE">Couple</option>
                <option value="FAMILY">Family</option>
                <option value="FRIENDS">Friends</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Budget (INR)
              </label>
              <input
                type="number"
                step="1000"
                value={userBudget}
                onChange={(e) => setUserBudget(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-5 mt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Destination: <strong>{itinerary?.destination.name}</strong></span>
            <span>•</span>
            <span>Duration: <strong>{durationDays} Days</strong></span>
            <span>•</span>
            <span>Type: <strong>{travelType}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Trip</span>
            </button>
            <button
              onClick={handleSaveTrip}
              disabled={savingTrip}
              className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs transition flex items-center gap-1.5 ${
                savedSuccess ? 'bg-emerald-600' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved to My Trips!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{savingTrip ? 'Saving...' : 'Save Trip to My Account'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block animate-spin w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full" />
          <h3 className="text-base font-bold text-slate-700">Generating Optimal Day-by-Day Itinerary...</h3>
          <p className="text-xs text-slate-400">Balancing activity pacing, morning viewpoints and dining recommendations.</p>
        </div>
      ) : itinerary ? (
        <div className="space-y-10">
          {/* Budget Widget (Module 6) */}
          <BudgetPlannerWidget budget={itinerary.budget} />

          {/* Day-by-Day Itinerary (Module 5) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Day-by-Day Schedule for {itinerary.destination.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optimized morning, afternoon, and evening timeline with recommended restaurants
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {itinerary.days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden"
                >
                  {/* Day Header Bar */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-brand-500/30 border border-brand-400/40 flex items-center justify-center font-black text-lg text-cyan-300">
                        {day.dayNumber}
                      </div>
                      <div>
                        <h3 className="text-base font-bold">
                          Day {day.dayNumber}: {day.theme}
                        </h3>
                        <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>{day.weatherCondition} • {day.temperature}°C</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-cyan-200 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                      <span>{day.weatherAdvice}</span>
                    </div>
                  </div>

                  {/* Day Slots Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {day.activities.map((act, actIdx) => (
                      <div
                        key={actIdx}
                        className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:bg-slate-50 transition flex flex-col justify-between"
                      >
                        <div>
                          {/* Slot Tag */}
                          <div className="flex items-center justify-between mb-3">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                act.timeSlot === 'MORNING'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : act.timeSlot === 'AFTERNOON'
                                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                              }`}
                            >
                              {act.timeSlot}
                            </span>
                            {act.entryFee !== undefined && act.entryFee > 0 && (
                              <span className="text-[11px] font-bold text-emerald-700">
                                ₹{act.entryFee} Entry
                              </span>
                            )}
                          </div>

                          {/* Image if available */}
                          {act.image && (
                            <img
                              src={act.image}
                              alt={act.title}
                              className="w-full h-32 object-cover rounded-xl mb-3 shadow-xs"
                            />
                          )}

                          <h4 className="font-bold text-slate-900 text-sm mb-1">{act.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {act.description}
                          </p>
                        </div>

                        {/* Meal Recommendation pairing */}
                        {act.mealRecommendation && (
                          <div className="mt-4 pt-3 border-t border-slate-200 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                              <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <div className="truncate">
                                <span className="block text-[10px] text-amber-700 uppercase">
                                  Recommended Dining:
                                </span>
                                <span>{act.mealRecommendation.name} ({act.mealRecommendation.priceRange})</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Route Map (Module 8) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Itinerary Route & Points of Interest</span>
            </h2>
            <InteractiveMap
              center={[itinerary.destination.latitude, itinerary.destination.longitude]}
              zoom={12}
              hotels={itinerary.hotels}
              restaurants={itinerary.restaurants}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
