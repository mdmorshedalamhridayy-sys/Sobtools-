import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  MousePointerClick,
  Save,
  Loader2,
  X,
  ExternalLink,
  Code,
  Image as ImageIcon,
} from 'lucide-react';
import { AdvertisementConfig, AdPlacement, AdType } from '../../types';
import { saveAdvertisement, DEFAULT_ADSENSE_PUBLISHER } from '../../services/cmsService';

interface AdsTabProps {
  advertisements: AdvertisementConfig[];
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'AD', details: string, targetId?: string) => void;
}

export const AdminAdsTab: React.FC<AdsTabProps> = ({
  advertisements,
  onRefresh,
  onLogAudit,
}) => {
  const [editingAd, setEditingAd] = useState<AdvertisementConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const handleToggleActive = async (ad: AdvertisementConfig) => {
    const updated = { ...ad, active: !ad.active };
    try {
      await saveAdvertisement(updated);
      onLogAudit(
        'AD_TOGGLE',
        'AD',
        `Toggled ${ad.title} (${ad.placement}) to ${updated.active ? 'ACTIVE' : 'INACTIVE'}`,
        ad.id
      );
      onRefresh();
    } catch (err) {
      console.error('Error toggling ad status:', err);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    setSaving(true);
    try {
      await saveAdvertisement(editingAd);
      onLogAudit(
        'AD_UPDATE',
        'AD',
        `Updated advertisement slot: ${editingAd.title} (${editingAd.placement})`,
        editingAd.id
      );
      setEditingAd(null);
      onRefresh();
    } catch (err) {
      console.error('Error saving advertisement:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-400" />
            <span>Advertisement & Monetization Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Google AdSense responsive slots and direct sponsorship banner ads across all page layouts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span className="text-slate-500">AdSense Client:</span>
          <span className="text-indigo-400">{DEFAULT_ADSENSE_PUBLISHER}</span>
        </div>
      </div>

      {/* Ad Slots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {advertisements.map((ad) => (
          <div
            key={ad.id}
            className={`rounded-2xl border p-5 shadow-lg transition-all flex flex-col justify-between ${
              ad.active
                ? 'bg-slate-900 border-slate-800 hover:border-amber-500/30'
                : 'bg-slate-950/60 border-slate-800/60 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{ad.title}</h3>
                  <span className="font-mono text-[10px] text-slate-400">Position: {ad.placement}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      ad.type === 'adsense'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : ad.type === 'custom_banner'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {ad.type}
                  </span>

                  <button
                    onClick={() => handleToggleActive(ad)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                      ad.active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {ad.active ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>
              </div>

              {/* Slot details preview */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs mb-3 space-y-1">
                {ad.type === 'adsense' && (
                  <>
                    <div className="flex justify-between text-slate-400">
                      <span>AdSense Slot ID:</span>
                      <span className="font-mono text-white">{ad.adSenseSlot || 'Auto-Responsive'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Format:</span>
                      <span className="capitalize text-slate-300">{ad.adSenseFormat || 'Banner'}</span>
                    </div>
                  </>
                )}

                {ad.type === 'custom_banner' && (
                  <>
                    <div className="flex justify-between text-slate-400">
                      <span>Destination URL:</span>
                      <span className="font-mono text-cyan-400 truncate max-w-[180px]">{ad.targetUrl || 'None'}</span>
                    </div>
                    {ad.bannerImageUrl && (
                      <div className="mt-2 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                        <img src={ad.bannerImageUrl} alt="Banner Preview" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                  </>
                )}

                {ad.type === 'html_code' && (
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    Code: {ad.htmlContent ? `${ad.htmlContent.substring(0, 40)}...` : 'No custom HTML provided'}
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-500" />
                  <span>{ad.impressions || 0} impressions</span>
                </span>
                <span className="flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3 text-slate-500" />
                  <span>{ad.clicks || 0} clicks</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingAd(JSON.parse(JSON.stringify(ad)))}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Configure Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Ad Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setEditingAd(null)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Configure Ad Placement</h3>
            <p className="text-xs text-slate-400 mb-6">{editingAd.placement}</p>

            <form onSubmit={handleSaveAd} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ad Title / Name</label>
                <input
                  type="text"
                  required
                  value={editingAd.title}
                  onChange={(e) => setEditingAd({ ...editingAd, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ad Unit Type</label>
                  <select
                    value={editingAd.type}
                    onChange={(e) => setEditingAd({ ...editingAd, type: e.target.value as AdType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="adsense">Google AdSense</option>
                    <option value="custom_banner">Custom Image Banner</option>
                    <option value="html_code">HTML Embed Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Placement Status</label>
                  <select
                    value={editingAd.active ? 'active' : 'inactive'}
                    onChange={(e) => setEditingAd({ ...editingAd, active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields: AdSense */}
              {editingAd.type === 'adsense' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      AdSense Slot ID (Numeric)
                    </label>
                    <input
                      type="text"
                      value={editingAd.adSenseSlot || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, adSenseSlot: e.target.value })}
                      placeholder="e.g. 1234567890 (leave empty for responsive fallback)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Ad Format</label>
                    <select
                      value={editingAd.adSenseFormat || 'banner'}
                      onChange={(e) =>
                        setEditingAd({ ...editingAd, adSenseFormat: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option value="auto">Auto Responsive</option>
                      <option value="banner">Horizontal Banner</option>
                      <option value="rectangle">Medium Rectangle (300x250)</option>
                      <option value="horizontal">Full Width Horizontal</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Conditional Fields: Custom Banner */}
              {editingAd.type === 'custom_banner' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={editingAd.bannerImageUrl || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, bannerImageUrl: e.target.value })}
                      placeholder="https://example.com/ad-banner.jpg"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Click Target URL
                    </label>
                    <input
                      type="url"
                      value={editingAd.targetUrl || ''}
                      onChange={(e) => setEditingAd({ ...editingAd, targetUrl: e.target.value })}
                      placeholder="https://sponsor.com/landing"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(editingAd.openInNewTab)}
                      onChange={(e) => setEditingAd({ ...editingAd, openInNewTab: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                    />
                    <span>Open link in new browser tab</span>
                  </label>
                </div>
              )}

              {/* Conditional Fields: Custom HTML */}
              {editingAd.type === 'html_code' && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Raw HTML / JavaScript Ad Tag
                  </label>
                  <textarea
                    rows={4}
                    value={editingAd.htmlContent || ''}
                    onChange={(e) => setEditingAd({ ...editingAd, htmlContent: e.target.value })}
                    placeholder="<div>...</div>"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Ad Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
