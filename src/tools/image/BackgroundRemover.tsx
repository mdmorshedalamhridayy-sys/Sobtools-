import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Eraser, Pipette, Sliders, CheckCircle2, Info } from 'lucide-react';
import { downloadBlob, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const BackgroundRemover: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState<number>(35);
  const [smoothness, setSmoothness] = useState<number>(10);
  const [keyColor, setKeyColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [hexColor, setHexColor] = useState<string>('#FFFFFF');
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const url = await readFileAsDataURL(selected);
      setPreviewUrl(url);

      // Auto detect top-left pixel as default background color
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = img.naturalWidth;
        testCanvas.height = img.naturalHeight;
        const ctx = testCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const p = ctx.getImageData(0, 0, 1, 1).data;
          setKeyColor({ r: p[0], g: p[1], b: p[2] });
          const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1).toUpperCase()}`;
          setHexColor(hex);
        }
      };
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

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      const targetR = keyColor.r;
      const targetG = keyColor.g;
      const targetB = keyColor.b;
      const tolDist = (tolerance / 100) * 441.67; // max distance in 3D RGB space is sqrt(255^2*3) = 441.67
      const smoothDist = (smoothness / 100) * 100;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance
        const dist = Math.sqrt(
          (r - targetR) * (r - targetR) +
          (g - targetG) * (g - targetG) +
          (b - targetB) * (b - targetB)
        );

        if (dist < tolDist) {
          // Transparent
          data[i + 3] = 0;
        } else if (dist < tolDist + smoothDist) {
          // Anti-aliased edge smoothing
          const alphaFactor = (dist - tolDist) / smoothDist;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        setResultBlob(blob);
        if (resultUrl) URL.revokeObjectURL(resultUrl);
        setResultUrl(URL.createObjectURL(blob));
      }, 'image/png');
    };
  }, [previewUrl, tolerance, smoothness, keyColor]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Redraw fresh original to sample exact source color
    const img = new Image();
    img.src = previewUrl!;
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      if (!tCtx) return;
      tCtx.drawImage(img, 0, 0);
      const p = tCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      setKeyColor({ r: p[0], g: p[1], b: p[2] });
      const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1).toUpperCase()}`;
      setHexColor(hex);
      setIsEyedropperActive(false);
    };
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
    downloadBlob(resultBlob, `${baseName}-transparent.png`);
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
            <Eraser className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবি আপলোড করুন ব্যাকগ্রাউন্ড মোছার জন্য' : 'Upload image to remove background'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'লোগো, স্বাক্ষর ও সলিড কালার ব্যাকগ্রাউন্ড ব্রাউজারেই মুছে স্বচ্ছ পিএনজি তৈরি করুন।'
              : 'Local high-contrast & chroma algorithm. Ideal for signatures, graphics, and plain backgrounds.'}
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
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-300">
                  {language === 'bn' ? 'ব্যাকগ্রাউন্ড রং:' : 'Target BG Color:'}
                </span>
                <div
                  style={{ backgroundColor: hexColor }}
                  className="w-7 h-7 rounded-lg border border-slate-600 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isEyedropperActive
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Pipette className="w-3.5 h-3.5" />
                  {isEyedropperActive
                    ? language === 'bn' ? 'ছবির ওপর ক্লিক করুন...' : 'Click on image...'
                    : language === 'bn' ? 'আইড্রপার দিয়ে রং বাছাই' : 'Pick from Image'}
                </button>
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
                  disabled={!resultBlob}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <Download className="w-4 h-4" />
                  {t('download')} (PNG)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold flex items-center justify-between mb-1">
                  <span>{language === 'bn' ? 'কালার টলারেন্স (টানলে বেশি ব্যাকগ্রাউন্ড মুছবে):' : 'Tolerance (Distance threshold):'}</span>
                  <span className="text-indigo-400 font-mono font-bold">{tolerance}%</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold flex items-center justify-between mb-1">
                  <span>{language === 'bn' ? 'এজ স্মুথনেস (মসৃণ বর্ডার):' : 'Edge Smoothness:'}</span>
                  <span className="text-indigo-400 font-mono font-bold">{smoothness}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={smoothness}
                  onChange={(e) => setSmoothness(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Canvas Preview with Transparency Checkerboard */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-3">
              {language === 'bn'
                ? 'স্বচ্ছ প্রিভিউ (চেকারবোর্ড প্যাটার্ন মানে ব্যাকগ্রাউন্ড রিমুভ হয়েছে):'
                : 'Live Transparent Result (Checkerboard indicates transparent area):'}
            </span>
            <div
              style={{
                backgroundImage: `linear-gradient(45deg, #1e293b 25%, transparent 25%),
                  linear-gradient(-45deg, #1e293b 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #1e293b 75%),
                  linear-gradient(-45deg, transparent 75%, #1e293b 75%)`,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#0f172a',
              }}
              className="max-h-[500px] overflow-auto rounded-lg p-4 flex justify-center border border-slate-800"
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`max-w-full max-h-[460px] object-contain rounded ${
                  isEyedropperActive ? 'cursor-crosshair ring-2 ring-amber-400' : ''
                }`}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              {language === 'bn'
                ? 'সতর্কতা ও স্বচ্ছতা: এই লোকাল টুলটি উচ্চ-কন্ট্রাস্ট ও সলিড কালার ব্যাকগ্রাউন্ডের জন্য ১০০% ক্লায়েন্ট-সাইডে কাজ করে। জটিল স্টুডিও পোর্ট্রেট ছবির জন্য কোনো ফেক সিমুলেশন করা হয় না।'
                : 'Note & Transparency: This tool uses genuine client-side RGB color distance tolerance without server streaming. Best suited for logos, graphics, signatures, and studio photos with even backdrops.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
