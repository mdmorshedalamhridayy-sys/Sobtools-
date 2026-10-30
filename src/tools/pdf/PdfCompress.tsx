import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, FileArchive, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsArrayBuffer } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const PdfCompress: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setCompressedBlob(null);

      try {
        const buffer = await readFileAsArrayBuffer(selected);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        setPageCount(doc.getPageCount());
      } catch (err) {
        console.error('Error reading PDF', err);
      }
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    try {
      setCompressing(true);
      const buffer = await readFileAsArrayBuffer(file);
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Create new clean doc and copy all pages
      const optDoc = await PDFDocument.create();
      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await optDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((p) => optDoc.addPage(p));

      // Save with maximum stream compression and object stream consolidation
      const compressedBytes = await optDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const blob = new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' });
      setCompressedBlob(blob);
    } catch (err) {
      console.error('Compression error', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(compressedBlob, `${base}-compressed.pdf`);
  };

  const savedSize = file && compressedBlob ? file.size - compressedBlob.size : 0;
  const savedPercent = file && compressedBlob ? Math.round((savedSize / file.size) * 100) : 0;

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
            <FileArchive className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'পিডিএফ ফাইল নির্বাচন করুন সাইজ কমাতে' : 'Select a PDF to compress & optimize'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'অপ্রয়োজনীয় ডেটা ও স্ট্রিম ক্লিন করে সম্পূর্ণ লোকালি অপটিমাইজ করুন।'
              : 'Strips redundant objects and compacts stream tables locally.'}
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
            <div>
              <span className="text-xs text-slate-400 block">{file.name}</span>
              <span className="text-sm font-bold text-slate-200 font-mono">
                {pageCount} {language === 'bn' ? 'টি পাতা' : 'pages'} • {formatBytes(file.size)}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setCompressedBlob(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              {t('reset')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">
                {language === 'bn' ? 'আসল সাইজ' : 'Original Size'}
              </span>
              <span className="text-base font-bold font-mono text-slate-100">
                {formatBytes(file.size)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">
                {language === 'bn' ? 'অপটিমাইজড সাইজ' : 'Optimized Size'}
              </span>
              <span className="text-base font-bold font-mono text-indigo-400">
                {compressedBlob ? formatBytes(compressedBlob.size) : '...'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/50 text-center">
              <span className="text-xs text-emerald-400 block mb-1">
                {language === 'bn' ? 'সাইজ সেভ' : 'Size Reduction'}
              </span>
              <span className="text-base font-bold font-mono text-emerald-400">
                {compressedBlob ? `${Math.max(0, savedPercent)}%` : 'Ready'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-300 mb-1">
                {language === 'bn' ? 'সতর্কতা ও স্বচ্ছ নির্দেশনা:' : 'Technical Transparency Note:'}
              </p>
              <p className="leading-relaxed">
                {language === 'bn'
                  ? 'এই ব্রাউজার-ভিত্তিক টুলটি অতিরিক্ত মেটাডেটা, অব্যবহৃত অবজেক্ট টেবিল এবং আনকম্প্রেসড স্ট্রিম ক্লিন করে। যদি আপনার পিডিএফ ইতিমধ্যে সর্বোচ্চ কম্প্রেসড বা শুধুমাত্র ভেক্টর টেক্সট হয়, তবে সাইজ উল্লেখযোগ্য না কমতে পারে।'
                  : 'This client-side compressor cleans unreferenced PDF structural objects and consolidates stream tables without server upload. PDFs with already high-density compression or vector-only text will see limited reduction.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              {compressedBlob && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'bn' ? 'কম্প্রেশন সম্পন্ন!' : 'Optimization Complete!'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!compressedBlob ? (
                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={compressing}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <FileArchive className="w-4 h-4" />
                  {compressing ? t('processing') : language === 'bn' ? 'কম্প্রেস করুন' : 'Compress PDF'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <Download className="w-4 h-4" />
                  {language === 'bn' ? 'কম্প্রেসড ফাইল ডাউনলোড' : 'Download Compressed PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
