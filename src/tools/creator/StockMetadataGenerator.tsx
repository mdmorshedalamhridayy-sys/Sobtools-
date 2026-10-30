import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Plus,
  Trash2,
  FileSpreadsheet,
  Layers,
  ArrowUp,
  ArrowDown,
  Info,
  CheckCircle2
} from 'lucide-react';
import { copyToClipboard, downloadBlob } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

type StockPlatform = 'adobe' | 'dreamstime' | 'shutterstock' | 'freepik';

interface StockMetadataItem {
  id: string;
  filename: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  isIllustration: boolean;
  isEditorial: boolean;
}

// Adobe Stock standard categories
const adobeCategories = [
  'Animals',
  'Buildings & Architecture',
  'Business & Finance',
  'Drinks',
  'The Environment',
  'States of Mind',
  'Food',
  'Graphic Resources',
  'Hobbies & Leisure',
  'Industry',
  'Landscapes',
  'Lifestyle',
  'People',
  'Plants & Flowers',
  'Culture & Religion',
  'Science',
  'Social Issues',
  'Sports',
  'Technology',
  'Transport',
  'Travel',
];

// Dreamstime standard primary categories
const dreamstimeCategories = [
  'Arts & Architecture',
  'Business',
  'Editorial',
  'Holidays & Celebrations',
  'IT & Computer',
  'Industries',
  'Nature',
  'People',
  'Objects & Still Life',
  'Illustrations & Vectors',
  'Travel & World',
];

// Common trademarked or restricted brand keywords that cause rejections on Adobe Stock / Dreamstime
const restrictedWords = [
  'apple',
  'iphone',
  'ipad',
  'macbook',
  'ios',
  'nike',
  'adidas',
  'puma',
  'disney',
  'mickey',
  'marvel',
  'lego',
  'coca cola',
  'cocacola',
  'pepsi',
  'photoshop',
  'illustrator',
  'adobe',
  'dreamstime',
  'shutterstock',
  'facebook',
  'meta',
  'instagram',
  'twitter',
  'tiktok',
  'whatsapp',
  'google',
  'android',
  'microsoft',
  'windows',
  'sony',
  'samsung',
];

