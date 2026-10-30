import React, { useState } from 'react';
import { Youtube, Download, ExternalLink, AlertCircle, Eye, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ThumbnailQuality {
  label: string;
  res: string;
  url: string;
}

export const YoutubeThumbnailViewer: React.FC = () => {
  const { language, t } = useLanguage();
  const [inputUrl, setInputUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract 11 character YouTube Video ID from any URL format
  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i,
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(inputUrl);
    if (!id) {
      setError(
        language === 'bn'
          ? 'সঠিক ইউটিউব ভিডিও লিংক বা আইডি দিন (যেমন: https://youtu.be/...)'
          : 'Please enter a valid YouTube video URL or 11-character video ID.'
      );
      setVideoId(null);
    } else {
      setError(null);
      setVideoId(id);
    }
  };

  const thumbnails: ThumbnailQuality[] = videoId
    ? [
        {
          label: language === 'bn' ? 'ম্যাক্সিমাম রেজোলিউশন (Full HD / 1080p)' : 'Maximum Resolution (1080p Full HD)',
          res: '1920 × 1080',
          url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        },
        {
          label: language === 'bn' ? 'হাই কোয়ালিটি (HD / 720p)' : 'High Quality (HD 720p)',
          res: '1280 × 720',
          url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        },
        {
          label: language === 'bn' ? 'স্ট্যান্ডার্ড কোয়ালিটি (SD)' : 'Standard Quality (SD)',
          res: '640 × 480',
          url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        },
        {
          label: language === 'bn' ? 'মিডিয়াম কোয়ালিটি (MQ)' : 'Medium Quality (MQ)',
          res: '320 × 180',
          url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        },
      ]
    : [];

  const handleDownload = async (url: string, qualityLabel: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `youtube-thumbnail-${videoId}-${qualityLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <form onSubmit={handleFetch} className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          {language === 'bn' ? 'ইউটিউব ভিডিওর লিংক বা আইডি পেস্ট করুন:' : 'Paste YouTube Video URL or Video ID:'}
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Youtube className="w-5 h-5 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {language === 'bn' ? 'থাম্বনেইল দেখুন' : 'Get Thumbnails'}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Thumbnails Display Grid */}
      {videoId && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">
              {language === 'bn' ? 'ভিডিও আইডি:' : 'Video ID:'}{' '}
              <strong className="text-indigo-400 font-mono">{videoId}</strong>
            </span>
            <a
              href={`https://www.youtube.com/watch?v=videoId`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1"
            >
              <span>{language === 'bn' ? 'ইউটিউবে খুলুন' : 'Open in YouTube'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {thumbnails.map((tItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                    <span className="font-semibold text-slate-200 truncate">{tItem.label}</span>
                    <span className="font-mono text-[11px] text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
                      {tItem.res}
                    </span>
                  </div>
                  <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden mb-3 border border-slate-800">
                    <img
                      src={tItem.url}
                      alt={tItem.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownload(tItem.url, tItem.label)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'ডাউনলোড' : 'Download JPG'}
                  </button>
                  <a
                    href={tItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium"
                    title="Open full size image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
