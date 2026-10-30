import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  ArrowRight,
  Layers,
  CheckCircle,
  HelpCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useRecentTools } from '../context/RecentToolsContext';
import { toolsRegistry, categories as defaultCategories } from '../config/toolsRegistry';
import { ToolCard } from '../components/ToolCard';
import { AdSlot } from '../components/AdSlot';
import { IconResolver } from '../components/IconResolver';
import { fetchAllTools, fetchCategories, fetchHomepageConfig } from '../services/cmsService';
import { ToolDefinition, CategoryDefinition, HomepageConfig } from '../types';

export const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const { recentToolIds, clearRecentTools } = useRecentTools();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [allTools, setAllTools] = useState<ToolDefinition[]>(toolsRegistry);
  const [categories, setCategories] = useState<CategoryDefinition[]>(defaultCategories);
  const [homeConfig, setHomeConfig] = useState<HomepageConfig | null>(null);

  useEffect(() => {
    fetchAllTools().then(setAllTools).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
    fetchHomepageConfig().then(setHomeConfig).catch(() => {});
  }, []);

  const activeTools = allTools.filter((tool) => tool.status !== 'disabled');
  const popularTools = activeTools.filter((tool) => tool.popular);
  const recentTools = recentToolIds
    .map((id) => activeTools.find((t) => t.id === id))
    .filter(Boolean) as ToolDefinition[];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tools?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const faqs = [
    {
      q: {
        en: 'Are my uploaded files or text sent to any server?',
        bn: 'আমার কোনো ছবি, ফাইল বা টেক্সট কি কোনো সার্ভারে আপলোড হয়?',
      },
      a: {
        en: 'Absolutely not! SobTools processes your files 100% locally in your web browser using HTML5 Canvas, Web Cryptography, and WebAssembly APIs. Your private documents never touch our servers.',
        bn: 'একদমই না! SobTools আপনার ব্রাউজারের মধ্যেই সমস্ত ফাইল প্রসেস করে। আপনার কোনো ছবি, পিডিএফ বা ব্যক্তিগত তথ্য কখনোই আমাদের সার্ভারে পাঠানো বা সংরক্ষণ করা হয় না।',
      },
    },
    {
      q: {
        en: 'Is SobTools completely free to use?',
        bn: 'SobTools কি সম্পূর্ণ বিনামূল্যে ব্যবহার করা যায়?',
      },
      a: {
        en: 'Yes! SobTools is 100% free. Create a free account with your email or Google to instantly unlock all tools, bookmark your favorites, and keep a personal usage history.',
        bn: 'হ্যাঁ! SobTools সম্পূর্ণ ফ্রিতে ব্যবহার করা যায়। গুগল বা ইমেইল দিয়ে একটি ফ্রি একাউন্ট তৈরি করে টুলস আনলক করুন, প্রিয় টুল বুকমার্ক করুন এবং ব্যবহারের হিস্ট্রি সংরক্ষণ করুন।',
      },
    },
    {
      q: {
        en: 'Can I use SobTools on my mobile phone or tablet?',
        bn: 'মোবাইল ফোন বা ট্যাবলেটে কি SobTools ব্যবহার করা যাবে?',
      },
      a: {
        en: 'Yes, SobTools is responsive and optimized for Android, iOS, tablets, and desktop computers. Everything works smoothly on touchscreens.',
        bn: 'হ্যাঁ, SobTools যেকোনো অ্যান্ড্রয়েড, আইফোন বা ট্যাবলেটে অত্যন্ত দ্রুত গতিতে চলে এবং সম্পূর্ণ রেসপনসিভ।',
      },
    },
    {
      q: {
        en: 'How do you monetize this service without charging users?',
        bn: 'ব্যবহারকারীদের কাছ থেকে টাকা না নিয়ে আপনারা কীভাবে সাইট পরিচালনা করেন?',
      },
      a: {
        en: 'We display non-intrusive, privacy-respecting Google AdSense advertisements in designated spaces that do not interfere with tool operation or buttons.',
        bn: 'আমরা নির্দিষ্ট জায়গায় শালীন ও অ-বিরক্তিকর বিজ্ঞাপন প্রদর্শনের মাধ্যমে সার্ভার ও ডোমেইন খরচ পরিচালনা করি। টুলস ব্যবহারে কোনো বাধা সৃষ্টি হবে না।',
      },
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-12 text-center px-4 max-w-5xl mx-auto">
        {/* Glow Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{activeTools.length} {language === 'bn' ? 'টি প্রিমিয়াম অনলাইন টুলস' : 'Free Online Tools'}</span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-medium">{t('clientSideBadge')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-100 tracking-tight leading-[1.15] mb-6">
          {homeConfig?.heroTitle?.[language] ? (
            <span>{homeConfig.heroTitle[language]}</span>
          ) : language === 'bn' ? (
            <>
              আপনার দৈনন্দিন কাজের সকল <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                ডিজিটাল টুলস
              </span>{' '}
              এক প্ল্যাটফর্মে
            </>
          ) : (
            <>
              All Your Essential <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Digital Utilities
              </span>{' '}
              in One Place
            </>
          )}
        </h1>

        <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
          {homeConfig?.heroSubtitle?.[language] || t('heroSubtitle')}
        </p>

        {/* Hero Instant Search Bar */}
        {(homeConfig?.showSearchBar !== false) && (
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto relative group">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-indigo-400 absolute left-4 pointer-events-none group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/60 focus:border-indigo-500 text-sm text-slate-100 placeholder:text-slate-500 shadow-2xl focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
              >
                {language === 'bn' ? 'খুঁজুন' : 'Search'}
              </button>
            </div>
          </form>
        )}

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">{language === 'bn' ? 'জনপ্রিয়:' : 'Popular:'}</span>
          {['Adobe Stock', 'Dreamstime', 'Image Compressor', 'PDF Merge', 'QR Code', 'Passport Photo', 'Word Counter'].map((name) => (
            <Link
              key={name}
              to={`/tools?q=${encodeURIComponent(name)}`}
              className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[11px]"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      {/* Top Banner Advertisement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot placement="ad-header-top" format="banner" />
      </div>

      {/* Recently Used Tools */}
      {recentTools.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">
                {t('recentlyUsedTitle')}
              </h2>
            </div>
            <button
              type="button"
              onClick={clearRecentTools}
              className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('clearHistory')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentTools.slice(0, 4).map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              {t('popularToolsTitle')}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'bn'
                ? 'নিয়মিত ব্যবহৃত শীর্ষ প্রয়োজনীয় টুলসমূহ'
                : 'Top utilized tools for daily digital tasks'}
            </p>
          </div>
          <Link
            to="/tools"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            <span>{t('allTools')}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {popularTools.slice(0, 6).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Mid-Page Advertisement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSlot placement="ad-home-mid" format="horizontal" />
      </div>

      {/* Browse by Category Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            {t('browseCategoriesTitle')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'bn'
              ? 'আপনার প্রয়োজন অনুযায়ী বিশেষায়িত ক্যাটাগরি বেছে নিন'
              : 'Browse structured collections by domain'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const count = activeTools.filter((t) => t.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/50 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                    <IconResolver name={cat.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-1.5">
                    {cat.name[language]}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {cat.description[language]}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-indigo-400 font-semibold font-mono">
                    {count} {language === 'bn' ? 'টি টুল' : 'tools'}
                  </span>
                  <span className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Why Choose SobTools (Value Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/40 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mb-3">
              {t('whyChooseTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {language === 'bn'
                ? 'আমরা প্রাইভেসি, গতি এবং ব্যবহারকারীর স্বাচ্ছন্দ্যকে সর্বোচ্চ অগ্রাধিকার দিই।'
                : 'Built with privacy-first engineering, uncompromising speed, and bilingual simplicity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1.5">
                {t('feature_privacy_title')}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('feature_privacy_desc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3.5">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1.5">
                {t('feature_speed_title')}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('feature_speed_desc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3.5">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1.5">
                {t('feature_free_title')}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('feature_free_desc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3.5">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1.5">
                {t('feature_bilingual_title')}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('feature_bilingual_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">
            {t('faq')}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'SobTools সম্পর্কিত সাধারণ প্রশ্নের উত্তর'
              : 'Frequently asked questions about SobTools platform and privacy'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-left"
            >
              <h3 className="text-sm font-bold text-slate-200 mb-1.5">
                {faq.q[language]}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {faq.a[language]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Footer Ad */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AdSlot placement="ad-footer" format="horizontal" />
      </div>
    </div>
  );
};
