import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Tag,
  Flame,
  ArrowUpDown,
  Trash2,
  Plus,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface NicheKeywordPack {
  id: string;
  label: { en: string; bn: string };
  tags: string[];
}

const nichePacks: NicheKeywordPack[] = [
  {
    id: 'islamic',
    label: { en: 'Islamic, Eid & Ramadan Vector', bn: 'ইসলামিক, ঈদ ও রমাদান ভেক্টর' },
    tags: [
      'islamic',
      'ramadan',
      'eid mubarak',
      'arabic',
      'crescent',
      'lantern',
      'mosque',
      'gold',
      'ornament',
      'background',
      'vector',
      'kareem',
      'celebration',
      'mandala',
      'pattern',
      'greeting',
      'traditional',
      'arabesque',
      'illustration',
      'culture',
      'religion',
      'holy',
      'card',
      'banner',
      'islam',
      'moon',
      'luxury',
      'middle east',
      'decorative',
      'festival',
      'iftar',
      'night',
      'prayer',
      'festive',
      'al fitr',
    ],
  },
  {
    id: 'business',
    label: { en: 'Business, Corporate & Teamwork', bn: 'বিজনেস ও করপোরেট কনসেপ্ট' },
    tags: [
      'business',
      'corporate',
      'teamwork',
      'office',
      'finance',
      'meeting',
      'strategy',
      'success',
      'professional',
      'work',
      'vector',
      'illustration',
      'character',
      'technology',
      'concept',
      'company',
      'growth',
      'flat',
      'modern',
      'consulting',
      'leadership',
      'people',
      'partner',
      'project',
      'communication',
      'analysis',
      'marketing',
      'investment',
      'freelancer',
      'career',
      'startup',
    ],
  },
  {
    id: 'patterns',
    label: { en: 'Seamless Patterns & Textures', bn: 'সিমলেস প্যাটার্ন ও ব্যাকগ্রাউন্ড' },
    tags: [
      'pattern',
      'seamless',
      'background',
      'texture',
      'abstract',
      'geometric',
      'ornament',
      'decorative',
      'wallpaper',
      'tile',
      'vector',
      'design',
      'repeat',
      'fabric',
      'print',
      'vintage',
      'retro',
      'modern',
      'backdrop',
      'swatch',
      'line art',
      'minimalist',
      'graphic',
      'element',
      'artistic',
      'boho',
      'monochrome',
      'paper',
    ],
  },
  {
    id: 'tech',
    label: { en: 'Tech, AI & Cyber Data', bn: 'টেকনোলজি ও এআই' },
    tags: [
      'technology',
      'ai',
      'artificial intelligence',
      'cyber',
      'data',
      'digital',
      'futuristic',
      'network',
      'connection',
      'computer',
      'vector',
      'cloud',
      'coding',
      'innovation',
      'smart',
      'concept',
      'security',
      'big data',
      'algorithm',
      'virtual',
      'machine learning',
      'modern',
      'science',
      'database',
      'software',
      'online',
      'internet',
    ],
  },
  {
    id: 'social',
    label: { en: 'Social Media Templates & Flyers', bn: 'সোশ্যাল মিডিয়া ও ব্যানার' },
    tags: [
      'social media',
      'flyer',
      'banner',
      'template',
      'poster',
      'layout',
      'post',
      'modern',
      'promo',
      'sale',
      'vector',
      'discount',
      'marketing',
      'advertisement',
      'business',
      'feed',
      'square',
      'creative',
      'design',
      'web',
      'corporate',
      'cover',
      'header',
      'campaign',
      'event',
      'minimalist',
    ],
  },
  {
    id: 'nature',
    label: { en: 'Nature, Floral & Botanical', bn: 'প্রকৃতি, ফুল ও বোটানিক্যাল' },
    tags: [
      'nature',
      'floral',
      'botanical',
      'flower',
      'leaf',
      'plant',
      'summer',
      'spring',
      'garden',
      'natural',
      'vector',
      'green',
      'organic',
      'eco',
      'background',
      'watercolor',
      'foliage',
      'tropical',
      'illustration',
      'blossom',
      'wildlife',
      'beauty',
      'environment',
      'isolated',
      'drawn',
    ],
  },
];

export const StockKeywordSuggester: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedPackId, setSelectedPackId] = useState<string>('islamic');
  const [tags, setTags] = useState<string[]>(nichePacks[0].tags);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelectPack = (pack: NicheKeywordPack) => {
    setSelectedPackId(pack.id);
    setTags([...pack.tags]);
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const raw = newTagInput.trim().replace(/^,+|,+$/g, '');
    if (!raw) return;

    const parts = raw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0 && !tags.includes(t));

    setTags([...tags, ...parts]);
    setNewTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCopy = async () => {
    if (tags.length === 0) return;
    const ok = await copyToClipboard(tags.join(', '));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const keywordCount = tags.length;

  return (
    <div className="space-y-6">
      {/* Niche Selector */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-slate-300 block mb-1 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-400" />
          {language === 'bn' ? 'ডিজাইন সেলিং নিস নির্বাচন করুন:' : 'Select Microstock Niche Category:'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {nichePacks.map((pack) => (
            <button
              key={pack.id}
              type="button"
              onClick={() => handleSelectPack(pack)}
              className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                selectedPackId === pack.id
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {pack.label[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Tags Manager */}
      <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              {language === 'bn' ? 'স্টক কীওয়ার্ড তালিকা:' : 'Active Microstock Keyword Bank:'}
            </span>
            <span className="text-[11px] font-mono text-indigo-400 font-bold">
              {keywordCount} / 49 keywords (Optimal for Adobe Stock & Dreamstime)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTags([])}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              {t('clear')}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={tags.length === 0}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : language === 'bn' ? 'সব কীওয়ার্ড কপি' : 'Copy All Tags (Comma)'}
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder={language === 'bn' ? 'কাস্টম কীওয়ার্ড যোগ করুন...' : 'Type keyword and press Enter or comma...'}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
          >
            + Add
          </button>
        </div>

        {/* Tags Container */}
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 max-h-60 overflow-y-auto">
          {tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                idx < 10
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
              }`}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-slate-400 hover:text-rose-400 text-xs"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Ready to paste string */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1">
            {language === 'bn'
              ? 'Adobe Stock ও Dreamstime-এ সরাসরি পেস্ট করার কমা টেক্সট:'
              : 'Direct Comma-Separated String:'}
          </span>
          <textarea
            readOnly
            rows={3}
            value={tags.join(', ')}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-300 font-mono focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
