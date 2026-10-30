import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { fetchCMSPage } from '../services/cmsService';
import { CMSPage } from '../types';

export const TermsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    document.title = language === 'bn' ? 'ব্যবহারের শর্তাবলী — SobTools' : 'Terms of Service — SobTools';
    fetchCMSPage('terms').then((data) => {
      if (data) setCmsPage(data);
    }).catch(() => {});
  }, [language]);

  const displayTitle = cmsPage?.title?.[language] || (language === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms of Service)' : 'Terms of Service');
  const displaySubtitle = cmsPage?.subtitle?.[language] || 'Last Updated: October 2026';
  const displayContent = cmsPage?.content?.[language];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-300">
      <Breadcrumb items={[{ label: t('terms') }]} />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          {displayTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {displaySubtitle}
        </p>
      </div>

      {displayContent && (
        <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 text-xs sm:text-sm text-slate-300 whitespace-pre-line leading-relaxed">
          {displayContent}
        </div>
      )}

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using SobTools (sobtools.com), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this website.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            2. Permitted Use & Intellectual Property
          </h2>
          <p>
            You are granted permission to use all tools, utilities, and calculators for personal, educational, or lawful commercial purposes. You retain full copyright and ownership of all files and content you process using SobTools. SobTools claims zero ownership or intellectual property rights over any file or text you generate.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            3. Prohibited Activities
          </h2>
          <p>
            You agree not to use SobTools for any unlawful activities, including processing malicious files, attempting denial-of-service attacks, reverse-engineering or scraping the platform at high frequencies that impair access for other users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            4. Disclaimer of Warranties
          </h2>
          <p>
            SobTools is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. While we take great care in testing mathematical formulas, PDF transformations, and compression algorithms, we do not guarantee that the site will always be uninterrupted or error-free.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            5. Modifications to Terms
          </h2>
          <p>
            SobTools reserves the right to revise these Terms of Service at any time without notice. Continued use of the website following any changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>
    </div>
  );
};
