import React, { useState, useEffect } from 'react';
import { HelpCircle, Search, ShieldCheck, Zap, Globe, FileCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { fetchCMSPage } from '../services/cmsService';
import { CMSPage } from '../types';

export const FaqPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchQ, setSearchQ] = useState('');
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    document.title = language === 'bn' ? 'সাধারণ জিজ্ঞাসা (FAQ) — SobTools' : 'FAQ — SobTools';
    fetchCMSPage('faq').then((data) => {
      if (data) setCmsPage(data);
    }).catch(() => {});
  }, [language]);

  const allFaqs = [
    {
      category: 'Privacy & Security',
      q: {
        en: 'Are my uploaded files ever stored or viewed by SobTools?',
        bn: 'আমার আপলোড করা কোনো ফাইল কি SobTools সংরক্ষণ বা দেখতে পারে?',
      },
      a: {
        en: 'No, never. SobTools operates completely inside your web browser sandbox. When you compress an image, merge a PDF, or count words, the data is processed in your device memory and never transmitted to our backend.',
        bn: 'না, কখনোই না। SobTools শতভাগ আপনার ডিভাইসের ব্রাউজার মেমোরিতে ফাইল প্রসেস করে। কোনো ফাইল কোনো সার্ভারে আপলোড হয় না।',
      },
    },
    {
      category: 'Cost & Limits',
      q: {
        en: 'Are all tools on SobTools 100% free?',
        bn: 'SobTools-এর সকল টুল কি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়?',
      },
      a: {
        en: 'Yes. All 36 tools are completely free to use with no hidden subscriptions, trial periods, or file count caps.',
        bn: 'হ্যাঁ। আমাদের সকল ৩৬টি টুল সম্পূর্ণ ফ্রি। কোনো ট্রায়াল পিরিয়ড বা ফাইল সংখ্যার বাধ্যবাধকতা নেই।',
      },
    },
    {
      category: 'File Types & Formats',
      q: {
        en: 'What image and PDF formats are supported?',
        bn: 'কোন কোন ইমেজ এবং পিডিএফ ফরম্যাট সমর্থিত?',
      },
      a: {
        en: 'We support standard JPEG, PNG, and WebP images. For PDF tools, all standard non-password-protected PDF documents are supported.',
        bn: 'আমরা জেপিজি (JPG), পিএনজি (PNG) এবং ওয়েবপি (WebP) সমর্থন করি। পাসওয়ার্ড ছাড়া সকল স্ট্যান্ডার্ড পিডিএফ ফাইল সমর্থন করা হয়।',
      },
    },
    {
      category: 'Browser Compatibility',
      q: {
        en: 'Which web browsers work best with SobTools?',
        bn: 'কোন কোন ওয়েব ব্রাউজারে SobTools সবচেয়ে ভালো কাজ করে?',
      },
      a: {
        en: 'SobTools works seamlessly on Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari, and modern mobile browsers on Android and iOS.',
        bn: 'গুগল ক্রোম, মজিলা ফায়ারফক্স, মাইক্রোসফট এজ, অ্যাপল সাফারি এবং স্মার্টফোনের সকল আধুনিক ব্রাউজারে এটি দারুণ কাজ করে।',
      },
    },
    {
      category: 'Monetization & Ads',
      q: {
        en: 'Why do you display advertisements?',
        bn: 'আপনারা কেন বিজ্ঞাপন প্রদর্শন করেন?',
      },
      a: {
        en: 'Advertisements help cover domain, hosting, and ongoing development costs so that we can keep all tools 100% free for everyone. We strictly ensure ads do not interfere with tool operation or buttons.',
        bn: 'সাইটটি সবার জন্য বিনামূল্যে ও দ্রুতগতির রাখতে বিজ্ঞাপনের মাধ্যমে ডোমেইন ও হোস্টিংয়ের ন্যূনতম খরচ মেটানো হয়। আমরা নিশ্চিত করি বিজ্ঞাপন যেন ব্যবহারকারীর কাজে কোনো বিরক্তির কারণ না হয়।',
      },
    },
  ];

  const customFaqs = (cmsPage?.faqs || []).map((cf) => ({
    category: 'Admin / Support',
    q: cf.question,
    a: cf.answer,
  }));

  const combinedFaqs = [...customFaqs, ...allFaqs];

  const filtered = searchQ.trim()
    ? combinedFaqs.filter((f) => {
        const qBn = f.q.bn.toLowerCase();
        const qEn = f.q.en.toLowerCase();
        const aBn = f.a.bn.toLowerCase();
        const aEn = f.a.en.toLowerCase();
        const sq = searchQ.toLowerCase();
        return qBn.includes(sq) || qEn.includes(sq) || aBn.includes(sq) || aEn.includes(sq);
      })
    : combinedFaqs;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumb items={[{ label: t('faq') }]} />

      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          {language === 'bn' ? 'সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {language === 'bn'
            ? 'SobTools-এর টুলস ব্যবহার ও প্রাইভেসি সম্পর্কিত সকল গুরুত্বপূর্ণ প্রশ্নের সহজ সমাধান।'
            : 'Find clear answers regarding privacy, functionality, limits, and browser support.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg mx-auto">
        <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder={language === 'bn' ? 'প্রশ্ন বা বিষয় দিয়ে খুঁজুন...' : 'Search questions...'}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 shadow-md"
        />
      </div>

      {/* FAQ Accordion / Cards */}
      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                {item.category}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 pt-1">
              {item.q[language]}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {item.a[language]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
