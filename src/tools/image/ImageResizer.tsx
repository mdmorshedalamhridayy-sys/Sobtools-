import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Maximize2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const ImageResizer: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizing, setResizing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = await readFileAsDataURL(selected);
      setPreviewUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setOrigWidth(img.naturalWidth);
        setOrigHeight(img.naturalHeight);
        setTargetWidth(img.naturalWidth);
        setTargetHeight(img.naturalHeight);
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      };
    }
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setTargetHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setTargetWidth(Math.round(val * aspectRatio));
    }
  };

  const applyPercent = (pct: number) => {
    const w = Math.round((origWidth * pct) / 100);
    const h = Math.round((origHeight * pct) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  useEffect(() => {
    if (!previewUrl || targetWidth <= 0 || targetHeight <= 0) return;

    let isMounted = true;
    setResizing(true);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (format === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      canvas.toBlob((blob) => {
        if (!isMounted || !blob) return;
        setResizedBlob(blob);
        if (resizedUrl) URL.revokeObjectURL(resizedUrl);
        setResizedUrl(URL.createObjectURL(blob));
        setResizing(false);
      }, mimeType, 0.92);
    };

    return () => {
      isMounted = false;
    };
  }, [previewUrl, targetWidth, targetHeight, format]);

  const handleDownload = () => {
    if (!resizedBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(resizedBlob, `${baseName}-${targetWidth}x${targetHeight}.${format}`);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setResizedBlob(null);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setResizedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
            <Maximize2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি নির্বাচন করুন বা এখানে ছাড়ুন' : 'Select an image to resize'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'পিক্সেল বা পার্সেন্টেজ অনুযায়ী আকার পরিবর্তন করুন।'
              : 'Resize to exact dimensions or scale percentage.'}
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
          {/* Controls */}
          <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-300">
                {language === 'bn' ? 'শতকরা হারে স্কেল করুন:' : 'Quick Presets:'}
              </span>
              <div className="flex items-center gap-1.5">
                {[25, 50, 75, 125, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applyPercent(pct)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-slate-300 transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {language === 'bn' ? 'প্রস্থ (Width px)' : 'Width (px)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={targetWidth || ''}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {language === 'bn' ? 'দৈর্ঘ্য (Height px)' : 'Height (px)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={targetHeight || ''}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`p-2.5 rounded-xl border mt-5 transition-colors ${
                    lockAspect
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                  title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  {t('reset')}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!resizedBlob || resizing}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <Download className="w-4 h-4" />
                  {t('download')}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Box */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>
                {language === 'bn' ? 'আসল মাপ:' : 'Original:'}{' '}
                <strong className="text-slate-200 font-mono">{origWidth} × {origHeight} px</strong>
              </span>
              <span>
                {language === 'bn' ? 'নতুন মাপ:' : 'New:'}{' '}
                <strong className="text-indigo-400 font-mono">{targetWidth} × {targetHeight} px</strong>
                {resizedBlob && ` (${formatBytes(resizedBlob.size)})`}
              </span>
            </div>
            <div className="max-h-[420px] bg-slate-950/80 rounded-lg overflow-auto flex items-center justify-center p-4">
              {resizedUrl ? (
                <img
                  src={resizedUrl}
                  alt="Resized output"
                  className="max-h-96 object-contain rounded shadow"
                />
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('processing')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
