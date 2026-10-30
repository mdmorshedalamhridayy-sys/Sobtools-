import React, { useState, useRef } from 'react';
import { Upload, Copy, Check, Binary, Code, FileText } from 'lucide-react';
import { formatBytes, readFileAsDataURL, copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const ImageToBase64: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = await readFileAsDataURL(selected);
      setDataUrl(url);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const rawBase64 = dataUrl ? dataUrl.split(',')[1] || '' : '';
  const htmlSnippet = dataUrl ? `<img src="${dataUrl}" alt="embedded image" />` : '';
  const cssSnippet = dataUrl ? `background-image: url("${dataUrl}");` : '';

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Binary className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি নির্বাচন করুন Base64 এ রূপান্তর করতে' : 'Select an image to convert to Base64'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'ছবির ডেটা ইউআরআই, এইচটিএমএল বা সিএসএস কোড কপি করুন।'
              : 'Extract Data URI, HTML tag, or CSS background-image snippet.'}
          </p>
          <button
            type="button"
            className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            {t('browseFiles')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <img src={dataUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-700" />
              <div>
                <span className="text-sm font-semibold text-slate-200 block truncate max-w-xs">{file.name}</span>
                <span className="text-xs text-slate-400 font-mono">{formatBytes(file.size)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setDataUrl('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              {t('reset')}
            </button>
          </div>

          {/* Formats Tabs / Snippets */}
          <div className="space-y-4">
            {/* 1. Full Data URI */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Data URI (src="data:image/...")
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(dataUrl, 'dataUrl')}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  {copiedType === 'dataUrl' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'dataUrl' ? t('copied') : t('copy')}
                </button>
              </div>
              <textarea
                readOnly
                rows={3}
                value={dataUrl}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none"
              />
            </div>

            {/* 2. HTML <img> */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-emerald-400" />
                  HTML &lt;img&gt; Tag
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(htmlSnippet, 'html')}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  {copiedType === 'html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'html' ? t('copied') : t('copy')}
                </button>
              </div>
              <textarea
                readOnly
                rows={2}
                value={htmlSnippet}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none"
              />
            </div>

            {/* 3. Raw Base64 string */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-purple-400" />
                  Raw Base64 String (Without header)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(rawBase64, 'raw')}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"
                >
                  {copiedType === 'raw' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedType === 'raw' ? t('copied') : t('copy')}
                </button>
              </div>
              <textarea
                readOnly
                rows={2}
                value={rawBase64}
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
