import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  Lock,
  Save,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { AdminRoleItem } from '../../types';
import { saveAdminRole, removeAdminRole } from '../../services/cmsService';
import { ADMIN_BOOTSTRAP_EMAIL } from '../../context/AuthContext';

interface RolesTabProps {
  roles: AdminRoleItem[];
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'AUTH', details: string, targetId?: string) => void;
}

export const AdminRolesTab: React.FC<RolesTabProps> = ({ roles, onRefresh, onLogAudit }) => {
  const [creating, setCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'super_admin' | 'admin' | 'moderator'>('admin');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const sanitizedEmail = email.trim().toLowerCase();
    const uid = `admin_${sanitizedEmail.replace(/[^a-z0-9]/g, '_')}`;

    const newRole: AdminRoleItem = {
      uid,
      email: sanitizedEmail,
      role: selectedRole,
      assignedAt: new Date().toISOString(),
      assignedBy: 'Super Admin Console',
      notes: notes.trim(),
    };

    try {
      await saveAdminRole(newRole);
      onLogAudit(
        'ROLE_ASSIGN',
        'AUTH',
        `Assigned ${selectedRole} permissions to ${sanitizedEmail}`,
        uid
      );
      setEmail('');
      setNotes('');
      setCreating(false);
      onRefresh();
    } catch (err) {
      console.error('Error assigning role:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (item: AdminRoleItem) => {
    if (item.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) {
      alert('Master Super Admin privileges are permanent and cannot be revoked.');
      return;
    }
    if (!confirm(`Revoke administrative access for ${item.email}?`)) return;

    try {
      await removeAdminRole(item.uid);
      onLogAudit('ROLE_REVOKE', 'AUTH', `Revoked ${item.role} permissions for ${item.email}`, item.uid);
      onRefresh();
    } catch (err) {
      console.error('Error revoking role:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <span>Admin Roles & Permissions (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage administrative personnel, permission delegations, and security levels.
          </p>
        </div>

        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Assign Admin Role</span>
        </button>
      </div>

      {/* Role explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 text-xs">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Super Admin</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Unrestricted root authority over the entire platform, rules deployment, role assignments, and all CMS collections.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/30 text-xs">
          <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Can manage tools, categories, advertisements, CMS content, and view/suspend user accounts.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs">
          <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Moderator</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Read access to user profiles, active visitor sessions, and can broadcast announcements.
          </p>
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Admin Account</th>
                <th className="py-3 px-4 font-semibold">Assigned Role</th>
                <th className="py-3 px-4 font-semibold">Assigned By</th>
                <th className="py-3 px-4 font-semibold">Notes</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {roles.map((r) => {
                const isMaster = r.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
                return (
                  <tr key={r.uid} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <span>{r.email}</span>
                        {isMaster && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            IMMUTABLE
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">{r.uid}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.role === 'super_admin'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : r.role === 'admin'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {r.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {r.assignedBy || 'Console'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                      {r.notes || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isMaster ? (
                        <span className="text-[10px] text-amber-400 font-mono">Protected</span>
                      ) : (
                        <button
                          onClick={() => handleRevoke(r)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-800/40 text-[10px] font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Role Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setCreating(false)}
              className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Assign Admin Role</h3>
            <p className="text-xs text-slate-400 mb-6">
              Grant elevated platform management authority to a user account.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Level</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="admin">Admin (Manage Tools, Ads, CMS, Users)</option>
                  <option value="moderator">Moderator (View Sessions & Announcements)</option>
                  <option value="super_admin">Super Admin (Full Root System Authority)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for granting admin access..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

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
                  <span>Grant Privileges</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
