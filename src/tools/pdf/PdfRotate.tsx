import React, { useState, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { Upload, Download, RotateCw, RotateCcw, FileText, CheckCircle2 } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsArrayBuffer } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const PdfRotate: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [targetScope, setTargetScope] = useState<'all' | 'custom'>('all');
  const [customPages, setCustomPages] = useState<string>('1');
  const [rotating, setRotating] = useState<boolean>(false);
  const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      try {
        const buffer = await readFileAsArrayBuffer(selected);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        setFile(selected);
        setPageCount(doc.getPageCount());
        setRotatedBlob(null);
      } catch (err) {
        console.error('Failed reading PDF', err);
      }
    }
  };

  const handleRotate = async () => {
    if (!file) return;
    try {
      setRotating(true);
      const buffer = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPages();

      let targetIndices: number[] = [];
      if (targetScope === 'all') {
        targetIndices = pages.map((_, i) => i);
      } else {
        targetIndices = customPages
          .split(',')
          .map((p) => parseInt(p.trim(), 10) - 1)
          .filter((i) => !isNaN(i) && i >= 0 && i < pages.length);
      }

      for (const idx of targetIndices) {
        const page = pages[idx];
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + rotationAngle) % 360));
      }

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setRotatedBlob(blob);
    } catch (err) {
      console.error('Rotate error', err);
    } finally {
      setRotating(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(rotatedBlob, `${base}-rotated.pdf`);
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
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <RotateCw className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'পিডিএফ ফাইল নির্বাচন করুন রোটেট করতে' : 'Select a PDF to rotate pages'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? '৯০°, ১৮০° বা ২৭০° কোণে ঘুরিয়ে উল্টো পাতা সোজা করুন।'
              : 'Rotate all or selected pages permanently.'}
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
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-200 block truncate max-w-sm">{file.name}</span>
                <span className="text-xs text-slate-400 font-mono">
                  {pageCount} {language === 'bn' ? 'টি পাতা' : 'pages'} • {formatBytes(file.size)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setRotatedBlob(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              {t('reset')}
            </button>
          </div>

          {/* Controls */}
          <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {language === 'bn' ? 'ঘোরানোর কোণ (Angle)' : 'Rotation Angle'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => {
                        setRotationAngle(deg);
                        setRotatedBlob(null);
                      }}
                      className={`py-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        rotationAngle === deg
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {language === 'bn' ? 'কোন পৃষ্ঠাগুলো রোটেট করবেন?' : 'Apply To'}
                </label>
                <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope('all');
                      setRotatedBlob(null);
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      targetScope === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {language === 'bn' ? 'সব পাতা (All Pages)' : 'All Pages'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetScope('custom');
                      setRotatedBlob(null);
                    }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                      targetScope === 'custom' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {language === 'bn' ? 'নির্দিষ্ট পৃষ্ঠা' : 'Selected Pages'}
                  </button>
                </div>
                {targetScope === 'custom' && (
                  <input
                    type="text"
                    value={customPages}
                    onChange={(e) => {
                      setCustomPages(e.target.value);
                      setRotatedBlob(null);
                    }}
                    placeholder="e.g. 1, 3, 5"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div>
                {rotatedBlob && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {language === 'bn' ? 'রোটেট সফল হয়েছে!' : 'Rotated successfully!'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!rotatedBlob ? (
                  <button
                    type="button"
                    onClick={handleRotate}
                    disabled={rotating}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                  >
                    <RotateCw className="w-4 h-4" />
                    {rotating ? t('processing') : language === 'bn' ? 'রোটেট প্রয়োগ করুন' : 'Apply Rotation'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'bn' ? 'রোটেট করা ফাইল ডাউনলোড' : 'Download Rotated PDF'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
