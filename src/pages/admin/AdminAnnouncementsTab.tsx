import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  AlertCircle,
  Save,
  Loader2,
  X,
  Radio,
} from 'lucide-react';
import { AnnouncementItem } from '../../types';
import { saveAnnouncement, deleteAnnouncement } from '../../services/cmsService';

interface AnnouncementsTabProps {
  announcements: AnnouncementItem[];
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'ANNOUNCEMENT', details: string, targetId?: string) => void;
}

export const AdminAnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcements,
  onRefresh,
  onLogAudit,
}) => {
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<AnnouncementItem['type']>('info');
  const [targetAudience, setTargetAudience] = useState<AnnouncementItem['targetAudience']>('all');
  const [placement, setPlacement] = useState<AnnouncementItem['placement']>('all');
  const [dismissible, setDismissible] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setLoading(true);
    const id = `ann_${Date.now()}`;
    const ann: AnnouncementItem = {
      id,
      title: newTitle.trim(),
      content: newContent.trim(),
      type: newType,
      active: true,
      targetAudience,
      placement,
      dismissible,
      createdAt: new Date().toISOString(),
    };

    try {
      await saveAnnouncement(ann);
      onLogAudit('ANNOUNCEMENT_CREATE', 'ANNOUNCEMENT', `Created announcement: ${ann.title}`, id);
      setNewTitle('');
      setNewContent('');
      setCreating(false);
      onRefresh();
    } catch (err) {
      console.error('Error creating announcement:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (ann: AnnouncementItem) => {
    const updated = { ...ann, active: !ann.active };
    try {
      await saveAnnouncement(updated);
      onLogAudit(
        'ANNOUNCEMENT_TOGGLE',
        'ANNOUNCEMENT',
        `Toggled announcement ${ann.title} to ${updated.active ? 'ACTIVE' : 'INACTIVE'}`,
        ann.id
      );
      onRefresh();
    } catch (err) {
      console.error('Error toggling announcement:', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete announcement "${title}"?`)) return;
    try {
      await deleteAnnouncement(id);
      onLogAudit('ANNOUNCEMENT_DELETE', 'ANNOUNCEMENT', `Deleted announcement: ${title}`, id);
      onRefresh();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  const getBadgeStyle = (type: string) => {
    if (type === 'warning') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (type === 'success') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (type === 'alert') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <span>Broadcast Announcements & Alerts</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast emergency alerts, maintenance schedules, or new feature highlights to users.
          </p>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            No announcements currently published.
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.active
                  ? 'bg-slate-900 border-slate-800 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800/60 opacity-60'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getBadgeStyle(
                      item.type
                    )}`}
                  >
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                  <span className="text-[10px] text-slate-500">
                    Audience: <strong className="text-slate-300 capitalize">{item.targetAudience}</strong>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Location: <strong className="text-slate-300 capitalize">{item.placement}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">{item.content}</p>
                <div className="text-[10px] text-slate-500">
                  Published: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    item.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {item.active ? 'ACTIVE' : 'DRAFT'}
                </button>

                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setCreating(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Create Broadcast Announcement</h3>
            <p className="text-xs text-slate-400 mb-6">
              Publish an immediate banner message to users across the platform.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Scheduled System Upgrade"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="success">Success (Green)</option>
                    <option value="alert">Alert (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Visitors</option>
                    <option value="logged_in">Logged In Only</option>
                    <option value="unregistered">Unregistered Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Placement</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="all">Everywhere</option>
                    <option value="header_banner">Top Header</option>
                    <option value="dashboard_banner">User Dashboard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Broadcast Message Body</label>
                <textarea
                  rows={4}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Details of the announcement..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={dismissible}
                  onChange={(e) => setDismissible(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <span>Allow users to dismiss / close banner</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Publish Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
