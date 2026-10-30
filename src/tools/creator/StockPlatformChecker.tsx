import React, { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck,
  Maximize2,
  HardDrive,
  Info,
  Sparkles
} from 'lucide-react';
import { formatBytes, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface PlatformSpec {
  name: string;
  minMp: number;
  maxMp: number;
  minDim: number;
  maxDim: number;
  maxMb: number;
  supportedFormats: string[];
  colorSpace: string;
  notes: { en: string; bn: string };
}

const platforms: PlatformSpec[] = [
  {
    name: 'Adobe Stock',
    minMp: 4.0,
    maxMp: 100.0,
    minDim: 1500,
    maxDim: 15000,
    maxMb: 45,
    supportedFormats: ['JPEG', 'AI', 'EPS', 'SVG'],
    colorSpace: 'sRGB / RGB',
    notes: {
      en: 'Requires minimum 4 Megapixels (e.g. 2000×2000 px). Max 100 MP. Max file size 45MB. Vectors must be saved in AI or EPS format with matching JPG preview.',
      bn: 'ন্যূনতম ৪ মেগাপিক্সেল (যেমন: ২০০০×২০০০ পিক্সেল) আবশ্যক। সর্বোচ্চ ১০০ এমপি এবং ৪৫ মেগাবাইট। ভেক্টরের জন্য এআই বা ইপিএস ফাইল গ্রহণযোগ্য।',
    },
  },
  {
    name: 'Dreamstime',
    minMp: 3.0,
    maxMp: 100.0,
    minDim: 1200,
    maxDim: 12000,
    maxMb: 70,
    supportedFormats: ['JPEG', 'EPS', 'RAW', 'TIFF'],
    colorSpace: 'RGB 8-bit',
    notes: {
      en: 'Minimum 3 Megapixels (approx. 2048×1536 px). Maximum 70 MB file size. Requires at least 5-word title and description, and 10+ keywords.',
      bn: 'ন্যূনতম ৩ মেগাপিক্সেল এবং সর্বোচ্চ ৭০ মেগাবাইট। কমপক্ষে ৫ শব্দের টাইটেল ও বিবরণ এবং ১০টির বেশি কীওয়ার্ড আবশ্যক।',
    },
  },
  {
    name: 'Shutterstock',
    minMp: 4.0,
    maxMp: 100.0,
    minDim: 1500,
    maxDim: 15000,
    maxMb: 50,
    supportedFormats: ['JPEG', 'EPS (v8/v10)'],
    colorSpace: 'sRGB',
    notes: {
      en: 'Minimum 4 Megapixels. EPS files must be EPS 8 or 10 compatible and accompanied by a JPEG preview of at least 4 MP.',
      bn: 'ন্যূনতম ৪ মেগাপিক্সেল। ইপিএস ফাইল ৮ বা ১০ ভার্সনে সেভ করতে হবে এবং সাথে ন্যূনতম ৪ মেগাপিক্সেলের জেপিজি প্রিভিউ থাকতে হবে।',
    },
  },
  {
    name: 'Freepik',
    minMp: 4.0,
    maxMp: 100.0,
    minDim: 2000,
    maxDim: 10000,
    maxMb: 80,
    supportedFormats: ['EPS + JPG', 'PSD', 'AI'],
    colorSpace: 'RGB',
    notes: {
      en: 'Preview JPEG must have minimum 2000 px and maximum 10000 px on any side. File size between 0.5 MB and 80 MB. Both EPS and JPG must have identical file names.',
      bn: 'প্রিভিউ ছবির দৈর্ঘ্য/প্রস্থ ন্যূনতম ২০০০ পিক্সেল এবং সর্বোচ্চ ১০০০০ পিক্সেল হতে হবে। ফাইল সাইজ ০.৫ মেগাবাইট থেকে ৮০ মেগাবাইট।',
    },
  },
  {
    name: 'Vecteezy',
    minMp: 4.0,
    maxMp: 80.0,
    minDim: 1920,
    maxDim: 12000,
    maxMb: 50,
    supportedFormats: ['EPS', 'AI', 'JPG'],
    colorSpace: 'sRGB',
    notes: {
      en: 'Requires minimum 4 MP JPEG preview for vectors. Fonts must be outlined and live text converted to shapes.',
      bn: 'ভেক্টরের জন্য ন্যূনতম ৪ এমপি প্রিভিউ ছবি। ফন্ট আউটলাইন করা থাকতে হবে।',
    },
  },
  {
    name: 'Creative Fabrica',
    minMp: 2.0,
    maxMp: 150.0,
    minDim: 1000,
    maxDim: 20000,
    maxMb: 500,
    supportedFormats: ['ZIP', 'PNG', 'SVG', 'EPS', 'DXF'],
    colorSpace: 'RGB / CMYK (for print)',
    notes: {
      en: 'High flexibility for bundles, fonts, and crafting SVG files. High resolution (300 DPI recommended for printable assets).',
      bn: 'বান্ডেল, এসভিজি ও ফন্টের জন্য অত্যন্ত উপযোগী। প্রিন্ট ফাইলের জন্য ৩০০ ডিপিআই বাঞ্ছনীয়।',
    },
  },
  {
    name: 'Etsy (Digital Downloads)',
    minMp: 2.0,
    maxMp: 100.0,
    minDim: 2000,
    maxDim: 15000,
    maxMb: 20,
    supportedFormats: ['PDF', 'JPG', 'PNG', 'ZIP'],
    colorSpace: 'sRGB / CMYK',
    notes: {
      en: 'Individual files uploaded to Etsy have a maximum 20MB limit per file. Best to package large vector packs in a ZIP or hosted PDF link.',
      bn: 'প্রতিটি ডিজিটাল ফাইলের সর্বোচ্চ সাইজ ২০ মেগাবাইট। বড় ফাইলের জন্য জিপ বা গুগল ড্রাইভ লিংক পিডিএফ ব্যবহার করা হয়।',
    },
  },
];

export const StockPlatformChecker: React.FC = () => {
  const { language, t } = useLanguage();
  const [width, setWidth] = useState<number>(4000);
  const [height, setHeight] = useState<number>(3000);
  const [fileSizeMb, setFileSizeMb] = useState<number>(6.5);
  const [fileName, setFileName] = useState<string>('vector-design-preview.jpg');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFileName(selected.name);
      setFileSizeMb(parseFloat((selected.size / (1024 * 1024)).toFixed(2)));

      const url = await readFileAsDataURL(selected);
      setPreviewUrl(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
    }
  };

  const totalPixels = width * height;
  const megapixels = parseFloat((totalPixels / 1000000).toFixed(2));
  const shortestSide = Math.min(width, height);
  const longestSide = Math.max(width, height);

  // Aspect ratio calculation
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const div = gcd(width, height);
  const ratioStr = div > 0 ? `${width / div}:${height / div}` : 'Unknown';

  const checkPlatform = (spec: PlatformSpec) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Megapixels
    if (megapixels < spec.minMp) {
      errors.push(`Under minimum ${spec.minMp} MP requirement (Current: ${megapixels} MP)`);
    } else if (megapixels > spec.maxMp) {
      errors.push(`Exceeds maximum ${spec.maxMp} MP limit (Current: ${megapixels} MP)`);
    }

    // Dimensions
    if (shortestSide < spec.minDim) {
      warnings.push(`Shortest side (${shortestSide}px) is close to or below recommended minimum (${spec.minDim}px)`);
    }

    // File size
    if (fileSizeMb > spec.maxMb) {
      errors.push(`File size (${fileSizeMb} MB) exceeds maximum allowed ${spec.maxMb} MB`);
    }

    return {
      status: errors.length === 0 ? (warnings.length === 0 ? 'pass' : 'warning') : 'fail',
      errors,
      warnings,
    };
  };

  return (
    <div className="space-y-6">
      {/* Upload or Manual Specs Input */}
      <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-400" />
            {language === 'bn' ? 'ছবি আপলোড করুন বা মাপ লিখুন:' : 'Inspect Image or Enter Dimensions:'}
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            {language === 'bn' ? 'ছবি নির্বাচন করুন' : 'Upload Image'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Width (px)</label>
            <input
              type="number"
              value={width || ''}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Height (px)</label>
            <input
              type="number"
              value={height || ''}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">File Size (MB)</label>
            <input
              type="number"
              step="0.1"
              value={fileSizeMb || ''}
              onChange={(e) => setFileSizeMb(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Calculated MP</label>
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400 font-bold">
              {megapixels} MP ({ratioStr})
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Megapixels</span>
          <span className={`text-xl font-bold font-mono ${megapixels >= 4 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {megapixels} MP
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Dimensions</span>
          <span className="text-sm font-bold font-mono text-slate-200">
            {width} × {height}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">File Size</span>
          <span className="text-sm font-bold font-mono text-indigo-400">
            {fileSizeMb} MB
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-0.5">Aspect Ratio</span>
          <span className="text-sm font-bold font-mono text-cyan-400">
            {ratioStr}
          </span>
        </div>
      </div>

      {/* Platform Comparison List */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-300 block">
          {language === 'bn'
            ? 'ডিজাইন সেলিং প্ল্যাটফর্মের স্পেসিফিকেশন ও অনুমোদনের সম্ভাবনা:'
            : 'Platform Compatibility Evaluation:'}
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((spec) => {
            const check = checkPlatform(spec);
            return (
              <div
                key={spec.name}
                className={`p-4 rounded-2xl border transition-all ${
                  check.status === 'pass'
                    ? 'bg-slate-950/60 border-emerald-900/40'
                    : check.status === 'warning'
                    ? 'bg-slate-950/60 border-amber-900/40'
                    : 'bg-slate-950/60 border-rose-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    {spec.name}
                  </h3>
                  {check.status === 'pass' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved Spec
                    </span>
                  )}
                  {check.status === 'warning' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3 h-3" />
                      Borderline
                    </span>
                  )}
                  {check.status === 'fail' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <XCircle className="w-3 h-3" />
                      Will Reject
                    </span>
                  )}
                </div>

                {/* Requirements metrics */}
                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/70 p-2 rounded-lg mb-2">
                  <div>
                    <span className="block text-slate-500">Min MP:</span>
                    <span className="text-slate-200 font-bold">{spec.minMp} MP</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Max Size:</span>
                    <span className="text-slate-200 font-bold">{spec.maxMb} MB</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Color:</span>
                    <span className="text-slate-200 font-bold truncate">{spec.colorSpace}</span>
                  </div>
                </div>

                {/* Feedback Messages */}
                {check.errors.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {check.errors.map((err, idx) => (
                      <p key={idx} className="text-[11px] text-rose-400 flex items-center gap-1">
                        • {err}
                      </p>
                    ))}
                  </div>
                )}

                {check.warnings.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {check.warnings.map((warn, idx) => (
                      <p key={idx} className="text-[11px] text-amber-400 flex items-center gap-1">
                        • {warn}
                      </p>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-800/80">
                  {spec.notes[language]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
