import React, { useState } from 'react';
import { Copy, Check, Repeat, Sparkles, ArrowRight } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

const synonymsMap: Record<string, string[]> = {
  // English synonyms
  'important': ['crucial', 'vital', 'essential', 'significant'],
  'help': ['assist', 'support', 'facilitate', 'aid'],
  'use': ['utilize', 'employ', 'apply', 'leverage'],
  'make': ['create', 'generate', 'produce', 'craft'],
  'good': ['exceptional', 'excellent', 'high-grade', 'superb'],
  'fast': ['rapid', 'lightning-quick', 'instant', 'speedy'],
  'difficult': ['challenging', 'arduous', 'demanding', 'complex'],
  'start': ['commence', 'initiate', 'launch', 'embark on'],
  'show': ['demonstrate', 'illustrate', 'display', 'reveal'],
  'big': ['substantial', 'immense', 'massive', 'vast'],
  // Bengali common rephrasings
  'খুব': ['অত্যন্ত', 'বিশেষভাবে', 'দারুণ'],
  'ভালো': ['চমৎকার', 'উৎকৃষ্ট', 'মনোরম'],
  'সাহায্য': ['সহায়তা', 'সহযোগিতা', 'সমর্থন'],
  'কাজ': ['কর্মযজ্ঞ', 'পরিশ্রম', 'উদ্যোগ'],
  'সুন্দর': ['নয়নাভিরাম', 'মনোরম', 'দৃষ্টি নন্দন'],
  'সহজ': ['সহজসাধ্য', 'স্বাচ্ছন্দ্যময়', 'অনায়াস'],
  'দরকার': ['প্রয়োজন', 'অপরিহার্য', 'জরুরি'],
  'শুরু': ['সূচনা', 'আরম্ভ', 'উদ্বোধন'],
};

export const ParagraphRewriter: React.FC = () => {
  const { language, t } = useLanguage();
  const [inputText, setInputText] = useState<string>('');
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleRewrite = () => {
    if (!inputText.trim()) return;

    let result = inputText;
    Object.entries(synonymsMap).forEach(([word, syns]) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      result = result.replace(regex, (match) => {
        const randomSyn = syns[Math.floor(Math.random() * syns.length)];
        // match case
        if (match[0] === match[0].toUpperCase()) {
          return randomSyn.charAt(0).toUpperCase() + randomSyn.slice(1);
        }
        return randomSyn;
      });
    });

    setRewrittenText(result);
  };

  const handleCopy = async () => {
    if (!rewrittenText) return;
    const ok = await copyToClipboard(rewrittenText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Text Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              {language === 'bn' ? 'মূল প্যারাগ্রাফ (Original Text):' : 'Original Text:'}
            </label>
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setRewrittenText('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              {t('clear')}
            </button>
          </div>
          <textarea
            rows={8}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'যে লেখাটি নতুন ঢঙে রিরাইট করতে চান এখানে লিখুন বা পেস্ট করুন...'
                : 'Enter your paragraph to rephrase and swap with contextual synonyms...'
            }
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
          />
        </div>

        {/* Rewritten Result */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-indigo-400">
              {language === 'bn' ? 'রিরাইট করা ফলাফল (Rewritten):' : 'Rewritten Output:'}
            </label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!rewrittenText}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
          <textarea
            readOnly
            rows={8}
            value={rewrittenText}
            placeholder={
              language === 'bn'
                ? 'রিরাইট করা টেক্সট এখানে প্রদর্শিত হবে...'
                : 'Rewritten version will appear here...'
            }
            className="w-full p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none leading-relaxed font-sans"
          />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={handleRewrite}
          disabled={!inputText.trim()}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {language === 'bn' ? 'প্যারাগ্রাফ রিরাইট করুন' : 'Paraphrase & Rewrite'}
        </button>
      </div>
    </div>
  );
};
