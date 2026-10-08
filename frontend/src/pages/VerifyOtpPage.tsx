import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp, sendOtp, user } = useAuth();

  const [email, setEmail] = useState(searchParams.get('email') || user?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await verifyOtp(email, otp);
      setSuccess('Email successfully verified! Redirecting to your dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError('');
    try {
      await sendOtp(email, 'Email Verification');
      setSuccess('A new 6-digit OTP code has been sent to your email.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl border border-slate-200/90 space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-200">
          <KeyRound className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">Verify Your Email</h2>
          <p className="text-xs text-slate-500 mt-1">
            We sent a 6-digit One-Time Password to <br />
            <strong className="text-slate-800">{email || 'your registered email'}</strong>
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          {!searchParams.get('email') && !user?.email && (
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm outline-none"
            />
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Enter 6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              autoFocus
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[12px] text-2xl font-black py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition"
          >
            {submitting ? 'Verifying...' : 'Verify OTP & Continue'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Didn't receive code?</span>
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
            <span>Resend OTP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
