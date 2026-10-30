import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, FileSearch, HardDrive, Calendar, User, FileText, Layers, Tag } from 'lucide-react';
import { formatBytes, readFileAsArrayBuffer } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  creator: string;
  producer: string;
  creationDate: string;
  modificationDate: string;
  pageCount: number;
  fileSize: number;
  fileName: string;
}

export const PdfInfo: React.FC = () => {
  const { language, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<PdfMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      try {
        setError(null);
        const buffer = await readFileAsArrayBuffer(selected);
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

        const title = doc.getTitle() || 'Not specified';
        const author = doc.getAuthor() || 'Not specified';
        const subject = doc.getSubject() || 'Not specified';
        const creator = doc.getCreator() || 'Not specified';
        const producer = doc.getProducer() || 'Not specified';
        const creationDate = doc.getCreationDate() ? doc.getCreationDate()!.toLocaleString() : 'Not specified';
        const modDate = doc.getModificationDate() ? doc.getModificationDate()!.toLocaleString() : 'Not specified';

        setFile(selected);
        setMeta({
          title,
          author,
          subject,
          creator,
          producer,
          creationDate,
          modificationDate: modDate,
          pageCount: doc.getPageCount(),
          fileSize: selected.size,
          fileName: selected.name,
        });
      } catch (err) {
        setError(language === 'bn' ? 'পিডিএফ মেটাডেটা লোড করা যায়নি।' : 'Could not read PDF metadata.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {!meta ? (
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
            <FileSearch className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {language === 'bn' ? 'পিডিএফ ফাইল নির্বাচন করুন মেটাডেটা দেখতে' : 'Select a PDF to inspect metadata & info'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5">
            {language === 'bn'
              ? 'লেখক, শিরোনাম, পৃষ্ঠা সংখ্যা ও তৈরির তারিখ সম্পূর্ণ লোকালি পরীক্ষা করুন।'
              : 'Inspect embedded PDF metadata securely without uploading.'}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-200 block truncate max-w-sm">{meta.fileName}</span>
                <span className="text-xs text-slate-400 font-mono">
                  {meta.pageCount} {language === 'bn' ? 'টি পাতা' : 'pages'} • {formatBytes(meta.fileSize)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setMeta(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              {language === 'bn' ? 'অন্য পিডিএফ দেখুন' : 'Inspect Another PDF'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                {language === 'bn' ? 'মোট পৃষ্ঠা সংখ্যা' : 'Page Count'}
              </span>
              <span className="text-base font-bold text-slate-100 font-mono">
                {meta.pageCount}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'bn' ? 'ফাইলের আকার' : 'File Size'}
              </span>
              <span className="text-base font-bold text-slate-100 font-mono">
                {formatBytes(meta.fileSize)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-purple-400" />
                {language === 'bn' ? 'ডকুমেন্ট শিরোনাম (Title)' : 'Document Title'}
              </span>
              <span className="text-sm font-semibold text-slate-200 truncate block">
                {meta.title}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                {language === 'bn' ? 'লেখক (Author)' : 'Author'}
              </span>
              <span className="text-sm font-semibold text-slate-200 truncate block">
                {meta.author}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {language === 'bn' ? 'তৈরির তারিখ' : 'Creation Date'}
              </span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {meta.creationDate}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                {language === 'bn' ? 'পরিবর্তনের তারিখ' : 'Modified Date'}
              </span>
              <span className="text-xs font-semibold text-slate-200 truncate block">
                {meta.modificationDate}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-2">
              <span className="text-[11px] text-slate-400 mb-1 block">
                {language === 'bn' ? 'সফটওয়্যার / অ্যাপ্লিকেশন (Producer & Creator)' : 'Application / Producer'}
              </span>
              <span className="text-xs font-mono text-slate-300 truncate block">
                {meta.producer} / {meta.creator}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 sm:col-span-1">
              <span className="text-[11px] text-slate-400 mb-1 block">
                {language === 'bn' ? 'বিষয় (Subject)' : 'Subject'}
              </span>
              <span className="text-xs text-slate-300 truncate block">
                {meta.subject}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
