import React, { useState } from 'react';
import { Copy, Check, Fingerprint, RefreshCw, Download } from 'lucide-react';
import { copyToClipboard, downloadBlob } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const UuidGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [noHyphens, setNoHyphens] = useState<boolean>(false);
  const [braces, setBraces] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const generateOne = (): string => {
    let id = '';
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      // RFC4122 v4 fallback
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    if (noHyphens) id = id.replace(/-/g, '');
    if (uppercase) id = id.toUpperCase();
    if (braces) id = `{${id}}`;
    return id;
  };

  const handleGenerate = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generateOne());
    }
    setUuids(list);
  };

  // Generate on initial render
  React.useEffect(() => {
    handleGenerate();
  }, [count, uppercase, noHyphens, braces]);

  const handleCopy = async () => {
    if (uuids.length === 0) return;
    const ok = await copyToClipboard(uuids.join('\n'));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'uuids.txt');
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {language === 'bn' ? 'সংখ্যা (Count 1-100):' : 'Quantity (1-100):'}
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300 pt-4 sm:col-span-2">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Uppercase</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={noHyphens}
                onChange={(e) => setNoHyphens(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>No Hyphens</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={braces}
                onChange={(e) => setBraces(e.target.checked)}
                className="rounded accent-indigo-500"
              />
              <span>Braces {'{}'}</span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {language === 'bn' ? 'পুনরায় তৈরি' : 'Re-generate'}
            </button>
          </div>
        </div>
      </div>

      {/* Output List */}
      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            {language === 'bn' ? `তৈরিকৃত ইউইউআইডি (${uuids.length}টি):` : `Generated UUIDs (${uuids.length}):`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              .TXT
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 divide-y divide-slate-800/40 max-h-80 overflow-y-auto font-mono text-xs text-indigo-300">
          {uuids.map((id, idx) => (
            <div key={idx} className="py-2 px-1 flex items-center justify-between hover:bg-slate-900/40">
              <span className="select-all">{id}</span>
              <span className="text-[10px] text-slate-600 select-none">#{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
