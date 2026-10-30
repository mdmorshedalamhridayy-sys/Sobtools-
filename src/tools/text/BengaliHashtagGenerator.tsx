import React, { useState } from 'react';
import { Copy, Check, Hash, TrendingUp, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

const hashtagBundles: Record<string, { label: { en: string; bn: string }; tags: string[] }> = {
  general: {
    label: { en: 'Bangladesh General', bn: 'বাংলাদেশ ট্রেন্ডিং' },
    tags: ['#Bangladesh', '#Dhaka', '#Chittagong', '#Sylhet', '#Bangla', '#Bangladeshi', '#DeshiVibes', '#BangladeshGram', '#BD'],
  },
  tech: {
    label: { en: 'Tech & Freelancing', bn: 'টেক ও ফ্রিল্যান্সিং' },
    tags: ['#FreelanceBD', '#FreelancingBangladesh', '#TechBD', '#BanglaTech', '#WebDeveloperBD', '#GraphicDesignerBD', '#RemoteWorkBD', '#SoftwareEngineerBD'],
  },
  photography: {
    label: { en: 'Photography & Reels', bn: 'ফটোগ্রাফি ও রিলস' },
    tags: ['#PhotographyBD', '#BanglaReels', '#ReelsBangladesh', '#DesiPortraits', '#StreetPhotographyBD', '#VisualsOfBangladesh', '#InstaBD', '#BeautifulBangladesh'],
  },
  travel: {
    label: { en: 'Travel & Nature', bn: 'ভ্রমণ ও পর্যটন' },
    tags: ['#TravelBangladesh', '#SajekValley', '#CoxsBazar', '#SaintMartin', '#SylhetDiaries', '#Bandarban', '#ExploreBD', '#NatureBD'],
  },
  eid: {
    label: { en: 'Eid & Festivals', bn: 'ঈদ ও উৎসব' },
    tags: ['#EidMubarak', '#EidBD', '#EidUlFitr', '#PohelaBoishakh', '#BijoyDibas', '#FestiveVibes', '#BanglaUtshob', '#BangladeshiCelebration'],
  },
  food: {
    label: { en: 'Bangla Food & Street Eats', bn: 'খাবার ও ফুড ভ্লগ' },
    tags: ['#BanglaFood', '#DeshiFood', '#KacchiBiryani', '#DhakaFoodie', '#FoodPornBD', '#StreetFoodBD', '#FoodLoverBD', '#ChaiPariBD'],
  },
};

export const BengaliHashtagGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedBundle, setSelectedBundle] = useState<string>('general');
  const [selectedTags, setSelectedTags] = useState<string[]>(hashtagBundles['general'].tags);
  const [copied, setCopied] = useState<boolean>(false);

  const handleBundleChange = (key: string) => {
    setSelectedBundle(key);
    setSelectedTags(hashtagBundles[key].tags);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleCopyAll = async () => {
    const ok = await copyToClipboard(selectedTags.join(' '));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          {language === 'bn' ? 'হ্যাশট্যাগ ক্যাটাগরি বাছাই করুন:' : 'Select Hashtag Niche:'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(hashtagBundles).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleBundleChange(key)}
              className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                selectedBundle === key
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Output & Tags Selection */}
      <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {language === 'bn'
              ? `বাছাই করা ট্যাগ (${selectedTags.length}টি):`
              : `Selected Tags (${selectedTags.length}):`}
          </span>
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={selectedTags.length === 0}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('copied') : language === 'bn' ? 'সব হ্যাশট্যাগ কপি' : 'Copy Selected Tags'}
          </button>
        </div>

        {/* Tag Pills */}
        <div className="flex flex-wrap gap-2">
          {hashtagBundles[selectedBundle].tags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/80 text-indigo-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 line-through'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Formatted Output Box */}
        <div className="pt-2">
          <textarea
            readOnly
            rows={3}
            value={selectedTags.join(' ')}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
