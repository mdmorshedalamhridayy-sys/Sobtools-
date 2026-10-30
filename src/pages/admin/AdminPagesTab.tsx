import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { CMSPage } from '../../types';
import { fetchCMSPage, saveCMSPage } from '../../services/cmsService';

interface PagesTabProps {
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'CMS', details: string, targetId?: string) => void;
}

const STATIC_PAGES = [
  { id: 'about', label: 'About Us (/about)' },
  { id: 'privacy', label: 'Privacy Policy (/privacy)' },
  { id: 'terms', label: 'Terms of Service (/terms)' },
  { id: 'disclaimer', label: 'Disclaimer (/disclaimer)' },
  { id: 'faq', label: 'FAQ (/faq)' },
  { id: 'contact', label: 'Contact Us (/contact)' },
];

export const AdminPagesTab: React.FC<PagesTabProps> = ({ onRefresh, onLogAudit }) => {
  const [selectedPageId, setSelectedPageId] = useState('about');
  const [pageData, setPageData] = useState<CMSPage>({
    id: 'about',
    slug: 'about',
    title: { en: 'About SobTools', bn: 'SobTools সম্পর্কে' },
    subtitle: {
      en: 'A premier utility platform engineered for speed, privacy, and simplicity.',
      bn: 'গতি, গোপনীয়তা ও সহজ ব্যবহারের জন্য নির্মিত একটি প্রিমিয়ার ইউটিলিটি প্ল্যাটফর্ম।',
    },
    content: {
      en: 'SobTools is designed to solve common digital file hurdles without uploading private documents to external servers. We believe privacy is a fundamental human right.',
      bn: 'SobTools ডিজাইন করা হয়েছে যাতে ব্যবহারকারীরা কোনো ফাইল ক্লাউডে আপলোড না করেই সম্পূর্ণ নিরাপদে ব্রাউজারে কাজ সম্পন্ন করতে পারেন।',
    },
    faqs: [
      {
        question: { en: 'Are my files uploaded to any servers?', bn: 'আমার ফাইলগুলো কি কোনো সার্ভারে আপলোড হয়?' },
        answer: {
          en: 'No. All image compression, PDF operations, and text formatting run 100% locally in your client web browser.',
          bn: 'না। আপনার ছবি কম্প্রেস, পিডিএফ প্রসেসিং এবং টেক্সট ফরম্যাটিং সবকিছুই সম্পূর্ণ লোকালি আপনার ডিভাইসের ব্রাউজারে সম্পাদিত হয়।',
        },
      },
    ],
    lastUpdated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCMSPage(selectedPageId).then((data) => {
      if (data) {
        setPageData(data);
      } else {
        // Fallback skeleton
        setPageData({
          id: selectedPageId,
          slug: selectedPageId,
          title: {
            en: selectedPageId.toUpperCase(),
            bn: selectedPageId.toUpperCase(),
          },
          subtitle: { en: '', bn: '' },
          content: { en: '', bn: '' },
          lastUpdated: new Date().toISOString(),
        });
      }
      setLoading(false);
    });
  }, [selectedPageId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await saveCMSPage(pageData);
      onLogAudit(
        'PAGE_UPDATE',
        'CMS',
        `Updated static CMS page: ${selectedPageId}`,
        selectedPageId
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      onRefresh();
    } catch (err) {
      console.error('Error saving page:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = () => {
    const list = pageData.faqs || [];
    setPageData({
      ...pageData,
      faqs: [
        ...list,
        {
          question: { en: 'New Question', bn: 'নতুন প্রশ্ন' },
          answer: { en: 'Answer details here...', bn: 'এখানে উত্তর লিখুন...' },
        },
      ],
    });
  };

  const handleRemoveFaq = (index: number) => {
    const list = [...(pageData.faqs || [])];
    list.splice(index, 1);
    setPageData({ ...pageData, faqs: list });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Static Pages & Legal CMS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage public website copy, legal policies, About Us, and FAQ questions in English and Bengali.
          </p>
        </div>

        {/* Page Switcher */}
        <select
          value={selectedPageId}
          onChange={(e) => setSelectedPageId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none cursor-pointer"
        >
          {STATIC_PAGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Fetching page contents...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Editing: {selectedPageId}
              </h3>
              {success && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved to Database!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Page Title (English)
                </label>
                <input
                  type="text"
                  required
                  value={pageData.title.en}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      title: { ...pageData.title, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  পেজের শিরোনাম (বাংলা)
                </label>
                <input
                  type="text"
                  required
                  value={pageData.title.bn}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      title: { ...pageData.title, bn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subtitle (English)
                </label>
                <textarea
                  rows={2}
                  value={pageData.subtitle.en}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      subtitle: { ...pageData.subtitle, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  উপ-শিরোনাম (বাংলা)
                </label>
                <textarea
                  rows={2}
                  value={pageData.subtitle.bn}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      subtitle: { ...pageData.subtitle, bn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Body Content / Policy (English)
                </label>
                <textarea
                  rows={8}
                  required
                  value={pageData.content.en}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      content: { ...pageData.content, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  মূল বিবরণ / পলিসি (বাংলা)
                </label>
                <textarea
                  rows={8}
                  required
                  value={pageData.content.bn}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      content: { ...pageData.content, bn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* Special FAQ Editor */}
          {selectedPageId === 'faq' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  <span>FAQ Question & Answer Items ({pageData.faqs?.length || 0})</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {pageData.faqs?.map((faq, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(index)}
                      className="absolute right-3 top-3 p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Question (EN)</label>
                        <input
                          type="text"
                          value={faq.question.en}
                          onChange={(e) => {
                            const copy = [...(pageData.faqs || [])];
                            copy[index].question.en = e.target.value;
                            setPageData({ ...pageData, faqs: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">প্রশ্ন (BN)</label>
                        <input
                          type="text"
                          value={faq.question.bn}
                          onChange={(e) => {
                            const copy = [...(pageData.faqs || [])];
                            copy[index].question.bn = e.target.value;
                            setPageData({ ...pageData, faqs: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Answer (EN)</label>
                        <textarea
                          rows={2}
                          value={faq.answer.en}
                          onChange={(e) => {
                            const copy = [...(pageData.faqs || [])];
                            copy[index].answer.en = e.target.value;
                            setPageData({ ...pageData, faqs: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">উত্তর (BN)</label>
                        <textarea
                          rows={2}
                          value={faq.answer.bn}
                          onChange={(e) => {
                            const copy = [...(pageData.faqs || [])];
                            copy[index].answer.bn = e.target.value;
                            setPageData({ ...pageData, faqs: copy });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Page Content</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
