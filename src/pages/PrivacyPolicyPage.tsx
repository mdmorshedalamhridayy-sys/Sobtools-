import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, EyeOff, Server, Cookie } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { fetchCMSPage } from '../services/cmsService';
import { CMSPage } from '../types';

export const PrivacyPolicyPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [cmsPage, setCmsPage] = useState<CMSPage | null>(null);

  useEffect(() => {
    document.title = language === 'bn' ? 'প্রাইভেসি পলিসি — SobTools' : 'Privacy Policy — SobTools';
    fetchCMSPage('privacy').then((data) => {
      if (data) setCmsPage(data);
    }).catch(() => {});
  }, [language]);

  const displayTitle = cmsPage?.title?.[language] || (language === 'bn' ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy');
  const displaySubtitle = cmsPage?.subtitle?.[language] || (language === 'bn'
    ? 'SobTools ব্যবহারকারীদের তথ্যের পূর্ণ গোপনীয়তা ও সুরক্ষায় সর্বোচ্চ গুরুত্ব প্রদান করে।'
    : 'At SobTools (accessible from sobtools.com), user privacy is our foremost engineering priority.');
  const displayContent = cmsPage?.content?.[language];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-300">
      <Breadcrumb items={[{ label: t('privacy') }]} />

      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Last Updated: {cmsPage?.lastUpdated ? new Date(cmsPage.lastUpdated).toLocaleDateString() : 'October 2026'}</span>
        </div>
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

      {/* Main Highlights Callout */}
      <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 space-y-2">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" />
          {language === 'bn' ? 'মূল গ্যারান্টি: জিরো ফাইল আপলোড' : 'Core Guarantee: Zero Server File Uploads'}
        </h3>
        <p className="text-xs text-emerald-400/90 leading-relaxed">
          {language === 'bn'
            ? 'আমাদের ইমেজ কম্প্রেসার, পিডিএফ মার্জার, টেক্সট ক্লিনার ও ক্রিয়েটর টুলস সম্পূর্ণভাবে আপনার ডিভাইসের ওয়েব ব্রাউজারে কাজ করে। আপনার কোনো ছবি, ব্যক্তিগত নথি বা ফাইল আমাদের সার্ভারে আপলোড করা হয় না।'
            : 'Our image manipulation, PDF compilation, password generation, and text formatting tools run 100% locally inside your web browser. No files, documents, or image data are ever transmitted to or stored on our servers.'}
        </p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            1. Information We Do NOT Collect
          </h2>
          <p>
            We do not collect, view, or retain any user files, photos, PDF documents, passwords, or text inputs. All mathematical, cryptographic, and media transformations occur strictly within client-side memory (RAM) and are discarded as soon as you close or refresh the browser tab.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            2. Local Storage Usage
          </h2>
          <p>
            SobTools uses the browser's <code>localStorage</code> solely to remember your UI preferences:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Language preference (English or Bengali).</li>
            <li>Theme preference (Dark mode or Light mode).</li>
            <li>Recent tool usage history (only if you keep history tracking enabled, and you can clear it anytime via one click).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            3. Google AdSense & Third-Party Cookies
          </h2>
          <p>
            SobTools may utilize third-party vendors, including Google AdSense, to serve advertisements when you visit our website. These companies may use cookies (such as the DoubleClick cookie) to serve ads based on your prior visits to this or other websites on the internet.
          </p>
          <p className="text-slate-400">
            Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google Ads Settings</a> or <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">aboutads.info</a>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            4. Log Files & Server Metrics
          </h2>
          <p>
            Like virtually all web hosts, standard non-identifying server logs (such as HTTP status codes, browser user agent, and request timestamps) may be generated for server health monitoring, DDoS prevention, and security auditing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-100">
            5. Contact Us Regarding Privacy
          </h2>
          <p>
            If you have any questions or concerns regarding our privacy practices, please contact us at <strong className="text-slate-200">privacy@sobtools.com</strong> or via our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};
