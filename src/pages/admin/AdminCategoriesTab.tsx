import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { CategoryDefinition, ToolDefinition } from '../../types';
import { saveCategory, deleteCategory } from '../../services/cmsService';

interface CategoriesTabProps {
  categories: CategoryDefinition[];
  tools: ToolDefinition[];
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'CATEGORY', details: string, targetId?: string) => void;
}

export const AdminCategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  tools,
  onRefresh,
  onLogAudit,
}) => {
  const [editingCategory, setEditingCategory] = useState<CategoryDefinition | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const getToolCountForCategory = (catId: string) => {
    return tools.filter((t) => t.category === catId).length;
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingCategory({
      id: '',
      slug: '',
      name: { en: '', bn: '' },
      description: { en: '', bn: '' },
      icon: 'Layers',
      color: 'from-blue-500 to-indigo-500',
      displayOrder: categories.length + 1,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.id || !editingCategory.name.en) {
      alert('Please provide category ID and English name.');
      return;
    }

    setSaving(true);
    try {
      const sanitized: CategoryDefinition = {
        ...editingCategory,
        id: editingCategory.id.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
        slug: editingCategory.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '') || editingCategory.id,
      };

      await saveCategory(sanitized);
      onLogAudit(
        isCreating ? 'CATEGORY_CREATE' : 'CATEGORY_UPDATE',
        'CATEGORY',
        `Category: ${sanitized.name.en} (${sanitized.id})`,
        sanitized.id
      );
      setEditingCategory(null);
      setIsCreating(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: CategoryDefinition) => {
    const count = getToolCountForCategory(cat.id);
    if (count > 0) {
      alert(`Cannot delete category "${cat.name.en}" because ${count} tools are currently assigned to it.`);
      return;
    }
    if (!confirm(`Are you sure you want to delete category "${cat.name.en}"?`)) return;

    try {
      await deleteCategory(cat.id);
      onLogAudit('CATEGORY_DELETE', 'CATEGORY', `Deleted category ${cat.name.en} (${cat.id})`, cat.id);
      onRefresh();
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Add Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Category Management CMS</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Categories organize the tools catalog, navigation header dropdown, and category routes.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((c) => {
          const count = getToolCountForCategory(c.id);
          return (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${c.color || 'from-indigo-500 to-cyan-500'} flex items-center justify-center text-white shadow-md`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{c.name.en}</div>
                      <div className="text-xs text-slate-400">{c.name.bn}</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {count} Tools
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {c.description.en}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {c.description.bn}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-4">
                  <span>ID: {c.id}</span>
                  <span>•</span>
                  <span>Slug: /category/{c.slug}</span>
                  <span>•</span>
                  <span>Order: {c.displayOrder || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCategory(JSON.parse(JSON.stringify(c)));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-800/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsCreating(false);
              }}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              {isCreating ? 'Create New Category' : 'Edit Category'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Configure category details for navigation and sorting.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category ID</label>
                  <input
                    type="text"
                    required
                    disabled={!isCreating}
                    value={editingCategory.id}
                    onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value })}
                    placeholder="e.g. image"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.slug}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    placeholder="e.g. image"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name.en}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: { ...editingCategory.name, en: e.target.value },
                      })
                    }
                    placeholder="e.g. Image Tools"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">নাম (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name.bn}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: { ...editingCategory.name, bn: e.target.value },
                      })
                    }
                    placeholder="যেমন: ইমেজ টুলস"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  required
                  value={editingCategory.description.en}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: { ...editingCategory.description, en: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">বিবরণ (বাংলা)</label>
                <textarea
                  rows={2}
                  required
                  value={editingCategory.description.bn}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      description: { ...editingCategory.description, bn: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Gradient Colors</label>
                  <input
                    type="text"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                    placeholder="from-blue-500 to-cyan-500"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingCategory.displayOrder || 1}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        displayOrder: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCreating(false);
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
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
