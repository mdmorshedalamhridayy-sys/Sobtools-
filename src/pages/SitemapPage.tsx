import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categories, toolsRegistry } from '../config/toolsRegistry';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { IconResolver } from '../components/IconResolver';

export const SitemapPage: React.FC = () => {
  const { language, t } = useLanguage();

  useEffect(() => {
    document.title = language === 'bn' ? 'সাইটম্যাপ — SobTools' : 'HTML Sitemap — SobTools';
  }, [language]);

  const staticPages = [
    { title: { en: 'Home', bn: 'হোমপেজ' }, path: '/' },
    { title: { en: 'All 36 Tools', bn: 'সকল ৩৬টি টুলস' }, path: '/tools' },
    { title: { en: 'About Us', bn: 'আমাদের সম্পর্কে' }, path: '/about' },
    { title: { en: 'FAQ & Help', bn: 'প্রশ্নোত্তর' }, path: '/faq' },
    { title: { en: 'Contact Support', bn: 'যোগাযোগ' }, path: '/contact' },
    { title: { en: 'Privacy Policy', bn: 'প্রাইভেসি পলিসি' }, path: '/privacy' },
    { title: { en: 'Terms of Service', bn: 'ব্যবহারের শর্তাবলী' }, path: '/terms' },
    { title: { en: 'Disclaimer', bn: 'ডিসক্লেইমার' }, path: '/disclaimer' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Breadcrumb items={[{ label: t('sitemap') }]} />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          {language === 'bn' ? 'ওয়েবসাইট সাইটম্যাপ (Sitemap)' : 'HTML Sitemap'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {language === 'bn'
            ? 'SobTools-এর প্রতিটি টুল এবং পৃষ্ঠার প্রত্যক্ষ লিংক।'
            : 'Index of all 36 functional tools, category directories, and compliance pages.'}
        </p>
      </div>

      {/* Main Pages */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h2 className="text-base font-bold text-slate-200">
          {language === 'bn' ? 'মূল ও আইনি পৃষ্ঠাসমূহ' : 'Core & Legal Pages'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {staticPages.map((page, idx) => (
            <Link
              key={idx}
              to={page.path}
              className="p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-indigo-400 transition-colors"
            >
              {page.title[language]}
            </Link>
          ))}
        </div>
      </div>

      {/* Category Wise Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const catTools = toolsRegistry.filter((t) => t.category === cat.id);
          return (
            <div key={cat.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <IconResolver name={cat.icon} className="w-4 h-4" />
                  </div>
                  <Link
                    to={`/category/${cat.slug}`}
                    className="text-base font-bold text-slate-100 hover:text-indigo-400 transition-colors"
                  >
                    {cat.name[language]}
                  </Link>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {catTools.length} {language === 'bn' ? 'টি' : 'tools'}
                </span>
              </div>

              <ul className="space-y-2 text-xs">
                {catTools.map((tool) => (
                  <li key={tool.id}>
                    <Link
                      to={`/tools/${tool.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-indigo-400 transition-colors"
                    >
                      <span className="font-medium truncate max-w-xs">{tool.name[language]}</span>
                      <span className="text-[10px] text-slate-500 font-mono">/tools/{tool.slug}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
