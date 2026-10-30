import React, { useState } from 'react';
import { Copy, Check, Trash2, Clock, BookOpen, Volume2, AlignLeft } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const WordCounter: React.FC = () => {
  const { language, t } = useLanguage();
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const trimmed = text.trim();
  // Support both English words and Bengali words (\s+ split)
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCountWithSpaces = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed ? trimmed.split(/[.!?।]+/).filter((s) => s.trim().length > 0) : [];
  const sentenceCount = sentences.length;
  const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0) : [];
  const paragraphCount = paragraphs.length;

  // Average reading speed: 200 words per minute
  const readingTimeMin = Math.ceil(wordCount / 200);
  // Average speaking speed: 130 words per minute
  const speakingTimeMin = Math.ceil(wordCount / 130);

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
      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase tracking-wider font-medium">
            {language === 'bn' ? 'মোট শব্দ (Words)' : 'Words'}
          </span>
          <span className="text-2xl font-extrabold text-indigo-400 font-mono">
            {wordCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase tracking-wider font-medium">
            {language === 'bn' ? 'অক্ষর (স্পেসসহ)' : 'Characters'}
          </span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono">
            {charCountWithSpaces}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase tracking-wider font-medium">
            {language === 'bn' ? 'বাক্য (Sentences)' : 'Sentences'}
          </span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">
            {sentenceCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 block mb-1 uppercase tracking-wider font-medium">
            {language === 'bn' ? 'প্যারাগ্রাফ' : 'Paragraphs'}
          </span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono">
            {paragraphCount}
          </span>
        </div>
      </div>

      {/* Input Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? 'এখানে টেক্সট টাইপ করুন বা পেস্ট করুন:' : 'Type or paste your text here:'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
            <button
              type="button"
              onClick={() => setText('')}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
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
              ? 'আপনার লেখা লিখুন... শব্দ, বাক্য ও পড়ার সময় তাৎক্ষণিক গণনা করা হবে।'
              : 'Start typing or paste your content here to see instant statistics...'
          }
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
          <AlignLeft className="w-4 h-4 text-indigo-400" />
          <span>
            {language === 'bn' ? 'স্পেস ছাড়া অক্ষর:' : 'Without Spaces:'}{' '}
            <strong className="text-slate-200 font-mono">{charCountNoSpaces}</strong>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>
            {language === 'bn' ? 'পড়ার সময়:' : 'Reading Time:'}{' '}
            <strong className="text-slate-200 font-mono">~{readingTimeMin} {language === 'bn' ? 'মিনিট' : 'min'}</strong>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-2.5">
          <Volume2 className="w-4 h-4 text-rose-400" />
          <span>
            {language === 'bn' ? 'বলার সময়:' : 'Speaking Time:'}{' '}
            <strong className="text-slate-200 font-mono">~{speakingTimeMin} {language === 'bn' ? 'মিনিট' : 'min'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
