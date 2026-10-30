import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Crop as CropIcon, RefreshCw } from 'lucide-react';
import { downloadBlob, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const ImageCropper: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aspectPreset, setAspectPreset] = useState<'free' | '1:1' | '16:9' | '4:3'>('free');
  
  // Crop area in % (0 to 100)
  const [cropX, setCropX] = useState<number>(10);
  const [cropY, setCropY] = useState<number>(10);
  const [cropWidth, setCropWidth] = useState<number>(80);
  const [cropHeight, setCropHeight] = useState<number>(80);

  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = await readFileAsDataURL(selected);
      setPreviewUrl(url);
      setCropX(10);
      setCropY(10);
      setCropWidth(80);
      setCropHeight(80);
    }
  };

  const applyPreset = (preset: 'free' | '1:1' | '16:9' | '4:3') => {
    setAspectPreset(preset);
    if (preset === '1:1') {
      const size = Math.min(cropWidth, cropHeight);
      setCropWidth(size);
      setCropHeight(size);
    } else if (preset === '16:9') {
      setCropHeight(Math.round((cropWidth * 9) / 16));
    } else if (preset === '4:3') {
      setCropHeight(Math.round((cropWidth * 3) / 4));
    }
  };

  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const sx = (cropX / 100) * img.naturalWidth;
      const sy = (cropY / 100) * img.naturalHeight;
      const sw = Math.max(1, (cropWidth / 100) * img.naturalWidth);
      const sh = Math.max(1, (cropHeight / 100) * img.naturalHeight);

      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob((blob) => {
        if (!blob) return;
        setCroppedBlob(blob);
        if (croppedUrl) URL.revokeObjectURL(croppedUrl);
        setCroppedUrl(URL.createObjectURL(blob));
      }, 'image/png');
    };
  }, [previewUrl, cropX, cropY, cropWidth, cropHeight]);

  const handleDownload = () => {
    if (!croppedBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'cropped';
    downloadBlob(croppedBlob, `${baseName}-cropped.png`);
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
            <CropIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি নির্বাচন করুন ক্রপ করার জন্য' : 'Select an image to crop'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'নির্দিষ্ট অনুপাত বা ইচ্ছামতো অংশ কেটে পিএনজি হিসেবে সেভ করুন।'
              : 'Choose aspect ratio or custom box and crop.'}
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
          {/* Preset Buttons & Controls */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'অনুপাত (Aspect Ratio):' : 'Aspect Ratio:'}
                </span>
                {(['free', '1:1', '16:9', '4:3'] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      aspectPreset === preset
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {preset.toUpperCase()}
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
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  {t('reset')}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!croppedBlob}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <Download className="w-4 h-4" />
                  {t('download')}
                </button>
              </div>
            </div>

            {/* Range controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">X Offset: {cropX}%</label>
                <input
                  type="range"
                  min="0"
                  max={100 - cropWidth}
                  value={cropX}
                  onChange={(e) => setCropX(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Y Offset: {cropY}%</label>
                <input
                  type="range"
                  min="0"
                  max={100 - cropHeight}
                  value={cropY}
                  onChange={(e) => setCropY(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Width: {cropWidth}%</label>
                <input
                  type="range"
                  min="10"
                  max={100 - cropX}
                  value={cropWidth}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    setCropWidth(w);
                    if (aspectPreset === '1:1') setCropHeight(w);
                    else if (aspectPreset === '16:9') setCropHeight(Math.round((w * 9) / 16));
                    else if (aspectPreset === '4:3') setCropHeight(Math.round((w * 3) / 4));
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Height: {cropHeight}%</label>
                <input
                  type="range"
                  min="10"
                  max={100 - cropY}
                  value={cropHeight}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    setCropHeight(h);
                    if (aspectPreset === '1:1') setCropWidth(h);
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Visual Canvas View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                {language === 'bn' ? 'ক্রপ বক্স সিলেকশন' : 'Selection Window'}
              </span>
              <div className="relative overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center p-2">
                {previewUrl && (
                  <div className="relative inline-block max-h-80">
                    <img
                      ref={imgRef}
                      src={previewUrl}
                      alt="Crop Source"
                      className="max-h-80 object-contain block opacity-50"
                    />
                    <div
                      style={{
                        left: `${cropX}%`,
                        top: `${cropY}%`,
                        width: `${cropWidth}%`,
                        height: `${cropHeight}%`,
                      }}
                      className="absolute border-2 border-indigo-400 bg-indigo-500/20 pointer-events-none shadow-2xl"
                    >
                      <div className="w-full h-full border border-dashed border-white/60 flex items-center justify-center">
                        <span className="text-[10px] text-white bg-indigo-600/80 px-1 rounded font-mono">
                          {cropWidth}% × {cropHeight}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs font-semibold text-indigo-400 block mb-2">
                {language === 'bn' ? 'ক্রপ করা রেজাল্ট' : 'Cropped Result Preview'}
              </span>
              <div className="h-80 rounded-lg bg-slate-950 flex items-center justify-center p-2">
                {croppedUrl ? (
                  <img
                    src={croppedUrl}
                    alt="Cropped output"
                    className="max-h-full max-w-full object-contain rounded shadow"
                  />
                ) : (
                  <span className="text-xs text-slate-500">{t('processing')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
