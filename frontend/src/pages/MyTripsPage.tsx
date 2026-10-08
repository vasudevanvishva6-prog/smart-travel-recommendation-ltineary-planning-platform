import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Compass,
  MapPin,
  Trash2,
  Eye,
  Wallet,
  Clock,
  Sparkles,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { itineraryApi } from '../services/api';
import { Trip } from '../types';
import { useAuth } from '../context/AuthContext';

export const MyTripsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await itineraryApi.getMyTrips();
      if (res.data.success) {
        setTrips(res.data.trips);
      }
    } catch (err) {
      console.error('Failed to load trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchTrips();
  }, [isAuthenticated]);

  const handleDeleteTrip = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await itineraryApi.deleteTrip(id);
      setTrips(trips.filter((t) => t.id !== id));
      if (selectedTrip?.id === id) setSelectedTrip(null);
    } catch (err) {
      console.error('Failed to delete trip', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-md">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your trips</h2>
        <p className="text-xs text-slate-500">
          Save, view, and customize your personalized travel itineraries across devices.
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Travel Planner Dashboard
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-1">My Saved Trips</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review previous trip plans, day-by-day activities, and budget estimates
          </p>
        </div>

        <Link
          to="/itinerary-planner"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mb-2" />
          <p className="text-slate-500 text-xs">Loading your saved itineraries...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <Compass className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">No Trips Planned Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any destination or let our Smart Recommendation engine plan your first adventure!
            </p>
          </div>
          <Link
            to="/recommendations"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Recommended Trip</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => setSelectedTrip(trip)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Destination Header Image */}
              <div className="relative aspect-16/9 overflow-hidden bg-slate-100">
                <img
                  src={trip.destination?.heroImage || 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80'}
                  alt={trip.destination?.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                    className="p-2 rounded-full bg-black/40 hover:bg-rose-600 text-white backdrop-blur-xs transition"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    {trip.durationDays} Days / {trip.travelType}
                  </span>
                  <h3 className="text-lg font-bold leading-tight">{trip.title}</h3>
                </div>
              </div>

              {/* Trip Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Estimated Cost</span>
                    <span className="font-bold text-slate-800">
                      ₹{trip.estimatedCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Planned Budget</span>
                    <span className="font-bold text-emerald-700">
                      ₹{trip.userBudget.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Day Overview snippets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Day Plan Preview:
                  </span>
                  {trip.days.slice(0, 3).map((d) => (
                    <div
                      key={d.id}
                      className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg"
                    >
                      <span className="font-semibold text-slate-700">Day {d.dayNumber}</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {d.activities[0]?.activityTitle || 'Sightseeing'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-brand-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Itinerary Breakdown</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Trip Details Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Full Day-by-Day Itinerary
                </span>
                <h3 className="text-2xl font-black text-slate-900">{selectedTrip.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTrip.durationDays} Days • Budget: ₹{selectedTrip.userBudget.toLocaleString('en-IN')} • Estimated: ₹{selectedTrip.estimatedCost.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Day by Day Plan list */}
            <div className="space-y-4">
              {selectedTrip.days.map((day) => (
                <div key={day.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                      {day.dayNumber}
                    </span>
                    <span>Day {day.dayNumber}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {day.activities.map((act) => (
                      <div key={act.id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs">
                        <span className="text-[10px] font-bold text-brand-600 uppercase block">
                          {act.timeSlot}
                        </span>
                        <div className="font-semibold text-slate-800 mt-0.5">{act.activityTitle}</div>
                        {act.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {act.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedTrip(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
