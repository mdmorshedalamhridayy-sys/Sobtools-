import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';

interface AdminRouteProps {
  children?: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-medium">Verifying administrator privileges...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied (403)</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          You do not have administrative authority to view this area. Admin operations are strictly restricted and audited.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};
