/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Workflow } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center font-sans space-y-4 select-none animate-fade-in">
        <div className="p-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl animate-pulse">
          <Workflow size={40} className="animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-bold font-display tracking-tight text-white mb-0.5">
            Tamil Nadu & Puducherry Registry
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            L1 Core Database Environment for Tamil Speaking Regions
          </p>
          <div className="flex items-center justify-center gap-1.5 pt-4 text-[10px] text-slate-500 font-mono text-center">
            <Loader2 size={12} className="animate-spin text-slate-500" />
            <span>INITIALIZING SECURE FIRESTORE AUTH NODES</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
