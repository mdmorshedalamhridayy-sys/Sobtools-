import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { toolsRegistry } from '../config/toolsRegistry';
import { useLanguage } from '../context/LanguageContext';
import { IconResolver } from './IconResolver';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { language } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery((prev) => (prev ? '' : prev));
    }
  }, [isOpen]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();
  const filteredTools = cleanQ
    ? toolsRegistry.filter((tool) => {
        const nameBn = tool.name.bn.toLowerCase();
        const nameEn = tool.name.en.toLowerCase();
        const descBn = tool.shortDescription.bn.toLowerCase();
        const descEn = tool.shortDescription.en.toLowerCase();
        const keywords = tool.keywords.map((k) => k.toLowerCase()).join(' ');
        return (
          nameBn.includes(cleanQ) ||
          nameEn.includes(cleanQ) ||
          descBn.includes(cleanQ) ||
          descEn.includes(cleanQ) ||
          keywords.includes(cleanQ) ||
          tool.category.toLowerCase().includes(cleanQ)
        );
      })
    : toolsRegistry.slice(0, 8); // show popular/first 8 when empty

  const handleSelectTool = (slug: string) => {
    navigate(`/tools/${slug}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'টুলের নাম বা কাজ দিয়ে খুঁজুন (যেমন: পিডিএফ মার্জ, ইমেজ সাইজ, কিউআর)...'
                : 'Search any tool by name, task, or keywords (e.g. merge, compress, qr)...'
            }
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-medium text-slate-400 bg-slate-800 rounded-md hover:bg-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm">
                {language === 'bn'
                  ? `"${query}" এর সাথে কোনো টুল পাওয়া যায়নি।`
                  : `No tools found matching "${query}".`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'bn'
                  ? 'অন্য কোনো শব্দ দিয়ে আবার চেষ্টা করুন।'
                  : 'Try searching with different keywords like pdf, image, or text.'}
              </p>
            </div>
          ) : (
            filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.slug)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/70 text-left transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <IconResolver name={tool.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 truncate">
                        {tool.name[language]}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {tool.shortDescription[language]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-3 shrink-0 text-slate-500 group-hover:text-indigo-400">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer info in modal */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'bn' ? '১০০% লোকাল ব্রাউজার প্রসেসিং' : '100% Client-Side Processing'}
          </span>
          <span>{filteredTools.length} {language === 'bn' ? 'টি ফলাফল' : 'tools available'}</span>
        </div>
      </div>
    </div>
  );
};
