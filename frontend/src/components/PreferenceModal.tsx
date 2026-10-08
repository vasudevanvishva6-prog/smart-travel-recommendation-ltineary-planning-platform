import React, { useState } from 'react';
import { X, Sparkles, Compass, Users, Heart, User, Users2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (preferences: {
    budget: number;
    durationDays: number;
    travelType: string;
    interests: string[];
  }) => void;
}

const AVAILABLE_INTERESTS = [
  { id: 'Nature', label: 'Nature & Hills', emoji: '🌲' },
  { id: 'Adventure', label: 'Adventure Sports', emoji: '🧗' },
  { id: 'Beach', label: 'Beach & Coastal', emoji: '🏖️' },
  { id: 'Historical', label: 'Historical & Forts', emoji: '🏰' },
  { id: 'Shopping', label: 'Shopping & Markets', emoji: '🛍️' },
  { id: 'Food', label: 'Food & Culinary', emoji: '🍲' },
  { id: 'Religious', label: 'Religious & Temples', emoji: '🛕' },
];

const TRAVEL_TYPES = [
  { id: 'SOLO', label: 'Solo', icon: <User className="w-4 h-4" /> },
  { id: 'COUPLE', label: 'Couple', icon: <Heart className="w-4 h-4" /> },
  { id: 'FAMILY', label: 'Family', icon: <Users className="w-4 h-4" /> },
  { id: 'FRIENDS', label: 'Friends', icon: <Users2 className="w-4 h-4" /> },
];

export const PreferenceModal: React.FC<PreferenceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user, updatePreferences } = useAuth();

  const [budget, setBudget] = useState<number>(user?.preference?.budget || 20000);
  const [durationDays, setDurationDays] = useState<number>(user?.preference?.durationDays || 4);
  const [travelType, setTravelType] = useState<string>(user?.preference?.travelType || 'FRIENDS');
  const [interests, setInterests] = useState<string[]>(
    user?.preference?.interests || ['Nature', 'Adventure']
  );

  if (!isOpen) return null;

  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== interestId));
      }
    } else {
      setInterests([...interests, interestId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      try {
        await updatePreferences({ budget, durationDays, travelType, interests });
      } catch (_e) {
        // Continue
      }
    }
    onSubmit({ budget, durationDays, travelType, interests });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Customize Travel Preferences</h3>
              <p className="text-xs text-slate-500">Fine-tune your trip requirements for AI recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-5">
          {/* Budget Range */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Estimated Total Budget</label>
              <span className="text-lg font-black text-brand-700 bg-brand-50 px-3 py-1 rounded-xl">
                ₹{budget.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="80000"
              step="1000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
              <span>₹5,000 (Budget)</span>
              <span>₹20,000 (Popular)</span>
              <span>₹50,000+ (Luxury)</span>
            </div>
          </div>

          {/* Number of Days */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Trip Duration</label>
              <span className="text-sm font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">
                {durationDays} Days / {Math.max(1, durationDays - 1)} Nights
              </span>
            </div>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 7, 10].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    durationDays === d
                      ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          {/* Travel Type */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-2">
              Who are you traveling with?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TRAVEL_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setTravelType(type.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl text-xs font-bold border transition ${
                    travelType === type.id
                      ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {type.icon}
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Your Travel Interests</label>
              <span className="text-xs text-slate-400">Select at least 1</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((item) => {
                const selected = interests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
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

          {/* Action button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Apply & Find Recommended Trips
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
