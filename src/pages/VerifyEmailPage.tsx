import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MailCheck, RefreshCw, Send, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const { user, resendVerificationEmail, reloadUser, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string; search?: string } })?.from;
  const redirectTarget = from ? `${from.pathname}${from.search || ''}` : '/dashboard';

  // If user is already verified or signs out, redirect
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (user.emailVerified) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Mask email for display: e.g. m***y@gmail.com
  const maskEmail = (emailStr?: string | null) => {
    if (!emailStr) return '';
    const parts = emailStr.split('@');
    if (parts.length !== 2) return emailStr;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name[0]}${'*'.repeat(Math.min(name.length - 2, 5))}${name[name.length - 1]}@${domain}`;
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setMessage(null);
    setResending(true);
    try {
      await resendVerificationEmail();
      setCooldown(60);
      setMessage(
        language === 'bn'
          ? 'ভেরিফিকেশন ইমেইল পুনরায় পাঠানো হয়েছে। ইনবক্স ও স্প্যাম চেক করুন।'
          : 'Verification email resent successfully! Please check your inbox and spam folder.'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('too-many-requests')) {
        setError(
          language === 'bn'
            ? 'অনেকবার অনুরোধ করা হয়েছে। কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।'
            : 'Too many requests. Please wait a few moments before trying again.'
        );
      } else {
        setError(
          language === 'bn'
            ? 'ইমেইল পাঠানো যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
            : 'Failed to resend verification email. Please try again.'
        );
      }
    } finally {
      setResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setError(null);
    setMessage(null);
    setChecking(true);
    try {
      const updatedUser = await reloadUser();
      if (updatedUser?.emailVerified) {
        navigate(redirectTarget, { replace: true });
      } else {
        setMessage(
          language === 'bn'
            ? 'এখনো ইমেইল ভেরিফাই হয়নি। লিংকে ক্লিক করে আবার চেক করুন।'
            : 'Email is not verified yet. Please click the link in your email and try again.'
        );
      }
    } catch {
      setError(
        language === 'bn'
          ? 'স্ট্যাটাস যাচাই করতে সমস্যা হয়েছে।'
          : 'Error checking verification status.'
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/10">
            <MailCheck className="w-8 h-8" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            {language === 'bn' ? 'ইমেইল ভেরিফিকেশন প্রয়োজন' : 'Verify Your Email Address'}
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            {language === 'bn'
              ? 'নিরাপত্তা নিশ্চিত করতে এবং SobTools এর টুলগুলো ব্যবহার করতে আপনার ইমেইল যাচাই করা আবশ্যক।'
              : 'To secure your account and access SobTools utilities, please verify your email address.'}
          </p>

          <div className="inline-block px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 mb-6">
            {maskEmail(user?.email)}
          </div>

          {message && (
            <div className="mb-6 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Refresh Verification Status */}
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>
                {checking
                  ? language === 'bn'
                    ? 'যাচাই করা হচ্ছে...'
                    : 'Checking...'
                  : language === 'bn'
                  ? 'আমি ইমেইল ভেরিফাই করেছি (চেক করুন)'
                  : "I've Verified My Email"}
              </span>
            </button>

            {/* Resend Verification Email */}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {resending
                  ? language === 'bn'
                    ? 'পাঠানো হচ্ছে...'
                    : 'Sending...'
                  : cooldown > 0
                  ? language === 'bn'
                    ? `${cooldown} সেকেন্ড পর পুনরায় পাঠান`
                    : `Resend in ${cooldown}s`
                  : language === 'bn'
                  ? 'পুনরায় ভেরিফিকেশন ইমেইল পাঠান'
                  : 'Resend Verification Email'}
              </span>
            </button>
          </div>

          {/* Sign Out Option */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center">
            <button
              type="button"
              onClick={() => logout()}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'অন্য একাউন্টে সাইন-ইন করুন' : 'Sign in to a different account'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
