import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sun,
  Moon,
  CheckCircle2,
  Save,
  Loader2,
  Sparkles,
  Eye,
  Sliders,
  Code,
  Shield,
  Zap,
} from 'lucide-react';
import { SiteSettings, ThemeAccentColor } from '../../types';
import { fetchSiteSettings, saveSiteSettings } from '../../services/cmsService';
import { useTheme, ACCENT_COLOR_MAP } from '../../context/ThemeContext';

interface AppearanceTabProps {
  onRefresh?: () => void;
  onLogAudit?: (action: string, category: 'THEME', details: string) => void;
}

export const AdminAppearanceTab: React.FC<AppearanceTabProps> = ({ onRefresh, onLogAudit }) => {
  const { theme: currentTheme, setTheme, accentColor: currentAccent, setAccentColor } = useTheme();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');
  const [selectedAccent, setSelectedAccent] = useState<ThemeAccentColor>('indigo');
  const [allowUserToggle, setAllowUserToggle] = useState(true);
  const [customCss, setCustomCss] = useState('');

  useEffect(() => {
    fetchSiteSettings().then((data) => {
      setSettings(data);
      if (data.defaultTheme === 'light' || data.defaultTheme === 'dark') {
        setSelectedTheme(data.defaultTheme);
      }
      if (data.themeAccentColor) {
        setSelectedAccent(data.themeAccentColor);
      }
      setAllowUserToggle(data.allowUserThemeToggle !== false);
      setCustomCss(data.customCss || '');
      setLoading(false);
    });
  }, []);

  const handleApplyPreview = (theme: 'dark' | 'light', accent: ThemeAccentColor) => {
    setSelectedTheme(theme);
    setSelectedAccent(accent);
    setTheme(theme);
    setAccentColor(accent);
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const updated: SiteSettings = {
        ...settings,
        defaultTheme: selectedTheme,
        themeAccentColor: selectedAccent,
        allowUserThemeToggle: allowUserToggle,
        customCss,
      };

      await saveSiteSettings(updated);
      onLogAudit?.(
        'THEME_UPDATE',
        'THEME',
        `Changed global website theme to ${selectedTheme.toUpperCase()} mode with ${selectedAccent} accent color.`
      );

      setTheme(selectedTheme);
      setAccentColor(selectedAccent);
      onRefresh?.();
      setToast('Website theme and color palette published successfully!');
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error('Error saving theme settings:', err);
      alert('Failed to save theme settings.');
    } finally {
      setSaving(false);
    }
  };

  const paletteList: Array<{ id: ThemeAccentColor; name: string; hex: string; bgClass: string }> = [
    { id: 'indigo', name: 'Indigo Electric', hex: '#6366f1', bgClass: 'from-indigo-600 to-indigo-500' },
    { id: 'cyan', name: 'Cyan Cyber', hex: '#06b6d4', bgClass: 'from-cyan-600 to-cyan-500' },
    { id: 'emerald', name: 'Emerald Growth', hex: '#10b981', bgClass: 'from-emerald-600 to-emerald-500' },
    { id: 'purple', name: 'Purple Royalty', hex: '#8b5cf6', bgClass: 'from-purple-600 to-purple-500' },
    { id: 'amber', name: 'Amber Gold', hex: '#f59e0b', bgClass: 'from-amber-600 to-amber-500' },
    { id: 'rose', name: 'Rose Crimson', hex: '#f43f5e', bgClass: 'from-rose-600 to-rose-500' },
  ];

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Loading theme customizer...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-400" />
            <span>Theme & Visual Appearance Customizer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch default website theme mode, select primary color palettes, and customize brand aesthetics.
          </p>
        </div>

        <button
          onClick={handleSaveTheme}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Apply & Save Theme</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Theme Selectors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Default Theme Mode Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Default Website Theme Mode</span>
            </h3>
            <p className="text-xs text-slate-400">
              Select the initial default appearance for visitors and logged-in users.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => handleApplyPreview('dark', selectedAccent)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  selectedTheme === 'dark'
                    ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Sleek Dark Mode (Default)</div>
                  <div className="text-[11px] text-slate-400">Deep slate background with high contrast</div>
                </div>
              </div>

              <div
                onClick={() => handleApplyPreview('light', selectedAccent)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                  selectedTheme === 'light'
                    ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-70'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">Clean Light Mode</div>
                  <div className="text-[11px] text-slate-400">Bright and crisp layout with dark text</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={allowUserToggle}
                  onChange={(e) => setAllowUserToggle(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Allow visitors to toggle their individual theme in the site header</span>
              </label>
            </div>
          </div>

          {/* Primary Accent Color Palette */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Primary Brand Accent Color</span>
            </h3>
            <p className="text-xs text-slate-400">
              The primary accent powers button highlights, active badges, navigation glows, and icons across SobTools.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paletteList.map((p) => {
                const isSelected = selectedAccent === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleApplyPreview(selectedTheme, p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-slate-950 border-white ring-2 ring-indigo-500/30 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg shadow-sm shrink-0 border border-white/20"
                      style={{ backgroundColor: p.hex }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400">{p.hex}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom CSS Injections */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Custom CSS Style Overrides (Advanced)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Inject custom CSS declarations directly into the document head.
            </p>
            <textarea
              rows={4}
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              placeholder=":root { /* custom styles */ }"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Right Col: Live Theme Preview */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 sticky top-20">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Live Website Elements Preview</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Visual preview of how cards, buttons, badges, and text look under current selection.
            </p>

            {/* Preview Card Mockup */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                selectedTheme === 'dark'
                  ? 'bg-slate-950 text-white border-slate-800'
                  : 'bg-slate-100 text-slate-900 border-slate-300'
              }`}
            >
              {/* Header Mockup */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/40">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: ACCENT_COLOR_MAP[selectedAccent].hex }}
                  >
                    S
                  </div>
                  <span className="font-bold text-xs">SobTools Brand</span>
                </div>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: `${ACCENT_COLOR_MAP[selectedAccent].hex}20`,
                    color: ACCENT_COLOR_MAP[selectedAccent].hex,
                  }}
                >
                  Featured Badge
                </span>
              </div>

              {/* Sample Content */}
              <div className="space-y-2 mb-4">
                <div className="text-xs font-bold">Image Compressor Tool</div>
                <div className="text-[11px] opacity-75">
                  Compress JPG and PNG images locally with custom quality settings.
                </div>
              </div>

              {/* Sample Button */}
              <button
                type="button"
                className="w-full py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-transform"
                style={{ backgroundColor: ACCENT_COLOR_MAP[selectedAccent].hex }}
              >
                Sample Action Button
              </button>
            </div>

            <button
              onClick={handleSaveTheme}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save & Publish Theme to Website</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
