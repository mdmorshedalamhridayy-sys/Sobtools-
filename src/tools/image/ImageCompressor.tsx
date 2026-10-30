import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, FileImage, Sliders, CheckCircle2 } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const ImageCompressor: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.type.startsWith('image/')) {
        alert(language === 'bn' ? 'দয়া করে একটি ছবি ফাইল নির্বাচন করুন।' : 'Please select a valid image file.');
        return;
      }
      setFile(selected);
      const url = await readFileAsDataURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type.startsWith('image/')) {
        setFile(dropped);
        const url = await readFileAsDataURL(dropped);
        setPreviewUrl(url);
      }
    }
  };

  useEffect(() => {
    if (!previewUrl) return;

    let isMounted = true;
    setCompressing(true);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle transparent PNG background filling for JPEG
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!isMounted || !blob) return;
          setCompressedBlob(blob);
          if (compressedUrl) URL.revokeObjectURL(compressedUrl);
          const newUrl = URL.createObjectURL(blob);
          setCompressedUrl(newUrl);
          setCompressing(false);
        },
        format,
        quality / 100
      );
    };

    return () => {
      isMounted = false;
    };
  }, [previewUrl, quality, format]);

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const ext = format === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(compressedBlob, `${baseName}-compressed.${ext}`);
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCompressedBlob(null);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const savedPercent =
    file && compressedBlob
      ? Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি নির্বাচন করুন বা টেনে এনে ছাড়ুন' : 'Drop your image here or browse'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'JPG, PNG, WebP ফরম্যাট সমর্থিত। আপনার ব্রাউজারে সম্পূর্ণ লোকাল প্রসেস হবে।'
              : 'Supports JPG, PNG, and WebP. 100% private client-side compression.'}
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
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  {language === 'bn' ? 'কম্প্রেশন কোয়ালিটি' : 'Compression Quality'}
                </span>
                <span className="text-indigo-400 font-mono font-bold">{quality}%</span>
              </label>
              <input
                type="range"
                min="5"
                max="95"
                step="5"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {language === 'bn' ? 'আউটপুট ফরম্যাট' : 'Output Format'}
              </label>
              <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setFormat('image/jpeg')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    format === 'image/jpeg' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JPG
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('image/webp')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    format === 'image/webp' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  WebP
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
              >
                {t('reset')}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!compressedBlob || compressing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Download className="w-4 h-4" />
                {t('download')}
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">
                {language === 'bn' ? 'মূল ফাইলের সাইজ' : 'Original Size'}
              </span>
              <span className="text-sm font-bold text-slate-200 font-mono">
                {formatBytes(file.size)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">
                {language === 'bn' ? 'কম্প্রেসড সাইজ' : 'Compressed Size'}
              </span>
              <span className="text-sm font-bold text-indigo-400 font-mono">
                {compressedBlob ? formatBytes(compressedBlob.size) : '...'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-center">
              <span className="text-[11px] text-emerald-400 block mb-0.5">
                {language === 'bn' ? 'সাইজ সেভ' : 'Saved'}
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                {savedPercent}%
              </span>
            </div>
          </div>

          {/* Side-by-side Visual Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="text-xs text-slate-400 mb-2 font-medium flex items-center justify-between">
                <span>{language === 'bn' ? 'আসল ছবি' : 'Original Image'}</span>
                <span className="text-[11px] font-mono">{formatBytes(file.size)}</span>
              </div>
              <div className="aspect-video bg-slate-950/80 rounded-lg overflow-hidden flex items-center justify-center p-2">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Original Preview"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
              <div className="text-xs text-slate-400 mb-2 font-medium flex items-center justify-between">
                <span className="text-indigo-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'bn' ? 'কম্প্রেসড প্রিভিউ' : 'Compressed Preview'}
                </span>
                <span className="text-[11px] font-mono text-indigo-400">
                  {compressedBlob ? formatBytes(compressedBlob.size) : '...'}
                </span>
              </div>
              <div className="aspect-video bg-slate-950/80 rounded-lg overflow-hidden flex items-center justify-center p-2">
                {compressedUrl && !compressing ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed Preview"
                    className="max-h-full max-w-full object-contain rounded"
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
        </div>
      )}
    </div>
  );
};
