import React, { useState, useRef } from 'react';
import { Upload, Info, FileImage, Calendar, HardDrive, Maximize, Eye } from 'lucide-react';
import { formatBytes, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface ImageMeta {
  name: string;
  size: number;
  type: string;
  lastModified: string;
  width: number;
  height: number;
  aspectRatio: string;
  megapixels: string;
}

export const ImageMetadataViewer: React.FC = () => {
  const { language, t } = useLanguage();
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = await readFileAsDataURL(file);
      setPreviewUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        const mp = ((img.naturalWidth * img.naturalHeight) / 1000000).toFixed(2);
        // gcd for aspect ratio
        const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
        const divisor = gcd(img.naturalWidth, img.naturalHeight);
        const ratio = `${img.naturalWidth / divisor}:${img.naturalHeight / divisor}`;

        setMeta({
          name: file.name,
          size: file.size,
          type: file.type || 'Unknown image format',
          lastModified: new Date(file.lastModified).toLocaleString(),
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: ratio,
          megapixels: `${mp} MP`,
        });
      };
    }
  };

  return (
    <div className="space-y-6">
      {!meta ? (
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
            <Info className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি নির্বাচন করুন মেটাডেটা দেখতে' : 'Select an image to inspect metadata'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'ফাইলের সাইজ, রেজোলিউশন, মেগাপিক্সেল ও ফরম্যাট বিশ্লেষণ করুন।'
              : 'View resolution, megapixels, dimensions, and file parameters.'}
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
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-200">
              {language === 'bn' ? 'ছবির মেটাডেটা বিশ্লেষণ:' : 'Image Properties & Metadata:'}
            </h3>
            <button
              type="button"
              onClick={() => {
                setMeta(null);
                setPreviewUrl(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              {language === 'bn' ? 'অন্য ছবি পরীক্ষা করুন' : 'Inspect Another Image'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Visual Preview */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="h-72 bg-slate-950 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                {previewUrl && (
                  <img src={previewUrl} alt="Metadata Preview" className="max-h-full max-w-full object-contain rounded" />
                )}
              </div>
              <p className="text-xs text-slate-400 text-center mt-3 truncate font-mono">{meta.name}</p>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Maximize className="w-3.5 h-3.5 text-indigo-400" />
                  {language === 'bn' ? 'রেজোলিউশন (W × H)' : 'Dimensions'}
                </span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {meta.width} × {meta.height} px
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  {language === 'bn' ? 'মেগাপিক্সেল' : 'Megapixels'}
                </span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {meta.megapixels}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'bn' ? 'ফাইলের আকার' : 'File Size'}
                </span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {formatBytes(meta.size)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <FileImage className="w-3.5 h-3.5 text-purple-400" />
                  {language === 'bn' ? 'মডেল / ফরম্যাট' : 'MIME Type'}
                </span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {meta.type}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 mb-1 block">
                  {language === 'bn' ? 'অনুপাত (Aspect Ratio)' : 'Aspect Ratio'}
                </span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {meta.aspectRatio}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'bn' ? 'সর্বশেষ পরিবর্তন' : 'Modified'}
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate block">
                  {meta.lastModified}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
