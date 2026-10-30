import React, { useState } from 'react';
import { Copy, Check, Trash2, Type } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const CaseConverter: React.FC = () => {
  const { language, t } = useLanguage();
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const toUppercase = () => setText((prev) => prev.toUpperCase());
  const toLowercase = () => setText((prev) => prev.toLowerCase());

  const toTitleCase = () => {
    setText((prev) =>
      prev.toLowerCase().replace(/(?:^|\s)\w/g, (match) => match.toUpperCase())
    );
  };

  const toSentenceCase = () => {
    setText((prev) =>
      prev
        .toLowerCase()
        .replace(/(^\s*\w|[.!?।]\s*\w)/g, (c) => c.toUpperCase())
    );
  };

  const toCamelCase = () => {
    setText((prev) =>
      prev
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[^a-zA-Z0-9]+/, '')
    );
  };

  const toSnakeCase = () => {
    setText((prev) =>
      prev
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '')
    );
  };

  const toKebabCase = () => {
    setText((prev) =>
      prev
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-]/g, '')
    );
  };

  const toAlternatingCase = () => {
    let alt = '';
    for (let i = 0; i < text.length; i++) {
      alt += i % 2 === 0 ? text[i].toLowerCase() : text[i].toUpperCase();
    }
    setText(alt);
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
      {/* Transformation Action Buttons */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
        <span className="text-xs font-semibold text-slate-300 block mb-2">
          {language === 'bn' ? 'রূপান্তর করতে নিচের বাটনে ক্লিক করুন:' : 'Click to transform case:'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={toUppercase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            UPPERCASE
          </button>
          <button
            type="button"
            onClick={toLowercase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            lowercase
          </button>
          <button
            type="button"
            onClick={toTitleCase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Title Case
          </button>
          <button
            type="button"
            onClick={toSentenceCase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Sentence case
          </button>
          <button
            type="button"
            onClick={toCamelCase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors font-mono"
          >
            camelCase
          </button>
          <button
            type="button"
            onClick={toSnakeCase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors font-mono"
          >
            snake_case
          </button>
          <button
            type="button"
            onClick={toKebabCase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors font-mono"
          >
            kebab-case
          </button>
          <button
            type="button"
            onClick={toAlternatingCase}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            aLtErNaTiNg
          </button>
        </div>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? 'টেক্সট ইনপুট ও এডিটর:' : 'Text editor:'}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!text}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
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
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            language === 'bn'
              ? 'এখানে টেক্সট লিখুন এবং উপরের বাটনে ক্লিক করে রূপান্তর করুন...'
              : 'Enter text here and click any button above to convert its case...'
          }
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
        />
      </div>
    </div>
  );
};
