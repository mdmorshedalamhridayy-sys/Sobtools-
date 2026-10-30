import React, { useState, useEffect } from 'react';
import {
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { HomepageConfig } from '../../types';
import { fetchHomepageConfig, saveHomepageConfig } from '../../services/cmsService';

interface HomepageTabProps {
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'CMS', details: string, targetId?: string) => void;
}

export const AdminHomepageTab: React.FC<HomepageTabProps> = ({ onRefresh, onLogAudit }) => {
  const [config, setConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchHomepageConfig().then((data) => {
      setConfig(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      await saveHomepageConfig(config);
      onLogAudit('HOMEPAGE_UPDATE', 'CMS', 'Updated homepage hero text, sections & visibility');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      onRefresh();
    } catch (err) {
      console.error('Error saving homepage config:', err);
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!config) return;
    const newOrder = [...config.sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setConfig({ ...config, sectionOrder: newOrder });
  };

  const toggleSectionVisibility = (key: keyof HomepageConfig['sections']) => {
    if (!config) return;
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [key]: !config.sections[key],
      },
    });
  };

  const sectionLabels: Record<string, string> = {
    hero: 'Hero Welcome Banner',
    topAd: 'Top Header Advertisement Slot',
    popularTools: 'Trending & Popular Tools Carousel',
    categories: 'Category Navigation Showcase',
    recentTools: 'Recently Used Tools (Authenticated)',
    allTools: 'Complete Tools Grid with Filters',
    midAd: 'Mid-Page Sponsored Banner',
    features: 'Why Choose SobTools (Features & Trust)',
    faqPreview: 'Frequently Asked Questions (FAQ)',
    bottomAd: 'Bottom Footer Advertisement Slot',
  };

  if (loading || !config) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Loading homepage layout settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Homepage Visual Layout & Content Editor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize the landing page headline, call-to-actions, visual themes, and section order.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Changes Published!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section Content Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Hero Header Content</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Main Headline (English)
              </label>
              <textarea
                rows={2}
                required
                value={config.heroTitle.en}
                onChange={(e) =>
                  setConfig({ ...config, heroTitle: { ...config.heroTitle, en: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                মূল শিরোনাম (বাংলা)
              </label>
              <textarea
                rows={2}
                required
                value={config.heroTitle.bn}
                onChange={(e) =>
                  setConfig({ ...config, heroTitle: { ...config.heroTitle, bn: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subtitle Description (English)
              </label>
              <textarea
                rows={3}
                required
                value={config.heroSubtitle.en}
                onChange={(e) =>
                  setConfig({ ...config, heroSubtitle: { ...config.heroSubtitle, en: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                উপ-শিরোনাম বর্ণনা (বাংলা)
              </label>
              <textarea
                rows={3}
                required
                value={config.heroSubtitle.bn}
                onChange={(e) =>
                  setConfig({ ...config, heroSubtitle: { ...config.heroSubtitle, bn: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Call to Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Primary CTA (EN)</label>
              <input
                type="text"
                value={config.heroCtaPrimaryText.en}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroCtaPrimaryText: { ...config.heroCtaPrimaryText, en: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Primary CTA Link</label>
              <input
                type="text"
                value={config.heroCtaPrimaryLink}
                onChange={(e) => setConfig({ ...config, heroCtaPrimaryLink: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Secondary CTA (EN)</label>
              <input
                type="text"
                value={config.heroCtaSecondaryText.en}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    heroCtaSecondaryText: { ...config.heroCtaSecondaryText, en: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Secondary CTA Link</label>
              <input
                type="text"
                value={config.heroCtaSecondaryLink}
                onChange={(e) => setConfig({ ...config, heroCtaSecondaryLink: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
              <input
                type="checkbox"
                checked={config.showSearchBar}
                onChange={(e) => setConfig({ ...config, showSearchBar: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              <span>Show Hero Search Bar input</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Glow Preset:</span>
              <select
                value={config.heroStylePreset}
                onChange={(e) => setConfig({ ...config, heroStylePreset: e.target.value as any })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
              >
                <option value="modern_glow">Modern Indigo/Cyan Glow</option>
                <option value="cyber_midnight">Cyber Midnight Dark</option>
                <option value="emerald_clean">Emerald Productivity</option>
                <option value="purple_sleek">Purple Creator Sleek</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Ordering & Visibility */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Homepage Sections Reorder & Toggle</h3>
            <p className="text-xs text-slate-400">
              Drag or use arrows to change the vertical layout order on the homepage.
            </p>
          </div>

          <div className="space-y-2">
            {config.sectionOrder.map((sectionKey, index) => {
              const isVisible = config.sections[sectionKey as keyof HomepageConfig['sections']];
              return (
                <div
                  key={sectionKey}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isVisible
                      ? 'bg-slate-950 border-slate-800 text-white'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-slate-400 font-mono text-[11px] flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-xs font-semibold">
                      {sectionLabels[sectionKey] || sectionKey}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(sectionKey as keyof HomepageConfig['sections'])}
                      className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isVisible
                          ? 'text-emerald-400 hover:bg-emerald-950/30'
                          : 'text-slate-500 hover:bg-slate-900'
                      }`}
                      title={isVisible ? 'Hide section' : 'Show section'}
                    >
                      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveSection(index, 'up')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      disabled={index === config.sectionOrder.length - 1}
                      onClick={() => moveSection(index, 'down')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save & Publish Homepage</span>
          </button>
        </div>
      </form>
    </div>
  );
};
