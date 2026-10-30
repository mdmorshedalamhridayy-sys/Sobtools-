import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Wrench, Eye, EyeOff, Lock, Mail, User, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const redirectTarget = from ? `${from.pathname}${from.search || ''}` : '/dashboard';

  React.useEffect(() => {
    if (user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  const mapAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('email-already-in-use')) {
      return language === 'bn'
        ? 'এই ইমেইল দিয়ে ইতিমধ্যে একটি একাউন্ট তৈরি করা আছে। অনুগ্রহ করে লগইন করুন।'
        : 'An account with this email address already exists. Please log in instead.';
    }
    if (msg.includes('weak-password')) {
      return language === 'bn'
        ? 'পাসওয়ার্ডটি খুব দুর্বল। কমপক্ষে ৬টি অক্ষর বা সংখ্যার শক্তিশালী পাসওয়ার্ড দিন।'
        : 'Password is too weak. Please choose a password with at least 6 characters.';
    }
    if (msg.includes('invalid-email')) {
      return language === 'bn'
        ? 'সঠিক ইমেইল এড্রেস প্রদান করুন।'
        : 'Please enter a valid email address.';
    }
    return language === 'bn'
      ? 'রেজিস্ট্রেশন সম্পন্ন করা যায়নি। দয়া করে তথ্য যাচাই করে আবার চেষ্টা করুন।'
      : 'Account registration failed. Please verify your details and try again.';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(language === 'bn' ? 'দয়া করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError(language === 'bn' ? 'দয়া করে ইমেইল এড্রেস লিখুন।' : 'Please enter an email address.');
      return;
    }
    if (password.length < 6) {
      setError(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError(language === 'bn' ? 'পাসওয়ার্ড দুটি মিলছে না।' : 'Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError(language === 'bn' ? 'ব্যবহারের শর্তাবলী এবং প্রাইভেসি পলিসি স্বীকার করতে হবে।' : 'You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate(from ? `${from.pathname}${from.search || ''}` : '/dashboard', { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
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
              {t('createAccount')}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {language === 'bn'
                ? 'SobTools এ যোগ দিন এবং সকল ডিজিটাল টুলস ফ্রিতে ব্যবহার করুন'
                : 'Join SobTools for free and unlock all productivity utilities'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
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
              {language === 'bn' ? 'অথবা ইমেইল দিয়ে একাউন্ট করুন' : 'Or register with email'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'পুরো নাম' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

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
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min. 6 characters)'}
              </label>
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

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-[11px] text-slate-400 leading-snug">
                  {language === 'bn' ? (
                    <>
                      আমি SobTools এর{' '}
                      <Link to="/terms" target="_blank" className="text-indigo-400 hover:underline">
                        শর্তাবলী
                      </Link>{' '}
                      এবং{' '}
                      <Link to="/privacy" target="_blank" className="text-indigo-400 hover:underline">
                        প্রাইভেসি পলিসি
                      </Link>{' '}
                      মেনে নিচ্ছি।
                    </>
                  ) : (
                    <>
                      I accept the SobTools{' '}
                      <Link to="/terms" target="_blank" className="text-indigo-400 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" target="_blank" className="text-indigo-400 hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </>
                  )}
                </span>
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
                  <span>{language === 'bn' ? 'একাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{t('signup')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to Login */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              {t('alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                state={{ from }}
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
              >
                {t('login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
