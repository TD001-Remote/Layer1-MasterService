import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Workflow, ArrowLeft, ShieldAlert, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isRouteAllowed, getRequiredModule } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="p-6 bg-white/10 text-brand-200 border border-white/20 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10">
          <Loader2 size={44} className="animate-spin" />
        </div>
        <div className="text-center space-y-2 mt-5 relative z-10">
          <h2 className="text-lg font-extrabold font-display tracking-tight text-white">
            Tamil Nadu & Puducherry Registry
          </h2>
          <p className="text-xs text-brand-200 font-semibold">
            L1 Core Database Environment — Initializing Secure Auth Nodes...
          </p>
          <div className="flex items-center justify-center gap-2 pt-3 text-[10px] text-brand-300 font-mono font-bold tracking-widest uppercase">
            <Loader2 size={12} className="animate-spin" />
            <span>Authenticating Session</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isRouteAllowed(pathname)) {
    const requiredModule = getRequiredModule(pathname);
    return (
      <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-surface-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(245,158,11,0.06),transparent_60%)]" />
        <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full border border-surface-200 text-center space-y-5">
          <div className="inline-flex p-4 bg-amber-50 border border-amber-200 rounded-2xl mx-auto">
            <ShieldAlert size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">
            Access Restricted
          </h2>
          <p className="text-sm text-surface-600 font-medium">
            You do not have the required role to access <strong className="text-surface-900 font-extrabold">{pathname.replace('/', '').replace(/-/g, ' ')}</strong>.
          </p>
          <p className="text-xs text-surface-500 font-medium">
            Required permission: <code className="text-xs bg-surface-100 px-2.5 py-1.5 rounded-lg text-surface-800 font-mono font-bold border border-surface-200">{requiredModule || 'admin'}</code>
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-extrabold shadow-lg shadow-brand-500/20 transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
