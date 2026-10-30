import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ShieldCheck, Lock, Sliders } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

export const PasswordGenerator: React.FC = () => {
  const { language, t } = useLanguage();
  const [password, setPassword] = useState<string>('');
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useDigits, setUseDigits] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    let digitChars = '0123456789';
    let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (avoidAmbiguous) {
      upperChars = upperChars.replace(/[OI]/g, '');
      lowerChars = lowerChars.replace(/[l]/g, '');
      digitChars = digitChars.replace(/[01]/g, '');
    }

    let charPool = '';
    if (useUpper) charPool += upperChars;
    if (useLower) charPool += lowerChars;
    if (useDigits) charPool += digitChars;
    if (useSymbols) charPool += symbolChars;

    if (!charPool) {
      setPassword('');
      return;
    }

    // Cryptographically secure randomness
    const randomBuffer = new Uint32Array(length);
    window.crypto.getRandomValues(randomBuffer);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charPool[randomBuffer[i] % charPool.length];
    }
    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, useUpper, useLower, useDigits, useSymbols, avoidAmbiguous]);

  // Entropy calculation
  let poolSize = 0;
  if (useUpper) poolSize += 26;
  if (useLower) poolSize += 26;
  if (useDigits) poolSize += 10;
  if (useSymbols) poolSize += 30;
  const entropy = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-rose-500';
  if (entropy > 75) {
    strengthLabel = 'Very Strong (Military-grade)';
    strengthColor = 'bg-emerald-500';
  } else if (entropy > 55) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-indigo-500';
  } else if (entropy > 35) {
    strengthLabel = 'Moderate';
    strengthColor = 'bg-amber-500';
  }

  const handleCopy = async () => {
    if (!password) return;
    const ok = await copyToClipboard(password);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Generated Password Display */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
          <span className="font-mono text-base sm:text-lg text-emerald-400 font-semibold tracking-wider select-all break-all">
            {password || 'Please select at least one character type'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={generatePassword}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('copied') : t('copy')}
            </button>
          </div>
        </div>

        {/* Strength & Entropy meter */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>
              {language === 'bn' ? 'পাসওয়ার্ডের শক্তি:' : 'Strength:'}{' '}
              <strong className="text-slate-200">{strengthLabel}</strong>
            </span>
            <span className="font-mono text-indigo-400">{entropy} bits entropy</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${Math.min(100, (entropy / 90) * 100)}%` }}
              className={`h-full transition-all duration-300 rounded-full ${strengthColor}`}
            />
          </div>
        </div>
      </div>

      {/* Options and settings */}
      <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
            <span>{language === 'bn' ? 'পাসওয়ার্ডের দৈর্ঘ্য (Length):' : 'Password Length:'}</span>
            <span className="text-indigo-400 font-mono font-bold text-sm">{length} characters</span>
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={useUpper}
              onChange={(e) => setUseUpper(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{language === 'bn' ? 'বড় হাতের অক্ষর (A-Z)' : 'Uppercase Letters (A-Z)'}</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={useLower}
              onChange={(e) => setUseLower(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{language === 'bn' ? 'ছোট হাতের অক্ষর (a-z)' : 'Lowercase Letters (a-z)'}</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={useDigits}
              onChange={(e) => setUseDigits(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{language === 'bn' ? 'সংখ্যা (0-9)' : 'Numbers (0-9)'}</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>{language === 'bn' ? 'বিশেষ চিহ্ন (!@#$%^&*)' : 'Special Symbols (!@#$)'}</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer sm:col-span-2">
            <input
              type="checkbox"
              checked={avoidAmbiguous}
              onChange={(e) => setAvoidAmbiguous(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span>
              {language === 'bn'
                ? 'বিভ্রান্তিকর অক্ষর বাদ দিন (Avoid O, 0, l, 1, I)'
                : 'Exclude Ambiguous Characters (O, 0, l, 1, I)'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