export const StockMetadataGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [platform, setPlatform] = useState<StockPlatform>('adobe');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Default initial asset metadata
  const [items, setItems] = useState<StockMetadataItem[]>([
    {
      id: 'item-1',
      filename: 'islamic-geometric-mandala-background.eps',
      title: 'Islamic Geometric Arabic Mandala Pattern Background Vector',
      description: 'Luxury Islamic decorative geometric pattern with gold ornament for Ramadan Kareem, Eid Mubarak, invitation cards and banners.',
      keywords: [
        'islamic',
        'mandala',
        'pattern',
        'geometric',
        'arabic',
        'ornament',
        'ramadan',
        'eid mubarak',
        'gold',
        'background',
        'vector',
        'luxury',
        'illustration',
        'traditional',
        'decoration',
        'arabesque',
        'cultural',
        'abstract',
        'muslim',
        'card',
        'banner',
      ],
      category: 'Graphic Resources',
      isIllustration: true,
      isEditorial: false,
    },
  ]);

  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);
  const [newTagInput, setNewTagInput] = useState<string>('');

  const activeItem = items[activeItemIndex] || items[0];

  const updateActiveItem = (fields: Partial<StockMetadataItem>) => {
    setItems((prev) => {
      const next = [...prev];
      next[activeItemIndex] = { ...next[activeItemIndex], ...fields };
      return next;
    });
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const raw = newTagInput.trim().replace(/^,+|,+$/g, '');
    if (!raw) return;

    // split by comma if pasted
    const splitTags = raw
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const updated = Array.from(new Set([...activeItem.keywords, ...splitTags]));
    updateActiveItem({ keywords: updated });
    setNewTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    updateActiveItem({
      keywords: activeItem.keywords.filter((k) => k !== tagToRemove),
    });
  };

  const moveTag = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeItem.keywords.length) return;
    const nextTags = [...activeItem.keywords];
    const temp = nextTags[index];
    nextTags[index] = nextTags[targetIndex];
    nextTags[targetIndex] = temp;
    updateActiveItem({ keywords: nextTags });
  };

  const cleanAndDedupeTags = () => {
    const cleaned = Array.from(
      new Set(
        activeItem.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean)
      )
    );
    updateActiveItem({ keywords: cleaned });
  };

  // Check for restricted / trademarked words in title, description and keywords
  const detectedRestrictedWords: string[] = [];
  const fullTextToScan = `${activeItem.title} ${activeItem.description} ${activeItem.keywords.join(' ')}`.toLowerCase();
  restrictedWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(fullTextToScan)) {
      detectedRestrictedWords.push(word);
    }
  });

  const removeAllRestrictedWords = () => {
    const cleanedKeywords = activeItem.keywords.filter(
      (k) => !restrictedWords.includes(k.toLowerCase())
    );
    let cleanedTitle = activeItem.title;
    restrictedWords.forEach((word) => {
      cleanedTitle = cleanedTitle.replace(new RegExp(`\\b${word}\\b`, 'gi'), '');
    });
    updateActiveItem({
      keywords: cleanedKeywords,
      title: cleanedTitle.replace(/\s+/g, ' ').trim(),
    });
  };

  // Copy helpers
  const handleCopy = async (text: string, key: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Generate Platform Compliant CSV
  const handleExportCSV = () => {
    let csvContent = '';
    const sanitize = (val: string) => `"${val.replace(/"/g, '""')}"`;

    if (platform === 'adobe') {
      // Adobe Stock CSV specification: Filename, Title, Keywords, Category
      csvContent += 'Filename,Title,Keywords,Category\r\n';
      items.forEach((item) => {
        const kw = item.keywords.slice(0, 49).join(', ');
        csvContent += `${sanitize(item.filename)},${sanitize(item.title)},${sanitize(kw)},${sanitize(item.category)}\r\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, 'adobe-stock-metadata.csv');
    } else if (platform === 'dreamstime') {
      // Dreamstime CSV specification: Filename, Title, Description, Keywords, Categories
      csvContent += 'Filename,Title,Description,Keywords,Categories,MR_Count\r\n';
      items.forEach((item) => {
        const kw = item.keywords.slice(0, 80).join(', ');
        csvContent += `${sanitize(item.filename)},${sanitize(item.title)},${sanitize(item.description)},${sanitize(kw)},${sanitize(item.category)},0\r\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, 'dreamstime-metadata.csv');
    } else if (platform === 'shutterstock') {
      // Shutterstock CSV specification: Filename, Description, Keywords, Categories, Illustration, Editorial
      csvContent += 'Filename,Description,Keywords,Categories,Illustration,Editorial\r\n';
      items.forEach((item) => {
        const kw = item.keywords.slice(0, 50).join(', ');
        csvContent += `${sanitize(item.filename)},${sanitize(item.title)},${sanitize(kw)},${sanitize(item.category)},${item.isIllustration ? 'yes' : 'no'},${item.isEditorial ? 'yes' : 'no'}\r\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, 'shutterstock-metadata.csv');
    } else {
      // Freepik / Standard CSV
      csvContent += 'Filename,Title,Tags\r\n';
      items.forEach((item) => {
        const kw = item.keywords.join(', ');
        csvContent += `${sanitize(item.filename)},${sanitize(item.title)},${sanitize(kw)}\r\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, 'freepik-stock-metadata.csv');
    }
  };

  const handleAddNewItem = () => {
    const newItem: StockMetadataItem = {
      id: `item-${Date.now()}`,
      filename: `vector-design-asset-${items.length + 1}.eps`,
      title: activeItem.title,
      description: activeItem.description,
      keywords: [...activeItem.keywords],
      category: activeItem.category,
      isIllustration: true,
      isEditorial: false,
    };
    setItems([...items, newItem]);
    setActiveItemIndex(items.length);
  };

  const handleDeleteItem = (indexToDelete: number) => {
    if (items.length <= 1) return;
    const next = items.filter((_, idx) => idx !== indexToDelete);
    setItems(next);
    setActiveItemIndex(Math.max(0, activeItemIndex - 1));
  };

  // Platform limits & validations
  const keywordCount = activeItem.keywords.length;
  let minTags = 5;
  let maxTags = 49;
  let platformLabel = 'Adobe Stock';

  if (platform === 'dreamstime') {
    minTags = 10;
    maxTags = 80;
    platformLabel = 'Dreamstime';
  } else if (platform === 'shutterstock') {
    minTags = 7;
    maxTags = 50;
    platformLabel = 'Shutterstock';
  } else if (platform === 'freepik') {
    minTags = 5;
    maxTags = 50;
    platformLabel = 'Freepik / Vecteezy';
  }

  const isTagCountValid = keywordCount >= minTags && keywordCount <= maxTags;

  return (
    <div className="space-y-6">
      {/* Platform Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/70 border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlatform('adobe')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              platform === 'adobe'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Adobe Stock
          </button>
          <button
            type="button"
            onClick={() => setPlatform('dreamstime')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              platform === 'dreamstime'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dreamstime
          </button>
          <button
            type="button"
            onClick={() => setPlatform('shutterstock')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              platform === 'shutterstock'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shutterstock
          </button>
          <button
            type="button"
            onClick={() => setPlatform('freepik')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              platform === 'freepik'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Freepik / Vecteezy
          </button>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>
            {language === 'bn'
              ? `${platformLabel} CSV ডাউনলোড`
              : `Export ${platformLabel} CSV`}
          </span>
        </button>
      </div>

      {/* Batch Files Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          {language === 'bn' ? 'ফাইলসমূহ:' : 'Files:'}
        </span>
        {items.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => setActiveItemIndex(idx)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer shrink-0 transition-all ${
              idx === activeItemIndex
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="truncate max-w-[150px] font-mono">{item.filename}</span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteItem(idx);
                }}
                className="text-slate-500 hover:text-rose-400"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddNewItem}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-slate-400 hover:text-white text-xs font-medium shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'নতুন ফাইল যোগ' : 'Add File'}</span>
        </button>
      </div>

      {/* Trademark / Restricted Warning Banner */}
      {detectedRestrictedWords.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/50 text-amber-300 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-200">
                {language === 'bn'
                  ? 'সতর্কতা: কপিরাইট বা ট্রেডমার্ক শব্দ শনাক্ত হয়েছে!'
                  : 'Warning: Restricted trademarked words detected!'}
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                {language === 'bn'
                  ? `Adobe Stock এবং Dreamstime-এ ট্রেডমার্ক বা ব্র্যান্ড নাম থাকলে ফাইল সরাসরি রিজেক্ট করা হয়: "${detectedRestrictedWords.join(', ')}"`
                  : `Adobe Stock, Dreamstime & Shutterstock reject files containing trademarked terms: "${detectedRestrictedWords.join(', ')}"`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={removeAllRestrictedWords}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold shrink-0"
          >
            {language === 'bn' ? 'স্বয়ংক্রিয়ভাবে মুছুন' : 'Remove Words'}
          </button>
        </div>
      )}

      {/* Main Metadata Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Title, Description, File Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'ফাইলের নাম (Filename with extension):' : 'Filename (e.g. .eps, .ai, .jpg):'}
                </label>
                <input
                  type="text"
                  value={activeItem.filename}
                  onChange={(e) => updateActiveItem({ filename: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'ক্যাটাগরি (Category):' : 'Stock Category:'}
                </label>
                <select
                  value={activeItem.category}
                  onChange={(e) => updateActiveItem({ category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                >
                  {(platform === 'dreamstime' ? dreamstimeCategories : adobeCategories).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'শিরোনাম / টাইটেল (Title):' : 'Title (Concise & Descriptive):'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeItem.title.split(/\s+/).filter(Boolean).length} {language === 'bn' ? 'শব্দ' : 'words'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeItem.title, 'title')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedKey === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'title' ? t('copied') : t('copy')}</span>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={activeItem.title}
                onChange={(e) => updateActiveItem({ title: e.target.value })}
                placeholder="e.g. Modern Ramadan Kareem Islamic Greeting Banner Vector"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {platform === 'adobe'
                  ? 'Adobe Stock recommends concise 5–10 word titles describing subject, style, and concept.'
                  : 'Dreamstime & Shutterstock require descriptive titles with at least 5 meaningful words.'}
              </span>
            </div>

            {/* Description (Dreamstime & Shutterstock specific) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'বিস্তারিত বিবরণ (Description for Dreamstime/Shutterstock):' : 'Detailed Description:'}
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(activeItem.description, 'desc')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedKey === 'desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'desc' ? t('copied') : t('copy')}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={activeItem.description}
                onChange={(e) => updateActiveItem({ description: e.target.value })}
                placeholder="Write detailed context, colors, themes, and use-cases..."
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Illustration / Editorial Flags */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeItem.isIllustration}
                  onChange={(e) => updateActiveItem({ isIllustration: e.target.checked })}
                  className="rounded accent-indigo-500"
                />
                <span>{language === 'bn' ? 'ইলস্ট্রেশন / ভেক্টর (Illustration)' : 'Illustration / Vector Graphic'}</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeItem.isEditorial}
                  onChange={(e) => updateActiveItem({ isEditorial: e.target.checked })}
                  className="rounded accent-indigo-500"
                />
                <span>{language === 'bn' ? 'এডিটোরিয়াল / সংবাদপত্র (Editorial)' : 'Editorial Content'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Keyword / Tag Management with Adobe Stock Top 10 Weighting */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  {language === 'bn' ? 'কীওয়ার্ড / ট্যাগ ম্যানেজার:' : 'Keywords & Tags:'}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isTagCountValid ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {keywordCount} / {maxTags} {language === 'bn' ? 'টি ট্যাগ' : 'tags'} (Min: {minTags})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={cleanAndDedupeTags}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px]"
                  title="Deduplicate and clean"
                >
                  {language === 'bn' ? 'ক্লিন' : 'Clean'}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(activeItem.keywords.join(', '), 'allTags')}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  {copiedKey === 'allTags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'allTags' ? t('copied') : t('copy')}</span>
                </button>
              </div>
            </div>

            {/* Adobe Stock Top 10 Note */}
            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                {language === 'bn'
                  ? 'Adobe Stock অ্যালগরিদম প্রথম ১০টি কীওয়ার্ডকে সর্বোচ্চ প্রাধান্য দেয়। তীর চিহ্ন দিয়ে সবচেয়ে প্রাসঙ্গিক শব্দগুলো ওপরে রাখুন।'
                  : 'Adobe Stock algorithm prioritizes the first 10 keywords! Reorder to put the most critical words on top.'}
              </span>
            </div>

            {/* Add Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={language === 'bn' ? 'ট্যাগ লিখুন (Enter বা কমা দিন)...' : 'Add tag (press Enter or comma)...'}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                +
              </button>
            </div>

            {/* Reorderable Tag List */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
              {activeItem.keywords.map((tag, idx) => {
                const isTop10 = idx < 10;
                return (
                  <div
                    key={`${tag}-${idx}`}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-colors ${
                      isTop10
                        ? 'bg-indigo-950/40 border border-indigo-900/50 text-indigo-200'
                        : 'bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[10px] w-5 text-right font-bold ${isTop10 ? 'text-indigo-400' : 'text-slate-500'}`}>
                        #{idx + 1}
                      </span>
                      <span className="truncate">{tag}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveTag(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                        title="Move Up (Higher Rank)"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTag(idx, 'down')}
                        disabled={idx === activeItem.keywords.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 ml-1"
                        title="Delete tag"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comma-Separated Raw Preview */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">
                {language === 'bn' ? 'কমা দ্বারা পৃথক টেক্সট (সরাসরি কপি ও পেস্টের জন্য):' : 'Comma-Separated Output (Ready to paste):'}
              </span>
              <textarea
                readOnly
                rows={3}
                value={activeItem.keywords.join(', ')}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
