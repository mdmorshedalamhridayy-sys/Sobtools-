import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Wrench, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithEmail, signInWithGoogle, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If redirected from protected route
  const from = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const redirectTarget = from ? `${from.pathname}${from.search || ''}` : '/dashboard';

  // If already logged in
  React.useEffect(() => {
    if (user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  const mapAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
      return language === 'bn'
        ? 'ইমেইল বা পাসওয়ার্ড সঠিক নয়। দয়া করে পুনরায় চেষ্টা করুন।'
        : 'Invalid email or password. Please verify and try again.';
    }
    if (msg.includes('too-many-requests')) {
      return language === 'bn'
        ? 'অনেকবার ভুল চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
        : 'Too many unsuccessful attempts. Access temporarily disabled. Please wait or reset password.';
    }
    if (msg.includes('popup-closed-by-user')) {
      return language === 'bn'
        ? 'গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।'
        : 'Google sign-in popup was closed before completion.';
    }
    return language === 'bn'
      ? 'লগইন ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।'
      : 'Authentication failed. Please check your network and credentials.';
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(language === 'bn' ? 'দয়া করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন।' : 'Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(email, password, rememberMe);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Protected Route Notice */}
        {from && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-200">
                {language === 'bn' ? 'টুল ব্যবহারের জন্য সাইন-ইন আবশ্যক' : 'Authentication Required'}
              </p>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                {language === 'bn'
                  ? 'SobTools এর টুলগুলো ব্যবহারের জন্য প্রথমে লগইন করুন। লগইন সফল হলে সরাসরি টুলে নিয়ে যাওয়া হবে।'
                  : 'Please sign in to access your requested tool. You will be redirected immediately.'}
              </p>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Heading */}
          <div className="text-center mb-8 relative">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 mb-3">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wrench className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t('welcomeBack')}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {language === 'bn'
                ? 'আপনার SobTools একাউন্টে লগইন করুন'
                : 'Sign in to access your tools and preferences'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 transition-all hover:shadow-md disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{t('continueWithGoogle')}</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] text-slate-500 uppercase tracking-wider">
              {language === 'bn' ? 'অথবা ইমেইল দিয়ে' : 'Or with email'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-400">{t('rememberMe')}</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{t('login')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to Sign Up */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              {t('dontHaveAccount')}{' '}
              <Link
                to="/signup"
                state={{ from }}
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
              >
                {t('signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
