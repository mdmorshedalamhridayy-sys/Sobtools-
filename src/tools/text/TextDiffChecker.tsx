import React, { useState } from 'react';
import { GitCompare, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DiffLine {
  type: 'added' | 'removed' | 'same';
  text: string;
}

export const TextDiffChecker: React.FC = () => {
  const { language, t } = useLanguage();
  const [textA, setTextA] = useState<string>('');
  const [textB, setTextB] = useState<string>('');

  const computeDiff = (): DiffLine[] => {
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');
    const diff: DiffLine[] = [];

    const max = Math.max(linesA.length, linesB.length);
    for (let i = 0; i < max; i++) {
      const a = linesA[i];
      const b = linesB[i];

      if (a === undefined) {
        diff.push({ type: 'added', text: b });
      } else if (b === undefined) {
        diff.push({ type: 'removed', text: a });
      } else if (a === b) {
        diff.push({ type: 'same', text: a });
      } else {
        diff.push({ type: 'removed', text: a });
        diff.push({ type: 'added', text: b });
      }
    }
    return diff;
  };

  const diffResult = textA || textB ? computeDiff() : [];
  const addedCount = diffResult.filter((d) => d.type === 'added').length;
  const removedCount = diffResult.filter((d) => d.type === 'removed').length;

  return (
    <div className="space-y-6">
      {/* Side-by-Side Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-rose-400 block">
            {language === 'bn' ? 'মূল বা পূর্ববর্তী টেক্সট (Original):' : 'Original Text (A):'}
          </label>
          <textarea
            rows={7}
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'আগের লেখাটি এখানে পেস্ট করুন...'
                : 'Paste original content here...'
            }
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-emerald-400 block">
            {language === 'bn' ? 'নতুন বা পরিবর্তিত টেক্সট (Modified):' : 'Modified Text (B):'}
          </label>
          <textarea
            rows={7}
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'পরিবর্তিত লেখাটি এখানে পেস্ট করুন...'
                : 'Paste modified content here...'
            }
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Difference Highlights Output */}
      {diffResult.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              {language === 'bn' ? 'পার্থক্য বিশ্লেষণ (Diff View):' : 'Comparison Differences:'}
            </span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-emerald-400">+{addedCount} {language === 'bn' ? 'যোগ' : 'added'}</span>
              <span className="text-rose-400">-{removedCount} {language === 'bn' ? 'বিয়োগ' : 'removed'}</span>
            </div>
          </div>

          <div className="font-mono text-xs rounded-lg overflow-hidden border border-slate-800 divide-y divide-slate-800/40 max-h-96 overflow-y-auto">
            {diffResult.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-start px-3 py-1.5 gap-2.5 ${
                  line.type === 'added'
                    ? 'bg-emerald-950/40 text-emerald-300'
                    : line.type === 'removed'
                    ? 'bg-rose-950/40 text-rose-300'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                <span className="select-none font-bold text-[11px] w-4 shrink-0 text-slate-500">
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </span>
                <span className="break-all whitespace-pre-wrap">{line.text || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
