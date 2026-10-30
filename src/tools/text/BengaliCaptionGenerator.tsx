import React, { useState } from 'react';
import { Copy, Check, Sparkles, Filter, Heart, Compass, Flame, Smile } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface CaptionItem {
  id: string;
  category: 'motivation' | 'romantic' | 'attitude' | 'travel' | 'festive' | 'freelance';
  caption: string;
  tags: string[];
}

const captionsData: CaptionItem[] = [
  // Motivation
  {
    id: 'm1',
    category: 'motivation',
    caption: 'হার মেনে নেওয়া কোনো সমাধান নয়, প্রতিটি ব্যর্থতাই নতুনভাবে শুরু করার অনুপ্রেরণা।',
    tags: ['#মোটিভেশন', '#সফলতা', '#পরিশ্রম', '#NeverGiveUp', '#Bangladesh'],
  },
  {
    id: 'm2',
    category: 'motivation',
    caption: 'যে নিজের লক্ষ্য স্থির রাখতে পারে, ঝড়-তুফানও তার পথ আটকাতে পারে না।',
    tags: ['#আত্মবিশ্বাস', '#স্বপ্ন', '#লক্ষ্য', '#MotivationBangla'],
  },
  {
    id: 'm3',
    category: 'motivation',
    caption: 'ধৈর্য আর পরিশ্রমের চেয়ে বড় কোনো জাদুকরি শক্তি এই পৃথিবীতে নেই।',
    tags: ['#ধৈর্য', '#সাফল্য', '#অনুপ্রেরণা', '#LifeQuotes'],
  },
  // Romantic
  {
    id: 'r1',
    category: 'romantic',
    caption: 'তুমি এক কাপ গরম চা আর ঝুম বৃষ্টির মতো স্নিগ্ধ, যার পরশে মন ভালো হয়ে যায়।',
    tags: ['#ভালোবাসা', '#স্মৃতি', '#অনুভূতি', '#RomanticBangla'],
  },
  {
    id: 'r2',
    category: 'romantic',
    caption: 'কিছু কথা না বললেও বোঝা যায়, কিছু মায়া দূর থেকেও বুকে জড়িয়ে রাখা যায়।',
    tags: ['#মায়া', '#প্রেম', '#তুমিআরআমি', '#Love'],
  },
  {
    id: 'r3',
    category: 'romantic',
    caption: 'গোধূলি বেলার আকাশ যেমন রক্তিম, আমার মনের ক্যানভাসে তুমিও তেমনি রঙিন।',
    tags: ['#আকাশ', '#প্রেমেরকবিতা', '#স্নিগ্ধতা'],
  },
  // Attitude
  {
    id: 'a1',
    category: 'attitude',
    caption: 'আমি যেমন, ঠিক তেমনই। কারোর চোখে ভালো হওয়ার জন্য নিজের ব্যক্তিত্ব বিসর্জন দিই না।',
    tags: ['#ব্যক্তিত্ব', '#Attitude', '#SelfRespect', '#BeYourself'],
  },
  {
    id: 'a2',
    category: 'attitude',
    caption: 'নীরবতা মানে দুর্বলতা নয়, সিংহ সব সময় গর্জন করে শিকার করে না।',
    tags: ['#রয়্যাল', '#AttitudeQuotes', '#BanglaVibe'],
  },
  // Travel
  {
    id: 't1',
    category: 'travel',
    caption: 'পাহাড়ের বাঁকে কিংবা সাগরের গর্জনে নিজের হারিয়ে যাওয়া সত্ত্বাকে নতুন করে খুঁজে পাওয়া।',
    tags: ['#ভ্রমণ', '#বাংলাদেশ', '#TravelBD', '#Wanderlust', '#Nature'],
  },
  {
    id: 't2',
    category: 'travel',
    caption: 'জীবন একটাই, তাই চার দেয়ালের খাঁচা ছেড়ে প্রকৃতির রূপ দেখার নেশায় ছুটে চলা।',
    tags: ['#সাজেক', '#কক্সবাজার', '#ভ্রমনপিপাসু', '#ExploreBangladesh'],
  },
  // Festive / Eid
  {
    id: 'f1',
    category: 'festive',
    caption: 'ঈদের আনন্দ ছড়িয়ে পড়ুক সবার প্রাণে। হিংসা-বিদ্বেষ ভুলে সবাইকে ঈদের শুভেচ্ছা—ঈদ মোবারক!',
    tags: ['#ঈদমোবারক', '#EidUlFitr', '#EidMubarak', '#উৎসব'],
  },
  {
    id: 'f2',
    category: 'festive',
    caption: 'নতুন দিনের সূর্য আনুক অফুরন্ত খুশির বারতা। সবাইকে উৎসবের আন্তরিক শুভেচ্ছা।',
    tags: ['#শুভনববর্ষ', '#পহেলাবৈশাখ', '#উৎসবেরআনন্দ'],
  },
  // Freelancing & Career
  {
    id: 'c1',
    category: 'freelance',
    caption: 'নির্ঘুম রাত আর এক কাপ কফির লড়াই, দিনশেষে আত্মতৃপ্তির নামই ফ্রিল্যান্সিং জীবন।',
    tags: ['#ফ্রিল্যান্সিং', '#FreelancerLife', '#DevLife', '#WorkFromHome', '#Bangladesh'],
  },
  {
    id: 'c2',
    category: 'freelance',
    caption: 'দক্ষতাই আপনার আসল পরিচয়। প্রতিনিয়ত শিখুন, চেষ্টা করুন—সুযোগ নিজেই আপনার কাছে আসবে।',
    tags: ['#ক্যারিয়ার', '#দক্ষতা', '#লার্নিং', '#SuccessMindset'],
  },
];

