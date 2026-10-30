import React, { useState } from 'react';
import { Copy, Check, Trash2, ListFilter, Download, ArrowDownAZ } from 'lucide-react';
import { copyToClipboard, downloadBlob } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const DuplicateLineRemover: React.FC = () => {
  const { language, t } = useLanguage();
  const [text, setText] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [trimLines, setTrimLines] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const rawLines = text.split('\n');
  const originalCount = text ? rawLines.length : 0;

  // Process unique lines
  const seen = new Set<string>();
  const uniqueLines: string[] = [];

  for (const raw of rawLines) {
    if (!text && raw === '') continue;
    const processed = trimLines ? raw.trim() : raw;
    const lookup = caseSensitive ? processed : processed.toLowerCase();
    if (!seen.has(lookup)) {
      seen.add(lookup);
      uniqueLines.push(processed);
    }
  }

  const duplicatesCount = originalCount > 0 ? originalCount - uniqueLines.length : 0;

  const handleApplyRemove = () => {
    setText(uniqueLines.join('\n'));
  };

  const handleSortAsc = () => {
    const sorted = [...uniqueLines].sort((a, b) => a.localeCompare(b));
    setText(sorted.join('\n'));
  };

  const handleCopy = async () => {
    if (!text) return;
    const ok = await copyToClipboard(uniqueLines.join('\n'));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([uniqueLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'clean-unique-lines.txt');
  };

  return (
    <div className="space-y-6">
      {/* Real-time Counter Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {language === 'bn' ? 'মোট লাইন' : 'Total Lines'}
          </span>
          <span className="text-xl font-bold font-mono text-slate-200">
            {originalCount}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-0.5">
            {language === 'bn' ? 'ইউনিক লাইন' : 'Unique Lines'}
          </span>
          <span className="text-xl font-bold font-mono text-indigo-400">
            {uniqueLines.length}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-center">
          <span className="text-[11px] text-emerald-400 block mb-0.5">
            {language === 'bn' ? 'ডুপ্লিকেট মোছা যাবে' : 'Duplicates Removed'}
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400">
            {duplicatesCount}
          </span>
        </div>
      </div>

      {/* Options Bar */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{language === 'bn' ? 'কেস-সেনসিটিভ (Case Sensitive)' : 'Case Sensitive'}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{language === 'bn' ? 'লাইন ট্রিম করুন' : 'Trim Whitespace'}</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyRemove}
            disabled={!text}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            {language === 'bn' ? 'ডুপ্লিকেট মুছুন' : 'Remove Duplicates'}
          </button>
          <button
            type="button"
            onClick={handleSortAsc}
            disabled={!text}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5"
          >
            <ArrowDownAZ className="w-3.5 h-3.5" />
            {language === 'bn' ? 'A-Z সাজান' : 'Sort A-Z'}
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? 'তালিকা বা টেক্সট লিখুন:' : 'Input List:'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              .TXT
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
            >
              {t('clear')}
            </button>
          </div>
        </div>

        <textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'এখানে লাইন বাই লাইন লিস্ট পেস্ট করুন (যেমন: ইমেইল তালিকা বা কিওয়ার্ড)...'
              : 'Paste line-by-line list here (e.g. emails, keywords)...'
          }
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
        />
      </div>
    </div>
  );
};
