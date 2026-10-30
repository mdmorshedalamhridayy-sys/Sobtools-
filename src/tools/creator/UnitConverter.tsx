import React, { useState } from 'react';
import { Scale, ArrowRightLeft, Copy, Check, Calculator } from 'lucide-react';
import { copyToClipboard } from '../../utils/fileHelpers';
import { useLanguage } from '../../context/LanguageContext';

type CategoryKey = 'length' | 'weight' | 'temp' | 'storage' | 'area' | 'speed';

interface UnitDef {
  id: string;
  label: { en: string; bn: string };
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

const unitDatabase: Record<CategoryKey, { title: { en: string; bn: string }; units: UnitDef[] }> = {
  length: {
    title: { en: 'Length / Distance', bn: 'দৈর্ঘ্য ও দূরত্ব' },
    units: [
      { id: 'm', label: { en: 'Meter (m)', bn: 'মিটার' }, toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', label: { en: 'Kilometer (km)', bn: 'কিলোমিটার' }, toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', label: { en: 'Centimeter (cm)', bn: 'সেন্টিমিটার' }, toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'mm', label: { en: 'Millimeter (mm)', bn: 'মিলিমিটার' }, toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mi', label: { en: 'Mile (mi)', bn: 'মাইল' }, toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'ft', label: { en: 'Foot (ft)', bn: 'ফুট' }, toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'in', label: { en: 'Inch (in)', bn: 'ইঞ্চি' }, toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'yd', label: { en: 'Yard (yd)', bn: 'গজ' }, toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    ],
  },
  weight: {
    title: { en: 'Weight / Mass', bn: 'ওজন ও ভর' },
    units: [
      { id: 'kg', label: { en: 'Kilogram (kg)', bn: 'কিলোগ্রাম' }, toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', label: { en: 'Gram (g)', bn: 'গ্রাম' }, toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mg', label: { en: 'Milligram (mg)', bn: 'মিলিগ্রাম' }, toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      { id: 'lb', label: { en: 'Pound (lb)', bn: 'পাউন্ড' }, toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', label: { en: 'Ounce (oz)', bn: 'আউন্স' }, toBase: (v) => v * 0.028349523, fromBase: (v) => v / 0.028349523 },
      { id: 'ton', label: { en: 'Metric Ton (t)', bn: 'মেট্রিক টন' }, toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    ],
  },
  temp: {
    title: { en: 'Temperature', bn: 'তাপমাত্রা' },
    units: [
      { id: 'c', label: { en: 'Celsius (°C)', bn: 'সেলসিয়াস' }, toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', label: { en: 'Fahrenheit (°F)', bn: 'ফারেনহাইট' }, toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', label: { en: 'Kelvin (K)', bn: 'কেলভিন' }, toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
  storage: {
    title: { en: 'Digital Storage', bn: 'ডিজিটাল স্টোরেজ' },
    units: [
      { id: 'mb', label: { en: 'Megabyte (MB)', bn: 'মেগাবাইট (MB)' }, toBase: (v) => v, fromBase: (v) => v },
      { id: 'b', label: { en: 'Byte (B)', bn: 'বাইট (Byte)' }, toBase: (v) => v / (1024 * 1024), fromBase: (v) => v * 1024 * 1024 },
      { id: 'kb', label: { en: 'Kilobyte (KB)', bn: 'কিলোবাইট (KB)' }, toBase: (v) => v / 1024, fromBase: (v) => v * 1024 },
      { id: 'gb', label: { en: 'Gigabyte (GB)', bn: 'গিগাবাইট (GB)' }, toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'tb', label: { en: 'Terabyte (TB)', bn: 'টেরাবাইট (TB)' }, toBase: (v) => v * 1024 * 1024, fromBase: (v) => v / (1024 * 1024) },
    ],
  },
  area: {
    title: { en: 'Area & BD Land Measurements', bn: 'ক্ষেত্রফল ও জমির পরিমাপ' },
    units: [
      // Base: Square Meter
      { id: 'sqm', label: { en: 'Square Meter (m²)', bn: 'বর্গমিটার' }, toBase: (v) => v, fromBase: (v) => v },
      { id: 'sqft', label: { en: 'Square Feet (sq ft)', bn: 'বর্গফুট' }, toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'acre', label: { en: 'Acre', bn: 'একর' }, toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: 'hectare', label: { en: 'Hectare', bn: 'হেক্টর' }, toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      // Local Bangladeshi Land Units
      { id: 'decimal', label: { en: 'Decimal / Shatangsho (শতাংশ)', bn: 'শতাংশ / ডেসিমেল (৪৩৫.৬ বর্গফুট)' }, toBase: (v) => v * 40.4686, fromBase: (v) => v / 40.4686 },
      { id: 'katha', label: { en: 'Katha (কাঠা)', bn: 'কাঠা (৭২০ বর্গফুট / ১.৬৫ শতাংশ)' }, toBase: (v) => v * 66.8903, fromBase: (v) => v / 66.8903 },
      { id: 'bigha', label: { en: 'Bigha (বিঘা)', bn: 'বিঘা (১৪,৪০০ বর্গফুট / ২০ কাঠা)' }, toBase: (v) => v * 1337.8, fromBase: (v) => v / 1337.8 },
    ],
  },
  speed: {
    title: { en: 'Speed', bn: 'গতিবেগ' },
    units: [
      { id: 'kmh', label: { en: 'km/h', bn: 'কিলোমিটার প্রতি ঘণ্টা' }, toBase: (v) => v, fromBase: (v) => v },
      { id: 'mph', label: { en: 'Miles per hour (mph)', bn: 'মাইল প্রতি ঘণ্টা' }, toBase: (v) => v * 1.60934, fromBase: (v) => v / 1.60934 },
      { id: 'ms', label: { en: 'Meters per second (m/s)', bn: 'মিটার প্রতি সেকেন্ড' }, toBase: (v) => v * 3.6, fromBase: (v) => v / 3.6 },
      { id: 'knot', label: { en: 'Knot', bn: 'নট (নটিক্যাল মাইল/ঘণ্টা)' }, toBase: (v) => v * 1.852, fromBase: (v) => v / 1.852 },
    ],
  },
};

export const UnitConverter: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('length');
  const [inputVal, setInputVal] = useState<number>(100);
  const [fromUnitId, setFromUnitId] = useState<string>('m');
  const [toUnitId, setToUnitId] = useState<string>('ft');
  const [copied, setCopied] = useState<boolean>(false);

  const categoryData = unitDatabase[activeCategory];
  const fromUnit = categoryData.units.find((u) => u.id === fromUnitId) || categoryData.units[0];
  const toUnit = categoryData.units.find((u) => u.id === toUnitId) || categoryData.units[1];

  const handleCategorySwitch = (cat: CategoryKey) => {
    setActiveCategory(cat);
    const units = unitDatabase[cat].units;
    setFromUnitId(units[0].id);
    setToUnitId(units[1] ? units[1].id : units[0].id);
  };

  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  // Convert
  const baseValue = fromUnit.toBase(inputVal);
  const resultValue = toUnit.fromBase(baseValue);
  const formattedResult = Number.isInteger(resultValue) ? resultValue : parseFloat(resultValue.toFixed(4));

  const handleCopy = async () => {
    const ok = await copyToClipboard(`${formattedResult} ${toUnit.label[language]}`);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800">
        {(Object.keys(unitDatabase) as CategoryKey[]).map((catKey) => (
          <button
            key={catKey}
            type="button"
            onClick={() => handleCategorySwitch(catKey)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === catKey
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {unitDatabase[catKey].title[language]}
          </button>
        ))}
      </div>

      {/* Main Conversion Panel */}
      <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* From Unit */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {language === 'bn' ? 'থেকে (From):' : 'From:'}
            </label>
            <input
              type="number"
              value={inputVal || ''}
              onChange={(e) => setInputVal(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-base font-mono text-slate-100 focus:outline-none focus:border-indigo-500 mb-2"
            />
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              {categoryData.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label[language]}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-4">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 rounded-xl bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-700 text-slate-300 transition-all shadow-md group"
              title="Swap units"
            >
              <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
          </div>

          {/* To Unit */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-indigo-400 block">
                {language === 'bn' ? 'ফলাফল (To):' : 'Converted Result:'}
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/50 text-base font-mono text-emerald-400 font-bold select-all truncate">
              {formattedResult}
            </div>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
            >
              {categoryData.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label[language]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Calculation Formula Display */}
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>
            {language === 'bn' ? 'সরাসরি হিসাব সূত্র:' : 'Formula:'}{' '}
            <strong className="text-slate-200 font-mono">
              1 {fromUnit.label[language]} = {toUnit.fromBase(fromUnit.toBase(1)).toFixed(4)} {toUnit.label[language]}
            </strong>
          </span>
          <span className="font-mono text-emerald-400 text-[11px]">Accurate Calculation</span>
        </div>
      </div>
    </div>
  );
};
