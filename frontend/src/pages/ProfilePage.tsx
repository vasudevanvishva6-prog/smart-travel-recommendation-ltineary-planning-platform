import React, { useState } from 'react';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  Lock,
  Wallet,
  Calendar,
  Users2,
  CheckCircle2,
  Save,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

const AVAILABLE_INTERESTS = [
  'Nature',
  'Adventure',
  'Beach',
  'Historical',
  'Shopping',
  'Food',
  'Religious',
];

export const ProfilePage: React.FC = () => {
  const { user, updatePreferences, refreshProfile } = useAuth();

  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [changingPass, setChangingPass] = useState(false);

  // Preference fields
  const [budget, setBudget] = useState(user?.preference?.budget || 20000);
  const [durationDays, setDurationDays] = useState(user?.preference?.durationDays || 4);
  const [travelType, setTravelType] = useState(user?.preference?.travelType || 'FRIENDS');
  const [interests, setInterests] = useState<string[]>(
    user?.preference?.interests || ['Nature', 'Adventure']
  );
  const [prefSuccess, setPrefSuccess] = useState('');

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({ fullName });
      await refreshProfile();
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (_err) {
      // Handle error
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setChangingPass(false);
    }
  };

  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences({ budget, durationDays, travelType, interests });
      setPrefSuccess('Travel preferences saved!');
      setTimeout(() => setPrefSuccess(''), 3000);
    } catch (_err) {
      // Handle error
    }
  };

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      if (interests.length > 1) {
        setInterests(interests.filter((i) => i !== item));
      }
    } else {
      setInterests([...interests, item]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
          alt={user.fullName}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-xs"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">{user.fullName}</h1>
            {user.isVerified && (
              <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{user.email} • Role: {user.role}</p>
        </div>
      </div>

      {/* Preferences Section (Module 1) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Default Travel Preferences</h2>
            <p className="text-xs text-slate-500">
              Used to personalize your itinerary recommendations and budget estimations
            </p>
          </div>
          {prefSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {prefSuccess}
            </span>
          )}
        </div>

        <form onSubmit={handleUpdatePreferences} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Budget */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Typical Budget (INR)
              </label>
              <input
                type="number"
                step="1000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Preferred Duration (Days)
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
              >
                {[2, 3, 4, 5, 7, 10].map((d) => (
                  <option key={d} value={d}>
                    {d} Days
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Type */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Travel Type
              </label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
              >
                <option value="SOLO">Solo</option>
                <option value="COUPLE">Couple</option>
                <option value="FAMILY">Family</option>
                <option value="FRIENDS">Friends</option>
              </select>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Your Travel Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((item) => {
                const selected = interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      selected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Travel Preferences</span>
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
          Security & Password
        </h2>

        {passwordMsg.text && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{changingPass ? 'Updating...' : 'Change Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
