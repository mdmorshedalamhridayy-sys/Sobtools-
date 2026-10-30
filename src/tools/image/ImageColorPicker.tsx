import React, { useState, useRef, useEffect } from 'react';
import { Upload, Pipette, Copy, Check, Palette } from 'lucide-react';
import { readFileAsDataURL, copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const ImageColorPicker: React.FC = () => {
  const { language, t } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedHex, setSelectedHex] = useState<string>('#6366F1');
  const [selectedRgb, setSelectedRgb] = useState<string>('rgb(99, 102, 241)');
  const [palette, setPalette] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await readFileAsDataURL(e.target.files[0]);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    if (!previewUrl) return;

    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      // Extract dominant palette colors
      const extracted: string[] = [];
      const stepX = Math.floor(canvas.width / 4);
      const stepY = Math.floor(canvas.height / 3);

      for (let y = stepY / 2; y < canvas.height && extracted.length < 6; y += stepY) {
        for (let x = stepX / 2; x < canvas.width && extracted.length < 6; x += stepX) {
          const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
          const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
          if (!extracted.includes(hex)) extracted.push(hex);
        }
      }
      setPalette(extracted);
    };
  }, [previewUrl]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
    setSelectedHex(hex);
    setSelectedRgb(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`);
  };

  const handleCopy = async (val: string, key: string) => {
    await copyToClipboard(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {!previewUrl ? (
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
            <Pipette className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি নির্বাচন করুন কালার পিক করার জন্য' : 'Select an image to pick colors'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'ছবির যেকোনো স্থানে ক্লিক করে হেক্স ও আরজিবি কোড জানুন।'
              : 'Click anywhere on the image to inspect HEX, RGB, and extract palette.'}
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
          {/* Active Color Info Panel */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: selectedHex }}
                className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-inner"
              />
              <div>
                <span className="text-xs text-slate-400 block">{language === 'bn' ? 'নির্বাচিত রং' : 'Picked Color'}</span>
                <span className="text-sm font-bold font-mono text-slate-100">{selectedHex}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(selectedHex, 'hex')}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-2"
              >
                {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                HEX: {selectedHex}
              </button>
              <button
                type="button"
                onClick={() => handleCopy(selectedRgb, 'rgb')}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center justify-center gap-2"
              >
                {copiedKey === 'rgb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                RGB
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setPalette([]);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {language === 'bn' ? 'নতুন ছবি নির্বাচন' : 'Change Image'}
              </button>
            </div>
          </div>

          {/* Extracted Palette */}
          {palette.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 block mb-3 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-400" />
                {language === 'bn' ? 'ছবির প্রধান রঙের প্যালেট (ক্লিক করে কপি করুন):' : 'Dominant Color Palette (Click to pick & copy):'}
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {palette.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedHex(color);
                      handleCopy(color, `pal-${idx}`);
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-center group transition-all"
                  >
                    <div
                      style={{ backgroundColor: color }}
                      className="w-full h-10 rounded-lg mb-1.5 shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[11px] font-mono text-slate-300 block">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Canvas */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-3">
              {language === 'bn'
                ? '👆 ছবির যেকোনো অংশে ক্লিক করুন কালার সিলেক্ট করতে'
                : '👆 Click anywhere on the image below to inspect pixel color'}
            </span>
            <div className="max-h-[500px] overflow-auto rounded-lg bg-slate-950 border border-slate-800 p-2 flex justify-center">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="cursor-crosshair max-w-full max-h-[460px] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
