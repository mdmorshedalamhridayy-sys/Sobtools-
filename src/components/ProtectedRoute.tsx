import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Loader2, AlertTriangle, LogOut } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireVerification = true,
}) => {
  const { user, loading, isSuspended, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">
          {t('verifyingSession') || 'Verifying authentication session...'}
        </p>
      </div>
    );
  }

  // Not logged in -> Redirect to login while saving the requested tool URL
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account suspended by admin
  if (isSuspended) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-2xl bg-red-950/30 border border-red-800/60 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Account Suspended</h2>
        <p className="text-xs text-red-200/80 mb-6">
          Your account has been suspended by an administrator. If you believe this is an error, please reach out via our contact page.
        </p>
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    );
  }

  // All authenticated, non-suspended users have full, immediate access to tools
  return children ? <>{children}</> : null;
};
