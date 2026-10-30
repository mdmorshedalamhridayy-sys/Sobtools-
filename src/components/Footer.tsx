import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Heart, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { categories, toolsRegistry } from '../config/toolsRegistry';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  const imageTools = toolsRegistry.filter((t) => t.category === 'image').slice(0, 5);
  const pdfTools = toolsRegistry.filter((t) => t.category === 'pdf').slice(0, 5);
  const textTools = toolsRegistry.filter((t) => t.category === 'text').slice(0, 5);
  const creatorTools = toolsRegistry.filter((t) => t.category === 'creator').slice(0, 5);

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-md shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="text-lg font-bold text-slate-100 tracking-tight">
                SobTools <span className="text-xs font-normal text-indigo-400 ml-1">সবটুলস</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mb-4">
              {language === 'bn'
                ? 'SobTools হলো বাংলাদেশ ও বিশ্বের সকল ইন্টারনেট ব্যবহারকারীদের জন্য বিনামূল্যে আধুনিক ডিজিটাল টুলসের একটি সমন্বিত প্ল্যাটফর্ম। আপনার ফাইল কখনোই কোনো সার্ভারে পাঠানো হয় না—সবকিছু ডিভাইসেই সম্পন্ন হয়।'
                : 'SobTools is an all-in-one suite of free, privacy-focused online tools for creators, students, and professionals in Bangladesh and worldwide. Files are processed locally in your browser.'}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'bn' ? '১০০% ক্লায়েন্ট-সাইড প্রাইভেসি নিশ্চিত' : '100% Client-Side Privacy Guaranteed'}</span>
            </div>
          </div>

          {/* Quick Categories & Tools */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">
              {categories[0].name[language]}
            </h4>
            <ul className="space-y-2">
              {imageTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={`/tools/${tool.slug}`}
                    className="hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {tool.name[language]}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/category/image" className="text-indigo-400 hover:underline text-[11px] font-medium">
                  {language === 'bn' ? 'সব ইমেজ টুলস →' : 'All Image Tools →'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">
              {categories[1].name[language]}
            </h4>
            <ul className="space-y-2">
              {pdfTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    to={`/tools/${tool.slug}`}
                    className="hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {tool.name[language]}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/category/pdf" className="text-indigo-400 hover:underline text-[11px] font-medium">
                  {language === 'bn' ? 'সব পিডিএফ টুলস →' : 'All PDF Tools →'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-semibold mb-3 text-xs tracking-wider uppercase">
              {language === 'bn' ? 'আইনি ও নীতিমালা' : 'Legal & Trust'}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition-colors">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-indigo-400 transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-400 transition-colors">
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-indigo-400 transition-colors">
                  {t('disclaimer')}
                </Link>
              </li>
              <li>
                <Link to="/sitemap" className="hover:text-indigo-400 transition-colors">
                  {t('sitemap')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} SobTools. {t('brandTagline')}. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
              <span>for Bangladesh & Global Creators</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
