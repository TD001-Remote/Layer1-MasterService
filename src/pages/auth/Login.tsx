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
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validation';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Inline field errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Validate fields before submitting
    const eErr = validateEmail(authEmail);
    const pErr = validatePassword(authPassword);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    setAuthSubmitting(true);
    
    try {
      if (isSignUp) {
        await signUp(authEmail, authPassword);
      } else {
        await signIn(authEmail, authPassword);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setAuthError(
          'Email/Password accounts are not enabled in your Firebase Console yet. Please enable it in Authentication settings.'
        );
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setAuthError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setAuthError(err.message || 'Failed to complete authentication. Verify credentials.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const attemptDemoSignIn = async () => {
    setAuthError(null);
    setAuthSubmitting(true);
    const demoEmail = 'engineer@mayiladuthurai.gov.in';
    const demoPass = 'engineer123';
    
    try {
      await signIn(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setAuthError(
          'Email/Password accounts are not enabled in your Firebase Console yet. Please enable it in Authentication settings.'
        );
      } else if (
        err.code === 'auth/user-not-found' ||
        err.message?.includes('not-found') ||
        err.message?.includes('invalid-credential')
      ) {
        try {
          await signUp(demoEmail, demoPass);
          navigate('/dashboard');
        } catch (signUpErr: any) {
          console.error(signUpErr);
          if (signUpErr.code === 'auth/operation-not-allowed' || signUpErr.message?.includes('operation-not-allowed')) {
            setAuthError(
              'Email/Password accounts are not enabled in your Firebase Console yet. Please enable it in Authentication settings.'
            );
          } else {
            setAuthError('Failed to auto-provision demo account. Please sign up manually.');
          }
        }
      } else {
        console.error(err);
        setAuthError(err.message || 'Credential verification failed.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl space-y-6 relative z-10">
        {/* Logo and title */}
        <div className="space-y-2 text-center">
          <div className="inline-flex p-3 bg-indigo-600 text-white rounded-2xl mb-2 shadow-md">
            <Workflow size={32} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
            Tamil Nadu & Puducherry UT
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            L1 Secure Identity & Settlement Database Console
          </p>
        </div>

        {/* Firebase Auth Configuration Notice */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-[11px] space-y-1.5 leading-relaxed font-sans">
          <span className="font-extrabold text-amber-900 flex items-center gap-1.5 font-display text-xs">
            🔑 Firebase Auth Configuration Alert
          </span>
          <p className="font-semibold text-slate-700">
            Can't see Email/Password sign-up/login option in Firebase? Please activate it:
          </p>
          <ul className="list-disc pl-4 space-y-1 font-mono text-[9px] text-slate-600 font-bold uppercase tracking-wide">
            <li>Go to "Firebase Authentication"</li>
            <li>Select "Sign-in method" tab</li>
            <li>Enable "Email/Password" provider</li>
          </ul>
        </div>

        {/* Error message */}
        {authError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-start space-x-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium">{authError}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <Mail size={14} />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={authEmail}
              onChange={(e) => { setAuthEmail(e.target.value); setEmailError(null); }}
              placeholder="engineer@mayiladuthurai.gov.in"
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                emailError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
              disabled={authSubmitting}
            />
            {emailError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1">
                <AlertCircle size={13} />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-2">
              <Lock size={14} />
              <span>Password</span>
            </label>
            <input
              type="password"
              value={authPassword}
              onChange={(e) => { setAuthPassword(e.target.value); setPasswordError(null); }}
              placeholder="Enter secure password (min 6 characters)"
              className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                passwordError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
              disabled={authSubmitting}
            />
            {passwordError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium mt-1">
                <AlertCircle size={13} />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={authSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md"
          >
            {authSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
              </>
            ) : (
              <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
              disabled={authSubmitting}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        {/* Demo account button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={attemptDemoSignIn}
            disabled={authSubmitting}
            className="w-full py-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
          >
            <UserCheck size={16} />
            <span>Quick Demo Login</span>
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
            Demo: engineer@mayiladuthurai.gov.in / engineer123
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-slate-600 relative z-10">
        <p className="font-medium">© 2026 Tamil Nadu & Puducherry Identity Registry</p>
        <p className="mt-1 font-mono text-slate-500">Secure L1 Database Console v2.0</p>
      </div>
    </div>
  );
}
