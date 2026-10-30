import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Wrench } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { language, t } = useLanguage();

  useEffect(() => {
    document.title = '404 - Page Not Found — SobTools';
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg">
        <Wrench className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight">
          404
        </h1>
        <h2 className="text-lg font-bold text-slate-200">
          {language === 'bn' ? 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {language === 'bn'
            ? 'আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি স্থানান্তরিত বা মুছে ফেলা হতে পারে। নিচের বাটন চেপে হোমে ফিরে যান অথবা অন্যান্য টুলস দেখুন।'
            : 'The page or tool you requested does not exist or may have been relocated.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Home className="w-4 h-4" />
          {t('backToHome')}
        </Link>
        <Link
          to="/tools"
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          {t('allTools')}
        </Link>
      </div>
    </div>
  );
};
