import React, { useState } from 'react';
import { Copy, Check, Trash2, Hash } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const CharacterCounter: React.FC = () => {
  const { language, t } = useLanguage();
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const totalChars = text.length;
  const noSpaceChars = text.replace(/\s/g, '').length;
  const letters = (text.match(/[a-zA-Z\u0980-\u09FF]/g) || []).length;
  const digits = (text.match(/[0-9\u09E6-\u09EF]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const specialChars = totalChars - letters - digits - spaces;

  const limits = [
    { name: 'X / Twitter', max: 280, current: totalChars },
    { name: 'SMS (Standard)', max: 160, current: totalChars },
    { name: 'SEO Meta Description', max: 160, current: totalChars },
    { name: 'Instagram Bio', max: 150, current: totalChars },
  ];

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
      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
            {language === 'bn' ? 'মোট ক্যারেক্টার' : 'Total'}
          </span>
          <span className="text-xl font-bold text-indigo-400 font-mono">{totalChars}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
            {language === 'bn' ? 'স্পেস ছাড়া' : 'No Spaces'}
          </span>
          <span className="text-xl font-bold text-cyan-400 font-mono">{noSpaceChars}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
            {language === 'bn' ? 'অক্ষর (Letters)' : 'Letters'}
          </span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{letters}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
            {language === 'bn' ? 'সংখ্যা (Digits)' : 'Digits'}
          </span>
          <span className="text-xl font-bold text-amber-400 font-mono">{digits}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
            {language === 'bn' ? 'স্পেস' : 'Spaces'}
          </span>
          <span className="text-xl font-bold text-purple-400 font-mono">{spaces}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wider">
            {language === 'bn' ? 'বিশেষ চিহ্ন' : 'Symbols'}
          </span>
          <span className="text-xl font-bold text-rose-400 font-mono">{specialChars}</span>
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? 'টেক্সট ইনপুট দিন:' : 'Input text:'}
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
              onClick={() => setText('')}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
            >
              {t('clear')}
            </button>
          </div>
        </div>

        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'ক্যারেক্টার গণনা করতে এখানে লিখুন...'
              : 'Type or paste content to count characters...'
          }
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>

      {/* Social Media Character Progress Bars */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
        <span className="text-xs font-semibold text-slate-300 block mb-1">
          {language === 'bn' ? 'সোশ্যাল মিডিয়া লিমিট মিটার:' : 'Social Platform Character Limits:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {limits.map((item) => {
            const percent = Math.min(100, Math.round((item.current / item.max) * 100));
            const isExceeded = item.current > item.max;
            return (
              <div key={item.name} className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span className="font-medium text-slate-300">{item.name}</span>
                  <span className={`font-mono ${isExceeded ? 'text-rose-400 font-bold' : ''}`}>
                    {item.current} / {item.max}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${percent}%` }}
                    className={`h-full transition-all duration-300 rounded-full ${
                      isExceeded ? 'bg-rose-500' : percent > 85 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
