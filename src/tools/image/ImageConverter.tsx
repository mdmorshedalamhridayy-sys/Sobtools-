import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, ArrowRight } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const ImageConverter: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [converting, setConverting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = await readFileAsDataURL(selected);
      setPreviewUrl(url);

      // Default target to something different from original
      if (selected.type === 'image/png') setTargetFormat('jpeg');
      else if (selected.type === 'image/jpeg') setTargetFormat('webp');
      else setTargetFormat('png');
    }
  };

  useEffect(() => {
    if (!previewUrl) return;

    let isMounted = true;
    setConverting(true);

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (targetFormat === 'jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeType =
        targetFormat === 'jpeg' ? 'image/jpeg' : targetFormat === 'webp' ? 'image/webp' : 'image/png';

      canvas.toBlob((blob) => {
        if (!isMounted || !blob) return;
        setConvertedBlob(blob);
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        setConvertedUrl(URL.createObjectURL(blob));
        setConverting(false);
      }, mimeType, 0.92);
    };

    return () => {
      isMounted = false;
    };
  }, [previewUrl, targetFormat]);

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'converted';
    const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
    downloadBlob(convertedBlob, `${baseName}.${ext}`);
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
            <RefreshCw className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি আপলোড করুন কনভার্ট করতে' : 'Upload an image to convert'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'PNG, JPG, WebP ইত্যাদি ফরম্যাটের মাঝে সহজে রূপান্তর করুন।'
              : 'Convert between PNG, JPEG, and WebP formats.'}
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
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">
                {language === 'bn' ? 'টার্গেট ফরম্যাট:' : 'Target Format:'}
              </span>
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setTargetFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase border transition-all ${
                    targetFormat === fmt
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {t('reset')}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!convertedBlob || converting}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <Download className="w-4 h-4" />
                {t('download')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
              <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
                <span>{language === 'bn' ? 'আসল ফরম্যাট' : 'Original Format'}</span>
                <span className="font-mono text-slate-300">{formatBytes(file.size)}</span>
              </div>
              <div className="h-64 bg-slate-950/80 rounded-lg flex items-center justify-center p-2">
                {previewUrl && (
                  <img src={previewUrl} alt="Original" className="max-h-full max-w-full object-contain" />
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
              <div className="text-xs text-indigo-400 mb-2 flex items-center justify-between font-semibold">
                <span>{language === 'bn' ? `কনভার্টেড (${targetFormat.toUpperCase()})` : `Converted (${targetFormat.toUpperCase()})`}</span>
                <span className="font-mono text-indigo-300">
                  {convertedBlob ? formatBytes(convertedBlob.size) : '...'}
                </span>
              </div>
              <div className="h-64 bg-slate-950/80 rounded-lg flex items-center justify-center p-2">
                {convertedUrl && !converting ? (
                  <img src={convertedUrl} alt="Converted" className="max-h-full max-w-full object-contain" />
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
