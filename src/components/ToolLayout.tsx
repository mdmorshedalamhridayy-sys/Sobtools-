import React, { useEffect } from 'react';
import { ToolDefinition } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useRecentTools } from '../context/RecentToolsContext';
import { Breadcrumb } from './Breadcrumb';
import { ToolCard } from './ToolCard';
import { AdSlot } from './AdSlot';
import { IconResolver } from './IconResolver';
import { categories, toolsRegistry } from '../config/toolsRegistry';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, HelpCircle, BookOpen, CheckCircle, Sparkles, Star } from 'lucide-react';

interface ToolLayoutProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  howToSteps?: Array<{ step: number; title: { en: string; bn: string }; desc: { en: string; bn: string } }>;
  customFaqs?: Array<{ q: { en: string; bn: string }; a: { en: string; bn: string } }>;
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  tool,
  children,
  howToSteps,
  customFaqs,
}) => {
  const { language, t } = useLanguage();
  const { addRecentTool } = useRecentTools();
  const { favorites, toggleFavorite, recordToolUsage } = useAuth();

  // Track as recent tool locally & in authenticated history
  useEffect(() => {
    addRecentTool(tool.id);
    recordToolUsage(tool.id, tool.name[language] || tool.name.en);
  }, [tool.id, addRecentTool, recordToolUsage, language, tool.name]);

  const isFavorite = favorites.includes(tool.id);

  // Dynamic SEO meta tags and Title
  useEffect(() => {
    const title = `${tool.name[language] || tool.name.en} — SobTools`;
    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', tool.description[language] || tool.description.en);

    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tool.id, tool.name, tool.description, language]);

  const categoryDef = categories.find((c) => c.id === tool.category);
  const relatedTools = toolsRegistry
    .filter((t) => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);

  // Default step-by-step instructions if none provided
  const defaultSteps = [
    {
      step: 1,
      title: {
        en: 'Select or Upload Your Input',
        bn: 'আপনার ফাইল নির্বাচন বা ইনপুট দিন',
      },
      desc: {
        en: 'Upload files directly or enter text into the tool fields above. Processing happens entirely on your machine.',
        bn: 'উপরের টুল বক্সে ফাইল নির্বাচন করুন অথবা টেক্সট পেস্ট করুন। প্রসেসিং সরাসরি আপনার ডিভাইসে হবে।',
      },
    },
    {
      step: 2,
      title: {
        en: 'Adjust Options & Settings',
        bn: 'প্রয়োজনীয় সেটিংস ঠিক করুন',
      },
      desc: {
        en: 'Customize dimensions, quality, format, or options with live previews.',
        bn: 'সাইজ, কোয়ালিটি বা ফরম্যাট অপশন পছন্দমতো পরিবর্তন করে তাৎক্ষণিক প্রিভিউ দেখুন।',
      },
    },
    {
      step: 3,
      title: {
        en: 'Download or Copy Instantly',
        bn: 'তাত্ক্ষণিক ডাউনলোড বা কপি করুন',
      },
      desc: {
        en: 'Click Download to save the genuine processed output file directly to your device.',
        bn: 'ডাউনলোড বাটনে ক্লিক করে সরাসরি প্রস্তুতকৃত ফাইল আপনার কম্পিউটারে বা ফোনে সংরক্ষণ করুন।',
      },
    },
  ];

  const steps = howToSteps || defaultSteps;

  const defaultFaqs = [
    {
      q: {
        en: `Is my file or data stored on SobTools servers?`,
        bn: 'আমার কোনো ফাইল বা তথ্য কি SobTools সার্ভারে জমা থাকে?',
      },
      a: {
        en: 'No. This tool operates entirely inside your web browser (client-side execution). Your files never leave your device, ensuring complete confidentiality and privacy.',
        bn: 'না। এই টুলটি শতভাগ আপনার ব্রাউজারের ভেতর নিরাপদে চলে। কোনো ফাইল বা ব্যক্তিগত ডেটা কখনোই আমাদের সার্ভারে পাঠানো হয় না।',
      },
    },
    {
      q: {
        en: `Is this tool completely free to use?`,
        bn: 'টুলটি কি সম্পূর্ণ ফ্রিতে ব্যবহার করা যাবে?',
      },
      a: {
        en: 'Yes! All tools on SobTools are 100% free with no registration, no file count limits, and no watermark.',
        bn: 'হ্যাঁ! SobTools-এর সকল টুলস শতভাগ ফ্রি। কোনো অ্যাকাউন্ট খোলা বা কোনো ওয়াটারমার্ক দেওয়ার ঝামেলা নেই।',
      },
    },
    {
      q: {
        en: `Does this tool work on mobile devices?`,
        bn: 'মোবাইল ফোনে কি এই টুল ব্যবহার করা যাবে?',
      },
      a: {
        en: 'Yes, SobTools is fully optimized for all mobile phones (Android, iOS) and tablets with touch-friendly controls.',
        bn: 'হ্যাঁ, স্মার্টফোন (অ্যান্ড্রয়েড ও আইফোন) এবং ট্যাবলেট ডিভাইসে টুলটি স্বাচ্ছন্দ্যে ব্যবহার করা যায়।',
      },
    },
  ];

  const faqs = customFaqs || defaultFaqs;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          {
            label: categoryDef ? categoryDef.name[language] : tool.category,
            to: `/category/${tool.category}`,
          },
          { label: tool.name[language] },
        ]}
      />

      {/* Tool Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <IconResolver name={tool.icon} className="w-5 h-5" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('clientSideBadge')}
          </span>
          <span className="capitalize px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
            {categoryDef ? categoryDef.name[language] : tool.category}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {tool.name[language]}
          </h1>
          <button
            type="button"
            onClick={() => toggleFavorite(tool.id, tool.name[language] || tool.name.en)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all self-start sm:self-auto ${
              isFavorite
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>
              {isFavorite
                ? language === 'bn'
                  ? 'প্রিয় তালিকায় সংরক্ষিত'
                  : 'Saved to Favorites'
                : language === 'bn'
                ? 'প্রিয় তালিকায় যোগ করুন'
                : 'Add to Favorites'}
            </span>
          </button>
        </div>
        <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl leading-relaxed">
          {tool.description[language]}
        </p>
      </div>

      {/* Main Tool Interface Container */}
      <main className="mb-12">
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl">
          {children}
        </div>
      </main>

      {/* Responsive Ad Placement (Clearly separated) */}
      <AdSlot format="banner" />

      {/* How to Use Section */}
      <section className="mb-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-5">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-100">
            {t('howToUse')} — {tool.name[language]}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((st) => (
            <div
              key={st.step}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center mb-3">
                  {st.step}
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  {st.title[language]}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {st.desc[language]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy Notice Box */}
      <section className="mb-12 p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-emerald-300">
            {t('privacyNote')}
          </h3>
          <p className="text-xs text-emerald-400/80 mt-1 leading-relaxed">
            {language === 'bn'
              ? 'আপনার কোনো ছবি, পিডিএফ ডকুমেন্ট বা টেক্সট কোনো বাহ্যিক সার্ভারে আপলোড করা হয় না। সমস্ত প্রক্রিয়াকরণ ব্রাউজারের নিরাপদ মেমোরিতে (Sandbox) সম্পন্ন হয়। পৃষ্ঠা বন্ধ বা রিফ্রেশ করলে কোনো ডেটা সংরক্ষিত থাকে না।'
              : 'Zero server uploads. Your confidential files, photos, and documents remain strictly inside your device browser memory. Files are processed via HTML5 Canvas, Web Cryptography, and WebAssembly APIs.'}
          </p>
        </div>
      </section>

      {/* Tool FAQ */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-100">
            {t('toolFaq')}
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left"
            >
              <h4 className="text-sm font-semibold text-slate-200 mb-1">
                {faq.q[language]}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {faq.a[language]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-100">
              {t('relatedTools')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedTools.map((relTool) => (
              <ToolCard key={relTool.id} tool={relTool} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
