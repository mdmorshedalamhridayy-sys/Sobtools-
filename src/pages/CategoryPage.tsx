import React, { useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { categories, toolsRegistry } from '../config/toolsRegistry';
import { ToolCard } from '../components/ToolCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { AdSlot } from '../components/AdSlot';
import { IconResolver } from '../components/IconResolver';
import { useLanguage } from '../context/LanguageContext';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();

  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return <Navigate to="/404" replace />;
  }

  useEffect(() => {
    document.title = `${category.name[language]} — SobTools`;
  }, [category, language]);

  const tools = toolsRegistry.filter((t) => t.category === category.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: t('categories'), to: '/tools' },
          { label: category.name[language] },
        ]}
      />

      {/* Category Hero Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-cyan-500/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg">
          <IconResolver name={category.icon} className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              {t('categories')}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400 font-semibold">
              {tools.length} {language === 'bn' ? 'টি কার্যকর টুলস' : 'Production Tools'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-2">
            {category.name[language]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {category.description[language]}
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Ad Placement */}
      <AdSlot format="banner" />
    </div>
  );
};
