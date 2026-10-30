import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, Clock, Globe, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { submitContactMessage } from '../services/cmsService';

export const ContactPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = language === 'bn' ? 'যোগাযোগ করুন — SobTools' : 'Contact Us — SobTools';
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(language === 'bn' ? 'দয়া করে সকল প্রয়োজনীয় ঘর পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(language === 'bn' ? 'সঠিক ইমেইল ঠিকানা দিন।' : 'Please enter a valid email address.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await submitContactMessage(name.trim(), email.trim(), subject.trim(), message.trim());
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || (language === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে।' : 'Failed to send message. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumb items={[{ label: t('contact') }]} />

      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          {language === 'bn' ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch with SobTools'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {language === 'bn'
            ? 'কোনো নতুন টুলের অনুরোধ, পরামর্শ বা অনুসন্ধানের জন্য নির্দ্বিধায় আমাদের মেসেজ পাঠান।'
            : 'Have a feature request, bug report, or tool suggestion? We would love to hear from you.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              {language === 'bn' ? 'ইমেইল সাপোর্ট' : 'Direct Email'}
            </h3>
            <p className="text-xs text-slate-400">
              contact@sobtools.com
            </p>
            <p className="text-[11px] text-slate-500">
              support@sobtools.com
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              {language === 'bn' ? 'উত্তর দেওয়ার সময়' : 'Response Time'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? '২৪ থেকে ৪৮ ঘণ্টার মধ্যে' : 'Within 24 to 48 hours'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">
              {language === 'bn' ? 'অবস্থান' : 'Location'}
            </h3>
            <p className="text-xs text-slate-400">
              Dhaka, Bangladesh & Worldwide
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                {language === 'bn' ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে!' : 'Message Received!'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {language === 'bn'
                  ? 'আপনার পরামর্শ বা প্রশ্নের জন্য ধন্যবাদ। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'
                  : 'Thank you for reaching out. We will review your message and reply as soon as possible.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setName('');
                  setEmail('');
                  setSubject('');
                  setMessage('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {language === 'bn' ? 'আরেকটি বার্তা পাঠান' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Morshed Alam"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইমেইল ঠিকানা *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'বিষয়' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: নতুন টুলের অনুরোধ বা বাগ রিপোর্ট' : 'e.g. New Tool Suggestion / Feedback'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'বার্তা বা বিবরণ *' : 'Message *'}
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Write your message or inquiry here...'}
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{language === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
