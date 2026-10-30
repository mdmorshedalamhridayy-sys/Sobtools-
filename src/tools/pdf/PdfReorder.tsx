import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, ArrowUpDown, ArrowUp, ArrowDown, FileText, CheckCircle2 } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsArrayBuffer } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const PdfReorder: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pagesOrder, setPagesOrder] = useState<number[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [reorderedBlob, setReorderedBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      try {
        const buffer = await readFileAsArrayBuffer(selected);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setFile(selected);
        setPagesOrder(Array.from({ length: count }, (_, i) => i + 1));
        setReorderedBlob(null);
      } catch (err) {
        console.error('Failed reading PDF', err);
      }
    }
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pagesOrder.length) return;
    const next = [...pagesOrder];
    const val = next[fromIndex];
    next.splice(fromIndex, 1);
    next.splice(toIndex, 0, val);
    setPagesOrder(next);
    setReorderedBlob(null);
  };

  const reverseOrder = () => {
    setPagesOrder([...pagesOrder].reverse());
    setReorderedBlob(null);
  };

  const resetOriginalOrder = () => {
    setPagesOrder(Array.from({ length: pagesOrder.length }, (_, i) => i + 1));
    setReorderedBlob(null);
  };

  const handleSave = async () => {
    if (!file) return;
    try {
      setSaving(true);
      const buffer = await readFileAsArrayBuffer(file);
      const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();

      // Convert 1-based page numbers to 0-based indices
      const indices = pagesOrder.map((p) => p - 1);
      const copied = await newDoc.copyPages(srcDoc, indices);
      copied.forEach((p) => newDoc.addPage(p));

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setReorderedBlob(blob);
    } catch (err) {
      console.error('Error saving reordered PDF', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (!reorderedBlob || !file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    downloadBlob(reorderedBlob, `${base}-reordered.pdf`);
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
            <ArrowUpDown className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'পিডিএফ নির্বাচন করুন পাতার ক্রম পরিবর্তন করতে' : 'Select a PDF to reorder pages'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'পাতাগুলোর অবস্থান আগে-পিছে সাজান বা উল্টে নিন।'
              : 'Rearrange and resequence pages visually.'}
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
                  {pagesOrder.length} {language === 'bn' ? 'টি পাতা' : 'pages'} • {formatBytes(file.size)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={reverseOrder}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
              >
                {language === 'bn' ? 'সব উল্টে দিন (Reverse)' : 'Reverse All'}
              </button>
              <button
                type="button"
                onClick={resetOriginalOrder}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium"
              >
                {t('reset')}
              </button>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {t('clear')}
              </button>
            </div>
          </div>

          {/* Grid of pages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {pagesOrder.map((pageNum, idx) => (
              <div
                key={`${pageNum}-${idx}`}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono text-[11px] text-slate-500">Pos #{idx + 1}</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs">
                    P{pageNum}
                  </span>
                </div>
                <div className="h-20 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-800/80 mb-2">
                  <span className="text-xs text-slate-300 font-semibold">
                    {language === 'bn' ? `পৃষ্ঠা ${pageNum}` : `Page ${pageNum}`}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => movePage(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => movePage(idx, idx + 1)}
                    disabled={idx === pagesOrder.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    title="Move later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save Action */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              {reorderedBlob && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'bn' ? 'নতুন ক্রমে প্রস্তুত!' : 'Reordered successfully!'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!reorderedBlob ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {saving ? t('processing') : language === 'bn' ? 'নতুন ক্রমে সেভ করুন' : 'Save Reordered PDF'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <Download className="w-4 h-4" />
                  {language === 'bn' ? 'ডাউনলোড করুন' : 'Download PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
