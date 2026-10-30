import React, { useState } from 'react';
import { Copy, Check, Trash2, Download, AlertCircle, CheckCircle, Braces } from 'lucide-react';
import { copyToClipboard, downloadBlob } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const JsonFormatter: React.FC = () => {
  const { language, t } = useLanguage();
  const [jsonInput, setJsonInput] = useState<string>('{\n  "name": "SobTools",\n  "version": 1,\n  "fast": true,\n  "tools": 36\n}');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const formatJson = (spaces: number) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, spaces));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(jsonInput);
      setError(null);
      alert(language === 'bn' ? 'অভিনন্দন! জেসন (JSON) কোডটি সম্পূর্ণ নির্ভুল।' : 'Valid JSON syntax! No errors found.');
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleCopy = async () => {
    if (!jsonInput) return;
    const ok = await copyToClipboard(jsonInput);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonInput], { type: 'application/json' });
    downloadBlob(blob, 'formatted.json');
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => formatJson(2)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            {language === 'bn' ? 'ফরম্যাট (2 Spaces)' : 'Beautify (2 Spaces)'}
          </button>
          <button
            type="button"
            onClick={() => formatJson(4)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            {language === 'bn' ? 'ফরম্যাট (4 Spaces)' : 'Beautify (4 Spaces)'}
          </button>
          <button
            type="button"
            onClick={minifyJson}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition-colors font-mono"
          >
            Minify JSON
          </button>
          <button
            type="button"
            onClick={validateJson}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-semibold transition-all"
          >
            {language === 'bn' ? 'যাচাই করুন (Validate)' : 'Validate'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!jsonInput}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('copied') : t('copy')}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!jsonInput}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            .JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setJsonInput('');
              setError(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium"
          >
            {t('clear')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Editor */}
      <div className="space-y-2">
        <textarea
          rows={14}
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setError(null);
          }}
          placeholder="Paste or write raw JSON here..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>
    </div>
  );
};
