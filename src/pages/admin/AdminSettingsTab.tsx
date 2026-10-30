import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Code,
  Globe,
  Mail,
  Shield,
  Layers,
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { fetchSiteSettings, saveSiteSettings } from '../../services/cmsService';

interface SettingsTabProps {
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'SETTINGS', details: string) => void;
}

export const AdminSettingsTab: React.FC<SettingsTabProps> = ({ onRefresh, onLogAudit }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccess(false);
    try {
      await saveSiteSettings(settings);
      onLogAudit('SETTINGS_UPDATE', 'SETTINGS', 'Updated global site settings and parameters');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      onRefresh();
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Loading global system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Platform Identity & Operational Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global website name, brand logo, maintenance toggles, registration rules, and AdSense publisher credentials.
          </p>
        </div>

        {success && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Market Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Brand Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Brand Name</label>
              <input
                type="text"
                required
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Market</label>
              <input
                type="text"
                value={settings.primaryMarket}
                onChange={(e) => setSettings({ ...settings, primaryMarket: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tagline (English)
              </label>
              <input
                type="text"
                value={settings.siteTagline.en}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    siteTagline: { ...settings.siteTagline, en: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                ট্যাগলাইন (বাংলা)
              </label>
              <input
                type="text"
                value={settings.siteTagline.bn}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    siteTagline: { ...settings.siteTagline, bn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Brand Logo URL (optional)
              </label>
              <input
                type="url"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="Leave blank to use default SobTools SVG icon"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Favicon URL (optional)
              </label>
              <input
                type="url"
                value={settings.faviconUrl || ''}
                onChange={(e) => setSettings({ ...settings, faviconUrl: e.target.value })}
                placeholder="https://example.com/favicon.ico"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Operational Security & Toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Platform Operation Toggles</span>
          </h3>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Maintenance Mode</div>
              <div className="text-[11px] text-slate-400">
                When turned on, non-admin visitors see a maintenance notice.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          {settings.maintenanceMode && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
              <div>
                <label className="block text-[11px] font-medium text-amber-300 mb-1">
                  Maintenance Notice (EN)
                </label>
                <input
                  type="text"
                  value={settings.maintenanceMessage?.en || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMessage: {
                        en: e.target.value,
                        bn: settings.maintenanceMessage?.bn || e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-800/60 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-amber-300 mb-1">
                  রক্ষণাবেক্ষণ বার্তা (BN)
                </label>
                <input
                  type="text"
                  value={settings.maintenanceMessage?.bn || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMessage: {
                        en: settings.maintenanceMessage?.en || e.target.value,
                        bn: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-amber-800/60 text-xs text-white outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">Allow New User Registrations</div>
              <div className="text-[11px] text-slate-400">
                Enables or temporarily halts new public account signups.
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.allowNewRegistrations}
              onChange={(e) =>
                setSettings({ ...settings, allowNewRegistrations: e.target.checked })
              }
              className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google AdSense Publisher ID
              </label>
              <input
                type="text"
                required
                value={settings.adsensePublisherId}
                onChange={(e) => setSettings({ ...settings, adsensePublisherId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Support & Contact Email
              </label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Social Links & Custom Script Slots */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <span>Social Handles & Custom Analytics Code</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Facebook URL</label>
              <input
                type="url"
                value={settings.socialLinks.facebook || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Twitter / X</label>
              <input
                type="url"
                value={settings.socialLinks.twitter || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Telegram URL</label>
              <input
                type="url"
                value={settings.socialLinks.telegram || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, telegram: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Header Embed Code (e.g. Analytics & Tag Manager)
              </label>
              <textarea
                rows={3}
                value={settings.customHeaderCode || ''}
                onChange={(e) => setSettings({ ...settings, customHeaderCode: e.target.value })}
                placeholder="<!-- Script or tracking meta tag -->"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Custom Footer Embed Code
              </label>
              <textarea
                rows={3}
                value={settings.customFooterCode || ''}
                onChange={(e) => setSettings({ ...settings, customFooterCode: e.target.value })}
                placeholder="<!-- Footer script tag -->"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Platform Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
