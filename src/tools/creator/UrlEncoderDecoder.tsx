import React, { useState } from 'react';
import { Copy, Check, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const UrlEncoderDecoder: React.FC = () => {
  const { language, t } = useLanguage();
  const [inputVal, setInputVal] = useState<string>('https://sobtools.com/search?q=pdf merge&lang=bn&user=123');
  const [outputVal, setOutputVal] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleEncode = () => {
    try {
      setOutputVal(encodeURIComponent(inputVal));
    } catch {
      setOutputVal('Error encoding URL');
    }
  };

  const handleDecode = () => {
    try {
      setOutputVal(decodeURIComponent(inputVal));
    } catch {
      setOutputVal('Error decoding URL');
    }
  };

  // Parse query params if input looks like a URL
  let parsedParams: Array<{ key: string; value: string }> = [];
  try {
    const urlObj = new URL(inputVal.startsWith('http') ? inputVal : `https://example.com/${inputVal}`);
    urlObj.searchParams.forEach((value, key) => {
      parsedParams.push({ key, value });
    });
  } catch {
    // Ignore URL parse failure for raw fragments
  }

  const handleCopy = async () => {
    if (!outputVal) return;
    const ok = await copyToClipboard(outputVal);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEncode}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25"
          >
            {language === 'bn' ? 'ইউআরএল এনকোড (Encode)' : 'Encode URI'}
          </button>
          <button
            type="button"
            onClick={handleDecode}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
          >
            {language === 'bn' ? 'ইউআরএল ডিকোড (Decode)' : 'Decode URI'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setInputVal('');
            setOutputVal('');
          }}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium"
        >
          {t('clear')}
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            {language === 'bn' ? 'ইনপুট ইউআরএল বা টেক্সট:' : 'Input URL or String:'}
          </label>
          <textarea
            rows={6}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter URL to encode or %20 encoded string to decode..."
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-indigo-400">
              {language === 'bn' ? 'ফলাফল (Output):' : 'Output:'}
            </label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!outputVal}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
          <textarea
            readOnly
            rows={6}
            value={outputVal}
            placeholder="Click Encode or Decode above..."
            className="w-full p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none"
          />
        </div>
      </div>

      {/* Query Parameters Visual Table */}
      {parsedParams.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2.5">
          <span className="text-xs font-semibold text-slate-300 block">
            {language === 'bn' ? 'কোয়েরি প্যারামিটার টেবিল (Parsed Query Params):' : 'Parsed Query Parameters:'}
          </span>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-xs text-left text-slate-300 font-mono">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Parameter (Key)</th>
                  <th className="py-2 px-3">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950">
                {parsedParams.map((param, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 text-indigo-400 font-semibold">{param.key}</td>
                    <td className="py-2 px-3 text-slate-300">{param.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