export const BengaliCaptionGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [includeTags, setIncludeTags] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: language === 'bn' ? 'সব ক্যাপশন' : 'All Captions' },
    { id: 'motivation', label: language === 'bn' ? 'অনুপ্রেরণামূলক' : 'Motivational' },
    { id: 'romantic', label: language === 'bn' ? 'রোমান্টিক ও প্রেম' : 'Romantic' },
    { id: 'attitude', label: language === 'bn' ? 'অ্যাটিটিউড ও স্টাইল' : 'Attitude' },
    { id: 'travel', label: language === 'bn' ? 'ভ্রমণ ও প্রকৃতি' : 'Travel' },
    { id: 'festive', label: language === 'bn' ? 'ঈদ ও উৎসব' : 'Festive' },
    { id: 'freelance', label: language === 'bn' ? 'ফ্রিল্যান্সিং ও কাজ' : 'Freelancing' },
  ];

  const filtered = selectedCategory === 'all'
    ? captionsData
    : captionsData.filter((c) => c.category === selectedCategory);

  const handleCopy = async (item: CaptionItem) => {
    const textToCopy = includeTags
      ? `${item.caption}\n\n${item.tags.join(' ')}`
      : item.caption;
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills & Settings */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? 'ক্যাপশন ক্যাটাগরি বেছে নিন:' : 'Choose Caption Mood:'}
          </span>
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={includeTags}
              onChange={(e) => setIncludeTags(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{language === 'bn' ? 'হ্যাশট্যাগসহ কপি করুন' : 'Include Hashtags'}</span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Captions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                <span className="capitalize px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400 font-medium">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-500">বাংলা ক্যাপশন</span>
              </div>
              <p className="text-sm text-slate-100 font-medium leading-relaxed my-3">
                "{item.caption}"
              </p>
              {includeTags && (
                <div className="flex flex-wrap gap-1 text-[11px] text-indigo-400/80 mb-4 font-mono">
                  {item.tags.join(' ')}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => handleCopy(item)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === item.id ? t('copied') : language === 'bn' ? 'ক্যাপশন কপি করুন' : 'Copy Caption'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
