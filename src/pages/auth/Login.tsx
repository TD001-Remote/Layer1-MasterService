/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const eErr = validateEmail(authEmail);
    const pErr = validatePassword(authPassword);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setAuthSubmitting(true);

    try {
      await signIn(authEmail, authPassword);
      navigate('/admin/setup');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setAuthError(err.message || 'Failed to complete authentication. Verify credentials.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden bg-gradient-to-br from-brand-50 via-surface-100 to-brand-100">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-300/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(20,184,166,0.12),transparent_60%)]" />
      </div>

      {/* Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo top */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-xl shadow-brand-500/20 ring-1 ring-white/20">
            <Workflow size={32} />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-3xl p-8 shadow-2xl shadow-brand-900/5 ring-1 ring-surface-200/60 space-y-7">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-surface-900 font-display">
              Tamil Nadu & Puducherry UT
            </h1>
            <p className="text-sm text-surface-500 font-semibold">
              L1 Secure Identity & Settlement Database Console
            </p>
          </div>

          {/* Error banner */}
          {authError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start space-x-3 animate-fade-in">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-rose-500" />
              <span className="text-sm font-medium text-rose-800 leading-relaxed">{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-surface-700">
                <Mail size={15} className="text-surface-400" />
                <span>Email Address</span>
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => { setAuthEmail(e.target.value); setEmailError(null); }}
                  placeholder="engineer@mayiladuthurai.gov.in"
                  className={`w-full pl-4 pr-10 py-3 bg-white rounded-xl text-sm text-surface-900 placeholder-surface-400 border outline-none transition-all duration-200 focus:ring-2 ${
                    emailError
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-surface-200 focus:border-brand-500 focus:ring-brand-100 hover:border-surface-300'
                  }`}
                  disabled={authSubmitting}
                  autoFocus
                />
                <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-brand-500 transition-colors" />
              </div>
              {emailError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pl-1">
                  <AlertCircle size={12} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-surface-700">
                <Lock size={15} className="text-surface-400" />
                <span>Password</span>
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => { setAuthPassword(e.target.value); setPasswordError(null); }}
                  placeholder="Enter secure password (min 6 characters)"
                  className={`w-full pl-4 pr-10 py-3 bg-white rounded-xl text-sm text-surface-900 placeholder-surface-400 border outline-none transition-all duration-200 focus:ring-2 ${
                    passwordError
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-surface-200 focus:border-brand-500 focus:ring-brand-100 hover:border-surface-300'
                  }`}
                  disabled={authSubmitting}
                />
                <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 group-focus-within:text-brand-500 transition-colors" />
              </div>
              {passwordError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold pl-1">
                  <AlertCircle size={12} />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              {authSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Console</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="px-3 bg-white text-surface-400 font-bold">Secure Access</span>
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-surface-400 font-semibold">
            <Fingerprint size={13} />
            <span>Firebase Auth · Role-Based Access · Encrypted</span>
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="text-center mt-8 space-y-1">
          <p className="text-xs text-surface-400 font-medium">© 2026 Tamil Nadu & Puducherry Identity Registry</p>
          <p className="text-[11px] text-surface-400 font-mono font-semibold tracking-wide">
            Secure L1 Database Console v3.0
          </p>
        </div>
      </div>
    </div>
  );
}
