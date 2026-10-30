import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Globe, Heart, Award, Cpu, Code2, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { fetchCMSPage } from '../services/cmsService';
import { CMSPage } from '../types';

export const AboutPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    document.title = language === 'bn' ? 'আমাদের সম্পর্কে — SobTools' : 'About Us — SobTools';
    fetchCMSPage('about').then((data) => {
      if (data) setCmsPage(data);
    }).catch(() => {});
  }, [language]);

  const displayTitle = cmsPage?.title?.[language] || (language === 'bn' ? 'SobTools-এর গল্প ও লক্ষ্য' : 'The Story & Mission of SobTools');
  const displaySubtitle = cmsPage?.subtitle?.[language] || (language === 'bn'
    ? 'আমাদের লক্ষ্য হলো ইন্টারনেটের প্রতিটি সাধারণ ব্যবহারকারী, শিক্ষার্থী, কনটেন্ট ক্রিয়েটর এবং ফ্রিল্যান্সারদের জন্য প্রয়োজনীয় ডিজিটাল টুলস এক জায়গায় সহজলভ্য ও নিরাপদ করে তোলা।'
    : 'Our mission is to provide creators, students, freelancers, and everyday internet users with privacy-first, lightning-fast digital utility tools under one roof.');
  const displayContent = cmsPage?.content?.[language];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Breadcrumb items={[{ label: t('about') }]} />

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Made for Bangladesh & Global Users</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
          {displayTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {displaySubtitle}
        </p>
      </div>

      {displayContent && (
        <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-sm text-slate-300 leading-relaxed">
          {displayContent}
        </div>
      )}

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            {language === 'bn' ? '১০০% ক্লায়েন্ট-সাইড প্রাইভেসি' : '100% Client-Side Privacy'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'আমরা বিশ্বাস করি আপনার ফাইল কেবল আপনারই। তাই ছবি, পিডিএফ ও টেক্সট সরাসরি আপনার ব্রাউজারের ভেতর প্রসেস হয়। কোনো ফাইল আমাদের সার্ভারে জমা হয় না।'
              : 'Files are processed locally in your browser sandbox using HTML5 Canvas and Web Crypto. We never upload your personal photos or documents.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            {language === 'bn' ? 'কোনো সীমা ও সাবস্ক্রিপশন নেই' : 'Free & Uncapped'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'SobTools ব্যবহারের জন্য কোনো অ্যাকাউন্ট খোলা বা টাকা দেওয়ার প্রয়োজন নেই। প্রতিটি টুল আনলিমিটেড এবং কোনো জলছাপ (Watermark) ছাড়াই ব্যবহারযোগ্য।'
              : 'No signups, paywalls, or credit cards. All utilities are completely free and open for everyone with zero watermarks.'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-200">
            {language === 'bn' ? 'দ্বিভাষিক ইন্টারফেস' : 'Bilingual First'}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'bn'
              ? 'বাংলাদেশের মানুষের কথা মাথায় রেখে সম্পূর্ণ ইন্টারফেস বাংলা এবং ইংরেজিতে সাজানো হয়েছে। সাথে রয়েছে দেশীয় জমি মাপের একক ও বাংলা সোশ্যাল ক্যাপশন।'
              : 'Built specifically with deep localization for Bangladesh (native Bengali, traditional land units like Bigha/Katha, Bengali captions) and worldwide English users.'}
          </p>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          {language === 'bn' ? 'প্রযুক্তি ও স্থাপত্য (Tech Stack)' : 'Technical Architecture & Stack'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {language === 'bn'
            ? 'SobTools তৈরি করা হয়েছে আধুনিক ও দ্রুততম ওয়েব টেকনোলজি দিয়ে: React 19, TypeScript, Vite, Tailwind CSS, pdf-lib, এবং ব্রাউজার নেটিভ Web Crypto API। সাইটের নকশা ইন্টারনেটের ধীর গতির কানেকশনেও দ্রুত লোড হওয়ার মতো করে তৈরি করা হয়েছে।'
            : 'SobTools is built on a high-efficiency stack: React 19, TypeScript, Vite 8, Tailwind CSS, pdf-lib, and browser-native Web Cryptography APIs. Optimized for low-latency Core Web Vitals across mobile networks.'}
        </p>
      </div>
    </div>
  );
};
