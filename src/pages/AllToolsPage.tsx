import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Layers, Sparkles } from 'lucide-react';
import { toolsRegistry, categories as defaultCategories } from '../config/toolsRegistry';
import { ToolCard } from '../components/ToolCard';
import { AdSlot } from '../components/AdSlot';
import { useLanguage } from '../context/LanguageContext';
import { ToolCategory, ToolDefinition, CategoryDefinition } from '../types';
import { fetchAllTools, fetchCategories } from '../services/cmsService';

export const AllToolsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const [tools, setTools] = useState<ToolDefinition[]>(toolsRegistry);
  const [categories, setCategories] = useState<CategoryDefinition[]>(defaultCategories);

  useEffect(() => {
    fetchAllTools().then(setTools).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    document.title = language === 'bn' ? 'সব টুলস — SobTools' : 'All Online Tools — SobTools';
  }, [language]);

  useEffect(() => {
    if (queryParam !== searchQuery) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const filteredTools = tools
    .filter((tool) => tool.status !== 'disabled')
    .filter((tool) => {
      // Category match
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (cleanQuery) {
        const matchNameBn = tool.name.bn.toLowerCase().includes(cleanQuery);
        const matchNameEn = tool.name.en.toLowerCase().includes(cleanQuery);
        const matchDescBn = tool.shortDescription.bn.toLowerCase().includes(cleanQuery);
        const matchDescEn = tool.shortDescription.en.toLowerCase().includes(cleanQuery);
        const matchKeywords = tool.keywords.some((k) => k.toLowerCase().includes(cleanQuery));
        return matchNameBn || matchNameEn || matchDescBn || matchDescEn || matchKeywords;
      }
      return true;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-2">
          {t('allTools')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {language === 'bn'
            ? 'আমাদের সকল ৩৯টি বিনামূল্যে কার্যকরী ডিজিটাল টুলসের তালিকা।'
            : 'Browse our complete catalog of 39 free, client-side digital utility tools.'}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'টুলের নাম বা কিওয়ার্ড দিয়ে ফিল্টার করুন...'
                : 'Filter tools by name, task, or keywords...'
            }
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 focus:border-indigo-500 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none shadow-md"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'সব টুলস' : 'All'} ({toolsRegistry.length})
          </button>
          {categories.map((cat) => {
            const count = toolsRegistry.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat.name[language]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-base font-semibold text-slate-200">
            {language === 'bn'
              ? `"${searchQuery}" এর সাথে কোনো টুল মেলেনি।`
              : `No tools matched "${searchQuery}".`}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'bn'
              ? 'অন্য কোনো শব্দ দিয়ে খুঁজুন বা ফিল্টার রিসেট করুন।'
              : 'Try searching with general keywords or clear your active filters.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
          >
            {t('reset')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {/* Ad Placement */}
      <AdSlot format="banner" />
    </div>
  );
};
