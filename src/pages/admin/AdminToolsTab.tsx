import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Filter,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  RefreshCw,
  Loader2,
  X,
  Save,
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  Sliders,
} from 'lucide-react';
import { ToolDefinition, CategoryDefinition, ToolStatus, ToolType } from '../../types';
import { saveToolMetadata, deleteToolMetadata, seedAllDefaultTools } from '../../services/cmsService';

interface ToolsTabProps {
  tools: ToolDefinition[];
  categories: CategoryDefinition[];
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'TOOL', details: string, targetId?: string) => void;
}

export const AdminToolsTab: React.FC<ToolsTabProps> = ({
  tools,
  categories,
  onRefresh,
  onLogAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit / Create Tool Modal State
  const [editingTool, setEditingTool] = useState<ToolDefinition | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [keywordsText, setKeywordsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTools = tools.filter((t) => {
    const matchesSearch =
      t.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenCreate = () => {
    setIsCreatingNew(true);
    setKeywordsText('');
    setEditingTool({
      id: '',
      slug: '',
      category: categories[0]?.id || 'creator',
      name: { en: '', bn: '' },
      shortDescription: { en: '', bn: '' },
      description: { en: '', bn: '' },
      icon: 'Wrench',
      keywords: [],
      popular: false,
      featured: false,
      status: 'ready',
      isLocalOnly: true,
      displayOrder: tools.length + 1,
      toolType: 'interactive',
      embedUrl: '',
      customHtml: '',
    });
  };

  const handleOpenEdit = (t: ToolDefinition) => {
    setIsCreatingNew(false);
    setKeywordsText(t.keywords ? t.keywords.join(', ') : '');
    setEditingTool(JSON.parse(JSON.stringify(t)));
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;

    if (!editingTool.name.en.trim() || !editingTool.slug.trim()) {
      alert('Please provide tool name and URL slug.');
      return;
    }

    setSaving(true);
    try {
      const sanitizedSlug = editingTool.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]/g, '-');
      const toolId = isCreatingNew ? (editingTool.id.trim() || sanitizedSlug) : editingTool.id;

      const parsedKeywords = keywordsText
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const payload: ToolDefinition = {
        ...editingTool,
        id: toolId,
        slug: sanitizedSlug,
        keywords: parsedKeywords,
      };

      await saveToolMetadata(payload);
      onLogAudit(
        isCreatingNew ? 'TOOL_CREATE' : 'TOOL_UPDATE',
        'TOOL',
        `${isCreatingNew ? 'Created' : 'Updated'} tool: ${payload.name.en} (${payload.slug})`,
        payload.id
      );

      setEditingTool(null);
      setIsCreatingNew(false);
      onRefresh();
      showToast(isCreatingNew ? 'New tool added successfully!' : 'Tool updated successfully!');
    } catch (err) {
      console.error('Error saving tool metadata:', err);
      alert('Failed to save tool. Please check your network and permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTool = async (t: ToolDefinition) => {
    if (!confirm(`Are you sure you want to permanently delete the tool "${t.name.en}" (${t.id})?`)) {
      return;
    }

    try {
      await deleteToolMetadata(t.id);
      onLogAudit('TOOL_DELETE', 'TOOL', `Deleted tool: ${t.name.en} (${t.id})`, t.id);
      onRefresh();
      showToast(`Tool "${t.name.en}" deleted.`);
    } catch (err) {
      console.error('Error deleting tool:', err);
      alert('Failed to delete tool.');
    }
  };

  // Inline Quick Toggle Status
  const handleQuickStatusChange = async (tool: ToolDefinition, newStatus: ToolStatus) => {
    setStatusUpdatingId(tool.id);
    const updated = { ...tool, status: newStatus };
    try {
      await saveToolMetadata(updated);
      onLogAudit('TOOL_STATUS_CHANGE', 'TOOL', `Changed status of ${tool.name.en} to ${newStatus}`, tool.id);
      onRefresh();
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Inline Quick Toggle Popular
  const handleQuickTogglePopular = async (tool: ToolDefinition) => {
    const updated = { ...tool, popular: !tool.popular };
    try {
      await saveToolMetadata(updated);
      onLogAudit('TOOL_UPDATE', 'TOOL', `Toggled popular for ${tool.name.en}`, tool.id);
      onRefresh();
      showToast(updated.popular ? 'Marked as Popular' : 'Unmarked Popular');
    } catch (err) {
      console.error('Error toggling popular:', err);
    }
  };

  // Inline Quick Toggle Featured
  const handleQuickToggleFeatured = async (tool: ToolDefinition) => {
    const updated = { ...tool, featured: !tool.featured };
    try {
      await saveToolMetadata(updated);
      onLogAudit('TOOL_UPDATE', 'TOOL', `Toggled featured for ${tool.name.en}`, tool.id);
      onRefresh();
      showToast(updated.featured ? 'Marked as Featured' : 'Unmarked Featured');
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const handleSeedDefaults = async () => {
    if (!confirm('This will synchronize all 39 static tools into Firestore database documents. Continue?')) {
      return;
    }
    setSeeding(true);
    try {
      await seedAllDefaultTools();
      onLogAudit('TOOL_SEED', 'TOOL', 'Seeded all default tools into Firestore');
      onRefresh();
      showToast('All default tools seeded successfully!');
    } catch (err) {
      console.error('Error seeding default tools:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Controls & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-400" />
              <span>Tool Management & Dynamic CMS ({tools.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add new tools, configure metadata, toggle visibility, and control display orders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Tool</span>
            </button>

            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Populate Firestore collection with all 39 built-in tools"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Seed Defaults</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by English/Bengali name or slug..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="ready">Ready (Active)</option>
                <option value="beta">Beta</option>
                <option value="maintenance">Maintenance</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 ml-2">
              Showing {filteredTools.length} of {tools.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tools Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Tool Name & Slug</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Badges</th>
                <th className="py-3 px-4 font-semibold">Live Status</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Order</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No tools matching search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTools.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{t.name.en}</div>
                      <div className="text-[11px] text-slate-400">{t.name.bn}</div>
                      <div className="text-[10px] font-mono text-indigo-400 mt-0.5">/tools/{t.slug}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePopular(t)}
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            t.popular
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title="Click to toggle Popular badge"
                        >
                          <Flame className="w-3 h-3" />
                          <span>Popular</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleQuickToggleFeatured(t)}
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            t.featured
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                          }`}
                          title="Click to toggle Featured badge"
                        >
                          <Star className="w-3 h-3" />
                          <span>Featured</span>
                        </button>
                      </div>
                    </td>

                    {/* Inline Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        disabled={statusUpdatingId === t.id}
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t, e.target.value as ToolStatus)}
                        className={`text-[11px] font-semibold rounded-lg px-2 py-1 outline-none border cursor-pointer ${
                          t.status === 'ready'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : t.status === 'beta'
                            ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                            : t.status === 'maintenance'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/10 text-red-300 border-red-500/30'
                        }`}
                      >
                        <option value="ready">Ready (Active)</option>
                        <option value="beta">Beta</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-slate-400 capitalize text-[11px]">
                      {t.toolType || 'interactive'}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                      {t.displayOrder || 0}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Edit tool details"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteTool(t)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Delete tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Tool Modal */}
      {editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setEditingTool(null);
                setIsCreatingNew(false);
              }}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {isCreatingNew ? 'Add New Online Tool' : 'Edit Tool Metadata & Visibility'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure tool properties, routing slug, execution mechanism, and SEO keywords.
            </p>

            <form onSubmit={handleSaveTool} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tool Unique ID / Slug *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isCreatingNew}
                    value={editingTool.slug}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        slug: e.target.value,
                        id: isCreatingNew ? e.target.value : editingTool.id,
                      })
                    }
                    placeholder="e.g. svg-optimizer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    URL: /tools/{editingTool.slug || 'slug'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tool Type</label>
                  <select
                    value={editingTool.toolType || 'interactive'}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        toolType: e.target.value as ToolType,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="interactive">Built-in Client Tool (React)</option>
                    <option value="iframe">Embedded Web App (Iframe Sandbox)</option>
                    <option value="external">External Utility (Outbound Portal)</option>
                    <option value="custom_code">Custom HTML/JS Widget</option>
                  </select>
                </div>
              </div>

              {/* Conditional Embed or External URL */}
              {(editingTool.toolType === 'iframe' || editingTool.toolType === 'external') && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    External / Embed URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={editingTool.embedUrl || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, embedUrl: e.target.value })}
                    placeholder="https://example.com/tool-view"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {editingTool.toolType === 'custom_code' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Embed HTML / Code
                  </label>
                  <textarea
                    rows={4}
                    value={editingTool.customHtml || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, customHtml: e.target.value })}
                    placeholder="<div id='my-widget'>...</div>"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tool Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTool.name.en}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        name: { ...editingTool.name, en: e.target.value },
                      })
                    }
                    placeholder="e.g. SVG Optimizer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    টুলের নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTool.name.bn}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        name: { ...editingTool.name, bn: e.target.value },
                      })
                    }
                    placeholder="যেমন: এসভিজি অপটিমাইজার"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={editingTool.category}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tool Status</label>
                  <select
                    value={editingTool.status}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, status: e.target.value as ToolStatus })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="ready">Ready (Active)</option>
                    <option value="beta">Beta</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingTool.displayOrder || 0}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, displayOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="flex items-center gap-6 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(editingTool.popular)}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, popular: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                  />
                  <span>Mark as Popular 🔥</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(editingTool.featured)}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                  />
                  <span>Mark as Featured ⭐</span>
                </label>
              </div>

              {/* Short Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Short Description (EN)
                  </label>
                  <textarea
                    rows={2}
                    value={editingTool.shortDescription.en}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        shortDescription: { ...editingTool.shortDescription, en: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    সংক্ষিপ্ত বিবরণ (BN)
                  </label>
                  <textarea
                    rows={2}
                    value={editingTool.shortDescription.bn}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        shortDescription: { ...editingTool.shortDescription, bn: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Search Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="e.g. image, compress, resize, ছবির মাপ..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              {/* Maintenance notice */}
              {editingTool.status === 'maintenance' && (
                <div>
                  <label className="block text-xs font-medium text-amber-400 mb-1">
                    Maintenance Notice
                  </label>
                  <input
                    type="text"
                    value={editingTool.maintenanceMessage?.en || ''}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        maintenanceMessage: {
                          en: e.target.value,
                          bn: editingTool.maintenanceMessage?.bn || e.target.value,
                        },
                      })
                    }
                    placeholder="This tool is undergoing maintenance..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-800/60 text-xs text-white outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTool(null);
                    setIsCreatingNew(false);
                  }}
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
                  <span>{isCreatingNew ? 'Create Tool' : 'Save Tool Metadata'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
