import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { fetchCMSPage } from '../services/cmsService';
import { CMSPage } from '../types';

export const DisclaimerPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    document.title = language === 'bn' ? 'ডিসক্লেইমার — SobTools' : 'Disclaimer — SobTools';
    fetchCMSPage('disclaimer').then((data) => {
      if (data) setCmsPage(data);
    }).catch(() => {});
  }, [language]);

  const displayTitle = cmsPage?.title?.[language] || (language === 'bn' ? 'ডিসক্লেইমার (Disclaimer)' : 'Disclaimer');
  const displaySubtitle = cmsPage?.subtitle?.[language] || 'Last Updated: October 2026';
  const displayContent = cmsPage?.content?.[language];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-300">
      <Breadcrumb items={[{ label: t('disclaimer') }]} />

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
            1. General Disclaimer
          </h2>
          <p>
            The tools and informational content on SobTools (sobtools.com) are provided for general educational, personal, and productivity purposes. While we strive to ensure that all formulas, conversions (such as Bangladeshi land measurements and unit formulas), and processing scripts are mathematically accurate, SobTools makes no representation or warranty of any kind regarding accuracy or completeness.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            2. Local Processing & File Safety
          </h2>
          <p>
            All file processing tasks (including image compression, cropping, format conversion, and PDF manipulation) occur locally within your web browser. SobTools does not make backup copies of your files. Users are advised to keep original copies of critical documents before applying transformations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            3. Google AdSense & Monetization Disclosure
          </h2>
          <p>
            SobTools is an independent web utility and is prepared to display advertising placements, including future advertisements from Google AdSense or compliant advertising networks. We do not guarantee approval, specific earnings, or endorsements of advertised third-party products.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            4. External Links Disclaimer
          </h2>
          <p>
            SobTools may contain links to external third-party sites (such as public YouTube thumbnail endpoints, Google developer documentation, etc.). SobTools has no control over the content, privacy practices, or availability of external sites.
          </p>
        </section>
      </div>
    </div>
  );
};
