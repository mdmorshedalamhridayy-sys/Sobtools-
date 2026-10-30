import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, Layers, ArrowUp, ArrowDown, Trash2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsArrayBuffer } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface UploadedPdf {
  id: string;
  file: File;
  pageCount: number;
}

export const PdfMerge: React.FC = () => {
  const { language, t } = useLanguage();
  const [pdfList, setPdfList] = useState<UploadedPdf[]>([]);
  const [merging, setMerging] = useState<boolean>(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setError(null);
    const newItems: UploadedPdf[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        continue;
      }

      try {
        const buffer = await readFileAsArrayBuffer(file);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          pageCount: doc.getPageCount(),
        });
      } catch (err) {
        console.error('Failed reading PDF:', err);
      }
    }

    if (newItems.length === 0) {
      setError(language === 'bn' ? 'সঠিক পিডিএফ ফাইল নির্বাচন করুন।' : 'Please upload valid PDF files.');
      return;
    }

    setPdfList((prev) => [...prev, ...newItems]);
    setMergedBlob(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...pdfList];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setPdfList(next);
    setMergedBlob(null);
  };

  const moveDown = (index: number) => {
    if (index === pdfList.length - 1) return;
    const next = [...pdfList];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setPdfList(next);
    setMergedBlob(null);
  };

  const removeItem = (id: string) => {
    setPdfList((prev) => prev.filter((item) => item.id !== id));
    setMergedBlob(null);
  };

  const handleMerge = async () => {
    if (pdfList.length < 2) {
      setError(language === 'bn' ? 'মার্জ করতে কমপক্ষে ২টি পিডিএফ যোগ করুন।' : 'Please add at least 2 PDF files to merge.');
      return;
    }

    try {
      setMerging(true);
      setError(null);

      const mergedDoc = await PDFDocument.create();

      for (const item of pdfList) {
        const buffer = await readFileAsArrayBuffer(item.file);
        const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      }

      const mergedPdfBytes = await mergedDoc.save();
      const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setMergedBlob(blob);
    } catch (err: any) {
      console.error('PDF Merge error:', err);
      setError(language === 'bn' ? 'পিডিএফ মার্জ করতে ব্যর্থ হয়েছে। ফাইলগুলো এনক্রিপ্ট বা ক্ষতিগ্রস্ত হতে পারে।' : 'Failed to merge PDFs. One of the documents may be password protected or corrupted.');
    } finally {
      setMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) return;
    downloadBlob(mergedBlob, 'merged-document.pdf');
  };

  const totalPages = pdfList.reduce((acc, curr) => acc + curr.pageCount, 0);

  return (
    <div className="space-y-6">
      {pdfList.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'একাধিক পিডিএফ ফাইল নির্বাচন করুন' : 'Select multiple PDF files to merge'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'ফাইলগুলো ক্রমানুসারে সাজিয়ে একটি পিডিএফ-এ রূপান্তর করুন।'
              : 'Files are merged 100% locally in your browser memory.'}
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
          {/* Top Actions & Summary */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block">{language === 'bn' ? 'ফাইল সংখ্যা ও মোট পৃষ্ঠা:' : 'Total Documents & Pages:'}</span>
              <span className="text-sm font-bold text-slate-200 font-mono">
                {pdfList.length} {language === 'bn' ? 'টি ফাইল' : 'files'} • {totalPages} {language === 'bn' ? 'টি পৃষ্ঠা' : 'pages'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
              >
                + {language === 'bn' ? 'আরও পিডিএফ যোগ করুন' : 'Add More PDFs'}
              </button>
              <button
                type="button"
                onClick={() => setPdfList([])}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {t('clear')}
              </button>
            </div>
          </div>

          {/* List of files with up/down arrows */}
          <div className="space-y-2">
            {pdfList.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate max-w-sm">{item.file.name}</p>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.pageCount} {language === 'bn' ? 'পৃষ্ঠা' : 'pages'} • {formatBytes(item.file.size)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === pdfList.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Merge & Download Action Bar */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              {mergedBlob && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'bn'
                      ? `মার্জ সম্পন্ন! মোট সাইজ: ${formatBytes(mergedBlob.size)}`
                      : `Successfully merged! Total size: ${formatBytes(mergedBlob.size)}`}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!mergedBlob ? (
                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={merging || pdfList.length < 2}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <Layers className="w-4 h-4" />
                  {merging ? t('processing') : language === 'bn' ? 'পিডিএফ মার্জ করুন' : 'Merge PDFs'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <Download className="w-4 h-4" />
                  {language === 'bn' ? 'মার্জ করা ফাইল ডাউনলোড করুন' : 'Download Merged PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
