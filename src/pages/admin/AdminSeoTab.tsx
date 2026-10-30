import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  FileCode,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { SEOSettings, ToolDefinition, CategoryDefinition } from '../../types';
import { fetchSEOSettings, saveSEOSettings } from '../../services/cmsService';

interface SeoTabProps {
  tools: ToolDefinition[];
  categories: CategoryDefinition[];
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'SETTINGS', details: string) => void;
}

export const AdminSeoTab: React.FC<SeoTabProps> = ({
  tools,
  categories,
  onRefresh,
  onLogAudit,
}) => {
  const [seo, setSeo] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  useEffect(() => {
    fetchSEOSettings().then((data) => {
      setSeo(data);
      setKeywordsInput(data.metaKeywords.join(', '));
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seo) return;

    setSaving(true);
    try {
      const parsedKeywords = keywordsInput
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload: SEOSettings = {
        ...seo,
        metaKeywords: parsedKeywords,
      };

      await saveSEOSettings(payload);
      onLogAudit('SEO_UPDATE', 'SETTINGS', 'Updated global SEO meta tags, verification & robots.txt');
      setSeo(payload);
      onRefresh();
      alert('SEO configuration saved successfully!');
    } catch (err) {
      console.error('Error saving SEO:', err);
    } finally {
      setSaving(false);
    }
  };

  const generateSitemapXml = () => {
    const base = seo?.canonicalBaseUrl || 'https://sobtools.com';
    const staticUrls = ['', '/tools', '/about', '/faq', '/contact', '/privacy', '/terms', '/disclaimer'];
    const catUrls = categories.map((c) => `/category/${c.slug}`);
    const toolUrls = tools.map((t) => `/tools/${t.slug}`);

    const all = [...staticUrls, ...catUrls, ...toolUrls];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all
  .map(
    (path) => `  <url>
    <loc>${base}${path}</loc>
    <changefreq>${path === '' || path === '/tools' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '' ? '1.0' : path.startsWith('/tools/') ? '0.8' : '0.6'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  };

  const handleCopySitemap = () => {
    navigator.clipboard.writeText(generateSitemapXml());
    setCopiedSitemap(true);
    setTimeout(() => setCopiedSitemap(false), 3000);
  };

  if (loading || !seo) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
        <span>Loading SEO configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>Search Engine Optimization (SEO) & Indexing</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage global meta titles, search descriptions, verification codes, OpenGraph tags, and robots.txt.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Global Meta Titles & Descriptions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white">Default Meta Title & Description</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Default Meta Title (English)
              </label>
              <input
                type="text"
                required
                value={seo.metaTitle.en}
                onChange={(e) =>
                  setSeo({ ...seo, metaTitle: { ...seo.metaTitle, en: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                মেটা টাইটেল (বাংলা)
              </label>
              <input
                type="text"
                required
                value={seo.metaTitle.bn}
                onChange={(e) =>
                  setSeo({ ...seo, metaTitle: { ...seo.metaTitle, bn: e.target.value } })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Meta Description (English)
              </label>
              <textarea
                rows={3}
                required
                value={seo.metaDescription.en}
                onChange={(e) =>
                  setSeo({
                    ...seo,
                    metaDescription: { ...seo.metaDescription, en: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                মেটা বিবরণ (বাংলা)
              </label>
              <textarea
                rows={3}
                required
                value={seo.metaDescription.bn}
                onChange={(e) =>
                  setSeo({
                    ...seo,
                    metaDescription: { ...seo.metaDescription, bn: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Meta Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="online tools, pdf compressor, sobtools, image resizer..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Social Share & Verification Tags */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white">Social Sharing & Search Console Verification</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                OpenGraph Share Image URL
              </label>
              <input
                type="url"
                value={seo.ogImageUrl}
                onChange={(e) => setSeo({ ...seo, ogImageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Canonical Base URL
              </label>
              <input
                type="url"
                value={seo.canonicalBaseUrl}
                onChange={(e) => setSeo({ ...seo, canonicalBaseUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Twitter/X Handle
              </label>
              <input
                type="text"
                value={seo.twitterHandle}
                onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                placeholder="@SobToolsOfficial"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Google Search Console Tag
              </label>
              <input
                type="text"
                value={seo.googleVerification}
                onChange={(e) => setSeo({ ...seo, googleVerification: e.target.value })}
                placeholder="Google verification token"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Bing Webmaster Verification
              </label>
              <input
                type="text"
                value={seo.bingVerification}
                onChange={(e) => setSeo({ ...seo, bingVerification: e.target.value })}
                placeholder="Bing verification token"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Robots.txt & Sitemap Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white">Robots.txt Content</h3>
            <textarea
              rows={8}
              value={seo.robotsTxtContent}
              onChange={(e) => setSeo({ ...seo, robotsTxtContent: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Dynamic XML Sitemap Preview</h3>
              <button
                type="button"
                onClick={handleCopySitemap}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSitemap ? 'Copied XML!' : 'Copy Sitemap'}</span>
              </button>
            </div>
            <textarea
              rows={8}
              readOnly
              value={generateSitemapXml()}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save SEO Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
