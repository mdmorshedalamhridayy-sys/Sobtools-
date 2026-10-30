import React, { useState } from 'react';
import { Copy, Check, Trash2, AlignLeft, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const TextFormatter: React.FC = () => {
  const { language, t } = useLanguage();
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const cleanExtraSpaces = () => {
    setText((prev) => prev.replace(/[ \t]+/g, ' '));
  };

  const removeEmptyLines = () => {
    setText((prev) =>
      prev
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .join('\n')
    );
  };

  const trimAllLines = () => {
    setText((prev) =>
      prev
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
    );
  };

  const fixPunctuation = () => {
    setText((prev) =>
      prev
        // space after comma, colon, semicolon, dari
        .replace(/([,;:]|।)(?=[^\s])/g, '$1 ')
        // eliminate spaces before punctuation
        .replace(/\s+([,;:.?!।])/g, '$1')
    );
  };

  const normalizeBengaliUnicode = () => {
    setText((prev) => prev.normalize('NFC'));
  };

  const autoCleanAll = () => {
    setText((prev) =>
      prev
        .normalize('NFC')
        .split('\n')
        .map((line) => line.replace(/[ \t]+/g, ' ').trim())
        .filter((line) => line.length > 0)
        .join('\n')
        .replace(/([,;:]|।)(?=[^\s])/g, '$1 ')
        .replace(/\s+([,;:.?!।])/g, '$1')
    );
  };

  const handleCopy = async () => {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Badges */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? 'ফরম্যাটিং অ্যাকশন:' : 'Formatting Actions:'}
          </span>
          <button
            type="button"
            onClick={autoCleanAll}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {language === 'bn' ? 'এক ক্লিকে সব ঠিক করুন (Auto Clean)' : 'Smart Auto Clean'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={cleanExtraSpaces}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {language === 'bn' ? 'অতিরিক্ত স্পেস মুছুন' : 'Remove Extra Spaces'}
          </button>
          <button
            type="button"
            onClick={removeEmptyLines}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {language === 'bn' ? 'খালি লাইন মুছুন' : 'Remove Empty Lines'}
          </button>
          <button
            type="button"
            onClick={trimAllLines}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {language === 'bn' ? 'প্রতিটি লাইন ট্রিম' : 'Trim Leading/Trailing'}
          </button>
          <button
            type="button"
            onClick={fixPunctuation}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
          >
            {language === 'bn' ? 'যতিচিহ্ন ও দাঁড়ি ঠিক' : 'Fix Punctuation'}
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? 'টেক্সট এডিটর:' : 'Text Editor:'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
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
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'এখানে লেখা পেস্ট করুন... অতিরিক্ত স্পেস, খালি লাইন বা অসঙ্গতি দূর করতে উপরের বাটন ব্যবহার করুন।'
              : 'Paste your messy text here and click any format button above...'
          }
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>
    </div>
  );
};
