import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Wrench, Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError(language === 'bn' ? 'দয়া করে আপনার ইমেইল প্রদান করুন।' : 'Please enter your email.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('user-not-found')) {
        setError(
          language === 'bn'
            ? 'এই ইমেইল দিয়ে কোনো একাউন্ট খুঁজে পাওয়া যায়নি।'
            : 'No account registered with this email address.'
        );
      } else {
        setError(
          language === 'bn'
            ? 'পাসওয়ার্ড রিসেট লিংক পাঠাতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
            : 'Failed to send password reset email. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 mb-3">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Wrench className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t('forgotPassword')}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {language === 'bn'
                ? 'আপনার রেজিস্টার্ড ইমেইল লিখুন, আমরা পাসওয়ার্ড রিসেটের লিংক পাঠাবো'
                : 'Enter your registered email and we will send you a reset link'}
            </p>
          </div>

          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-white mb-2">
                {language === 'bn' ? 'রিসেট লিংক পাঠানো হয়েছে!' : 'Password Reset Email Sent!'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {language === 'bn'
                  ? `আমরা ${email} ঠিকানায় পাসওয়ার্ড পরিবর্তনের নির্দেশনাবলী পাঠিয়েছি। আপনার ইনবক্স অথবা স্প্যাম ফোল্ডার পরীক্ষা করুন।`
                  : `We sent password reset instructions to ${email}. Please check your inbox and spam folder.`}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> {t('login')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending Link...'}</span>
                  </>
                ) : (
                  <span>{language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                )}
              </button>

              <div className="pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to Login'}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
