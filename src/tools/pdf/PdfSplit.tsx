import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, Split, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsArrayBuffer } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const PdfSplit: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [splitting, setSplitting] = useState<boolean>(false);
  const [splitBlob, setSplitBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      try {
        const buffer = await readFileAsArrayBuffer(selected);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setFile(selected);
        setPageCount(count);
        setRangeInput(count > 1 ? `1-${Math.min(3, count)}` : '1');
        setError(null);
        setSplitBlob(null);
      } catch (err) {
        setError(language === 'bn' ? 'পিডিএফ ফাইলটি লোড করা যায়নি।' : 'Failed to parse PDF file.');
      }
    }
  };

  // Parses ranges like "1, 3-5, 8" into 0-indexed page indices
  const parseRanges = (input: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    const parts = input.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr.trim(), 10);
        const end = parseInt(endStr.trim(), 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
          throw new Error(`Invalid range: "${trimmed}". Must be between 1 and ${maxPages}.`);
        }
        for (let p = start; p <= end; p++) {
          indices.add(p - 1);
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (isNaN(p) || p < 1 || p > maxPages) {
          throw new Error(`Invalid page: "${trimmed}". Must be between 1 and ${maxPages}.`);
        }
        indices.add(p - 1);
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
    if (!file || pageCount === 0) return;

    try {
      setSplitting(true);
      setError(null);

      const targetIndices = parseRanges(rangeInput, pageCount);
      if (targetIndices.length === 0) {
        throw new Error('Please select at least one page to extract.');
      }

      const buffer = await readFileAsArrayBuffer(file);
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      const copiedPages = await newDoc.copyPages(srcDoc, targetIndices);
      copiedPages.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setSplitBlob(blob);
    } catch (err: any) {
      setError(err.message || 'Error extracting PDF pages.');
    } finally {
      setSplitting(false);
    }
  };

  const handleDownload = () => {
    if (!splitBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(splitBlob, `${base}-extracted.pdf`);
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
            <Split className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'পিডিএফ ফাইল নির্বাচন করুন স্প্লিট করতে' : 'Select a PDF file to split'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'নির্দিষ্ট পৃষ্ঠা আলাদা করে নতুন পিডিএফ ফাইল হিসেবে সেভ করুন।'
              : 'Extract selected pages or ranges into a separate PDF.'}
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
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-200 block truncate max-w-sm">{file.name}</span>
                <span className="text-xs text-slate-400 font-mono">
                  {pageCount} {language === 'bn' ? 'টি পৃষ্ঠা' : 'pages'} • {formatBytes(file.size)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setSplitBlob(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              {t('reset')}
            </button>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                {language === 'bn'
                  ? `যে পৃষ্ঠাগুলো আলাদা করতে চান লিখুন (১ থেকে ${pageCount} এর মধ্যে):`
                  : `Specify page numbers or ranges to extract (between 1 and ${pageCount}):`}
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => {
                  setRangeInput(e.target.value);
                  setSplitBlob(null);
                }}
                placeholder="e.g. 1, 3-5, 8"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {language === 'bn'
                  ? 'উদাহরণ: ১টি পৃষ্ঠার জন্য "2", রেঞ্জের জন্য "1-4", একাধিক রেঞ্জের জন্য "1, 3-5"'
                  : 'Example: Single page "2", range "1-4", or comma separated "1, 3-5"'}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div>
                {splitBlob && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {language === 'bn'
                      ? `পৃষ্ঠা আলাদা করা সম্পন্ন! সাইজ: ${formatBytes(splitBlob.size)}`
                      : `Pages extracted successfully! (${formatBytes(splitBlob.size)})`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!splitBlob ? (
                  <button
                    type="button"
                    onClick={handleSplit}
                    disabled={splitting}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                  >
                    <Split className="w-4 h-4" />
                    {splitting ? t('processing') : language === 'bn' ? 'পৃষ্ঠা আলাদা করুন' : 'Extract Pages'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'bn' ? 'নতুন পিডিএফ ডাউনলোড করুন' : 'Download Extracted PDF'}
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
