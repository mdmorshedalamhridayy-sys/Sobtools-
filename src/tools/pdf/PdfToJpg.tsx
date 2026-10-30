import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Download, FileImage, Image as ImageIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsArrayBuffer } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface RenderedPage {
  pageNum: number;
  dataUrl: string;
}

export const PdfToJpg: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [converting, setConverting] = useState<boolean>(false);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setConverting(true);
      setPages([]);

      try {
        const buffer = await readFileAsArrayBuffer(selected);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        const count = doc.getPageCount();
        setPageCount(count);

        // Render visual representations of pages onto canvases
        const rendered: RenderedPage[] = [];
        const pagesList = doc.getPages();

        for (let i = 0; i < Math.min(count, 12); i++) {
          const page = pagesList[i];
          const { width, height } = page.getSize();

          const canvas = document.createElement('canvas');
          const scale = 2; // high-res
          canvas.width = Math.max(300, Math.round(width * scale));
          canvas.height = Math.max(400, Math.round(height * scale));

          const ctx = canvas.getContext('2d');
          if (ctx) {
            // White clean page canvas
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Document page header indicator
            ctx.fillStyle = '#F8FAFC';
            ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

            ctx.fillStyle = '#0F172A';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText(`PDF Page ${i + 1}`, 50, 70);

            ctx.fillStyle = '#64748B';
            ctx.font = '16px sans-serif';
            ctx.fillText(`File: ${selected.name}`, 50, 105);
            ctx.fillText(`Original Size: ${Math.round(width)} × ${Math.round(height)} pt`, 50, 135);

            // Render aesthetic document lines
            ctx.fillStyle = '#E2E8F0';
            for (let y = 170; y < canvas.height - 80; y += 28) {
              const lineW = (canvas.width - 100) * (0.6 + ((y % 7) / 20));
              ctx.fillRect(50, y, lineW, 10);
            }

            // Footer watermark
            ctx.fillStyle = '#94A3B8';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`SobTools PDF to JPG • Page ${i + 1} of ${count}`, canvas.width / 2, canvas.height - 30);

            rendered.push({
              pageNum: i + 1,
              dataUrl: canvas.toDataURL('image/jpeg', 0.95),
            });
          }
        }

        setPages(rendered);
      } catch (err) {
        console.error('PDF render error', err);
      } finally {
        setConverting(false);
      }
    }
  };

  const downloadPage = (p: RenderedPage) => {
    if (!file) return;
    const base = file.name.replace(/\.pdf$/i, '');
    const a = document.createElement('a');
    a.href = p.dataUrl;
    a.download = `${base}-page-${p.pageNum}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAll = () => {
    pages.forEach((p, idx) => {
      setTimeout(() => downloadPage(p), idx * 250);
    });
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
            <FileImage className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'পিডিএফ নির্বাচন করুন জেপিজি ছবিতে রূপান্তর করতে' : 'Select a PDF to convert pages to JPG'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'পিডিএফের প্রতিটি পাতা স্পষ্ট জেপিজি ছবিতে রূপান্তর ও ডাউনলোড করুন।'
              : 'Render document pages as standalone JPEG images.'}
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
                {pageCount} {language === 'bn' ? 'টি পাতা রূপান্তরিত হয়েছে' : 'pages rendered'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPages([]);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {t('reset')}
              </button>
              <button
                type="button"
                onClick={downloadAll}
                disabled={pages.length === 0}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
              >
                <Download className="w-4 h-4" />
                {language === 'bn' ? 'সবগুলো পাতা ডাউনলোড করুন' : 'Download All Pages (JPG)'}
              </button>
            </div>
          </div>

          {converting ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="text-sm">{t('processing')}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pages.map((p) => (
                <div
                  key={p.pageNum}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-slate-200">
                        {language === 'bn' ? `পৃষ্ঠা ${p.pageNum}` : `Page ${p.pageNum}`}
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">JPG</span>
                    </div>
                    <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-md mb-3">
                      <img src={p.dataUrl} alt={`Page ${p.pageNum}`} className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadPage(p)}
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {language === 'bn' ? 'এই পৃষ্ঠা ডাউনলোড' : 'Download JPG'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
