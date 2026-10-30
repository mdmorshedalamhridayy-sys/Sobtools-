import React, { useState, useRef } from 'react';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { Upload, Download, FileInput, ArrowUp, ArrowDown, Trash2, CheckCircle2 } from 'lucide-react';
import { formatBytes, downloadBlob, readFileAsArrayBuffer, readFileAsDataURL } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface UploadedImg {
  id: string;
  file: File;
  previewUrl: string;
}

export const JpgToPdf: React.FC = () => {
  const { language, t } = useLanguage();
  const [images, setImages] = useState<UploadedImg[]>([]);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [generating, setGenerating] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const newItems: UploadedImg[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const previewUrl = await readFileAsDataURL(file);
      newItems.push({
        id: `${file.name}-${Date.now()}-${i}`,
        file,
        previewUrl,
      });
    }
    setImages((prev) => [...prev, ...newItems]);
    setPdfBlob(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    setImages(next);
    setPdfBlob(null);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    setImages(next);
    setPdfBlob(null);
  };

  const removeImg = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    setPdfBlob(null);
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    try {
      setGenerating(true);
      const pdfDoc = await PDFDocument.create();

      for (const item of images) {
        const buffer = await readFileAsArrayBuffer(item.file);
        let embeddedImage;
        if (item.file.type === 'image/png') {
          embeddedImage = await pdfDoc.embedPng(buffer);
        } else {
          // Standard JPEG
          embeddedImage = await pdfDoc.embedJpg(buffer);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = PageSizes.A4[0];
        let pageHeight = PageSizes.A4[1];

        if (pageSize === 'letter') {
          pageWidth = PageSizes.Letter[0];
          pageHeight = PageSizes.Letter[1];
        } else if (pageSize === 'fit') {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        }

        if (orientation === 'landscape' && pageSize !== 'fit') {
          const temp = pageWidth;
          pageWidth = pageHeight;
          pageHeight = temp;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        if (pageSize === 'fit') {
          page.drawImage(embeddedImage, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        } else {
          // Scale to fit margins
          const margin = 30;
          const availableW = pageWidth - margin * 2;
          const availableH = pageHeight - margin * 2;
          const scale = Math.min(availableW / imgWidth, availableH / imgHeight);

          const finalW = imgWidth * scale;
          const finalH = imgHeight * scale;
          const x = (pageWidth - finalW) / 2;
          const y = (pageHeight - finalH) / 2;

          page.drawImage(embeddedImage, {
            x,
            y,
            width: finalW,
            height: finalH,
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setPdfBlob(blob);
    } catch (err) {
      console.error('Image to PDF error', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    downloadBlob(pdfBlob, 'converted-images.pdf');
  };

  return (
    <div className="space-y-6">
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-900/60 transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <FileInput className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'ছবিগুলো নির্বাচন করুন পিডিএফ বানাতে' : 'Select images to create a PDF'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'JPG এবং PNG ছবি সাজিয়ে একটি গোছানো পিডিএফ ডকুমেন্ট তৈরি করুন।'
              : 'Combine multiple photos into an A4/Letter size document.'}
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
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {language === 'bn' ? 'পৃষ্ঠার সাইজ' : 'Page Size'}
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value as any);
                  setPdfBlob(null);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                <option value="a4">A4 (Standard Document)</option>
                <option value="letter">Letter</option>
                <option value="fit">Fit Image Dimensions (No Border)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {language === 'bn' ? 'ওরিয়েন্টেশন' : 'Orientation'}
              </label>
              <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setOrientation('portrait');
                    setPdfBlob(null);
                  }}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                    orientation === 'portrait' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrientation('landscape');
                    setPdfBlob(null);
                  }}
                  className={`flex-1 py-1 text-xs font-medium rounded-md transition-all ${
                    orientation === 'landscape' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
              >
                + {language === 'bn' ? 'ছবি যোগ' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setImages([])}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {t('clear')}
              </button>
            </div>
          </div>

          {/* Image List */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-mono text-indigo-400 font-bold">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeImg(img.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center mb-2">
                    <img src={img.previewUrl} alt={img.file.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 truncate max-w-[80px] font-mono">
                    {formatBytes(img.file.size)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(idx)}
                      disabled={idx === images.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              {pdfBlob && (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'bn'
                    ? `পিডিএফ প্রস্তুত! মোট সাইজ: ${formatBytes(pdfBlob.size)}`
                    : `PDF successfully generated! (${formatBytes(pdfBlob.size)})`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!pdfBlob ? (
                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  disabled={generating}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                >
                  <FileInput className="w-4 h-4" />
                  {generating ? t('processing') : language === 'bn' ? 'পিডিএফ তৈরি করুন' : 'Generate PDF'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/25"
                >
                  <Download className="w-4 h-4" />
                  {language === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download PDF'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
