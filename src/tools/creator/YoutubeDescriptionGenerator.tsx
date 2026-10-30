import React, { useState } from 'react';
import { Copy, Check, FileText, Sparkles } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const YoutubeDescriptionGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [summary, setSummary] = useState<string>('In this video, I will show you how to get started step-by-step.');
  const [timestamps, setTimestamps] = useState<string>('00:00 - Introduction\n01:30 - Key Concepts\n05:45 - Live Demo\n10:20 - Final Thoughts & Summary');
  const [socials, setSocials] = useState<string>('Facebook: https://facebook.com/yourpage\nInstagram: https://instagram.com/yourhandle\nWebsite: https://sobtools.com');
  const [tags, setTags] = useState<string>('#Tutorial #Tech #Creator #Bangladesh');
  const [copied, setCopied] = useState<boolean>(false);

  const fullDescription = `${summary.trim()}

📌 TIMESTAMPS:
${timestamps.trim()}

🔗 CONNECT WITH ME:
${socials.trim()}

⚠️ DISCLAIMER:
The views and opinions expressed in this video are for educational purposes. Any action you take upon the information on this channel is strictly at your own risk.

${tags.trim()}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullDescription);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {language === 'bn' ? '১. ভিডিওর সংক্ষিপ্ত বিবরণ (Summary):' : '1. Video Summary:'}
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {language === 'bn' ? '২. টাইমস্ট্যাম্প / চ্যাপ্টার্স (Timestamps):' : '2. Timestamps / Chapters:'}
            </label>
            <textarea
              rows={4}
              value={timestamps}
              onChange={(e) => setTimestamps(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {language === 'bn' ? '৩. সোশ্যাল মিডিয়া লিংক (Socials):' : '3. Social Links:'}
            </label>
            <textarea
              rows={3}
              value={socials}
              onChange={(e) => setSocials(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {language === 'bn' ? '৪. হ্যাশট্যাগ (Hashtags):' : '4. Video Hashtags:'}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-indigo-400 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Live Formatted Output Preview */}
        <div className="space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-indigo-400">
                {language === 'bn' ? 'তৈরিকৃত সম্পূর্ণ ডেসক্রিপশন:' : 'Generated Description Draft:'}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <textarea
              readOnly
              rows={16}
              value={fullDescription}
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
