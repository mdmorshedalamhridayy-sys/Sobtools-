import React, { useState, useEffect } from 'react';
import { Download, FileCode, AlertCircle, CheckCircle } from 'lucide-react';
import { downloadDataUrl, formatBytes } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const Base64ToImage: React.FC = () => {
  const { language, t } = useLanguage();
  const [inputVal, setInputVal] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [fileSize, setFileSize] = useState<number>(0);

  useEffect(() => {
    if (!inputVal.trim()) {
      setDataUrl('');
      setError(null);
      setDimensions(null);
      setFileSize(0);
      return;
    }

    let formatted = inputVal.trim();
    // If not starting with data:, prepend standard data:image/png;base64,
    if (!formatted.startsWith('data:image/')) {
      // detect if it's raw base64
      formatted = `data:image/png;base64,${formatted}`;
    }

    const img = new Image();
    img.src = formatted;
    img.onload = () => {
      setDataUrl(formatted);
      setError(null);
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      // Approximate byte size of base64
      const base64Content = formatted.split(',')[1] || '';
      const bytes = Math.round((base64Content.length * 3) / 4);
      setFileSize(bytes);
    };
    img.onerror = () => {
      setDataUrl('');
      setDimensions(null);
      setError(
        language === 'bn'
          ? 'অবৈধ Base64 ইমেজ স্ট্রিং। দয়া করে সঠিক ডেটা দিন।'
          : 'Invalid Base64 image data. Please check and try again.'
      );
    };
  }, [inputVal, language]);

  const handleDownload = () => {
    if (!dataUrl) return;
    downloadDataUrl(dataUrl, 'decoded-image.png');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>{language === 'bn' ? 'Base64 স্ট্রিং বা Data URI পেস্ট করুন:' : 'Paste Base64 or Data URI string:'}</span>
          {dimensions && (
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {dimensions.width} × {dimensions.height} px ({formatBytes(fileSize)})
            </span>
          )}
        </label>
        <textarea
          rows={5}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
          className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {dataUrl && dimensions && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              {language === 'bn' ? 'ডিকোড করা ইমেজ প্রিভিউ:' : 'Decoded Image Preview:'}
            </span>
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              <Download className="w-4 h-4" />
              {t('download')} (PNG)
            </button>
          </div>

          <div className="max-h-96 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-center p-4 overflow-auto">
            <img src={dataUrl} alt="Decoded preview" className="max-h-80 object-contain rounded shadow" />
          </div>
        </div>
      )}
    </div>
  );
};
