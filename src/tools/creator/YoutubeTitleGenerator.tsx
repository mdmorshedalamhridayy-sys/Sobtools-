import React, { useState } from 'react';
import { Copy, Check, Flame, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

const titleTemplates = [
  // English Formulas
  { category: 'How-To & Guides', template: 'How to {TOPIC} in 2026 (Step-by-Step for Beginners)' },
  { category: 'How-To & Guides', template: 'I Tried {TOPIC} for 30 Days and This Happened...' },
  { category: 'Listicle & Secrets', template: '7 Secrets About {TOPIC} Nobody Tells You' },
  { category: 'Listicle & Secrets', template: 'Top 5 Mistakes People Make with {TOPIC} (And How to Fix Them)' },
  { category: 'Curiosity & Shock', template: 'Stop Doing {TOPIC} Like This! (Do THIS Instead)' },
  { category: 'Curiosity & Shock', template: 'The Truth About {TOPIC} in 2026' },
  // Bengali Formulas
  { category: 'বাংলা টিউটোরিয়াল', template: '{TOPIC} শেখার সহজ উপায় | সম্পূর্ণ গাইড ২০২৬' },
  { category: 'বাংলা টিউটোরিয়াল', template: 'মোবাইল দিয়ে {TOPIC} করার সঠিক নিয়ম (A to Z Tutorial)' },
  { category: 'ফ্রিল্যান্সিং ও ইনকাম', template: '{TOPIC} করে ঘরে বসে মাসে ৫০ হাজার টাকা আয় করার গোপন ট্রিকস!' },
  { category: 'ভুল ও সমাধান', template: '{TOPIC} করার সময় এই ভুলগুলো কখনো করবেন না!' },
  { category: 'রিভিউ ও অভিজ্ঞতা', template: '{TOPIC} নিয়ে আমার সৎ মতামত ও অভিজ্ঞতা' },
];

export const YoutubeTitleGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [topic, setTopic] = useState<string>('Freelancing');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const cleanTopic = topic.trim() || (language === 'bn' ? 'ফ্রিল্যান্সিং' : 'Video Editing');

  const titles = titleTemplates.map((item) => ({
    category: item.category,
    title: item.template.replace(/{TOPIC}/g, cleanTopic),
  }));

  const handleCopy = async (text: string, idx: number) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">
          {language === 'bn' ? 'আপনার ভিডিওর মূল বিষয় বা কিওয়ার্ড লিখুন:' : 'Enter your video topic / keyword:'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Freelancing, Python, Graphic Design, Web Development..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Generated Titles */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400" />
          {language === 'bn' ? 'উচ্চ-ক্লিক পাওয়ার উপযোগী টাইটেল আইডিয়া:' : 'High-CTR Title Suggestions:'}
        </span>
        <div className="grid grid-cols-1 gap-2.5">
          {titles.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 group transition-all"
            >
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 block mb-0.5 uppercase tracking-wider font-mono">
                  {item.category}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(item.title, idx)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedIndex === idx ? t('copied') : t('copy')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
