import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Lock,
  Unlock,
  Shield,
  Trash2,
  FileText,
  AlertTriangle,
  Loader2,
  X,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../../config/firebase';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { ADMIN_BOOTSTRAP_EMAIL } from '../../context/AuthContext';

interface ManagedUser {
  uid: string;
  displayName?: string;
  email: string;
  role?: string;
  isSuspended?: boolean;
  createdAt?: string;
  preferredLanguage?: string;
  theme?: string;
  adminNotes?: string;
}

interface UsersTabProps {
  users: ManagedUser[];
  onRefresh: () => void;
  onLogAudit: (action: string, category: 'USER', details: string, targetId?: string) => void;
}

export const AdminUsersTab: React.FC<UsersTabProps> = ({ users, onRefresh, onLogAudit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'moderator'>('all');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingUser, setDeletingUser] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'suspended'
        ? Boolean(u.isSuspended)
        : !u.isSuspended;

    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'admin'
        ? u.role === 'admin' || u.role === 'superadmin'
        : (u.role || 'user') === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleToggleSuspend = async (u: ManagedUser) => {
    if (u.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) {
      alert('Master Super Admin account cannot be suspended.');
      return;
    }

    setUpdatingUid(u.uid);
    const newStatus = !u.isSuspended;
    try {
      await updateDoc(doc(db, 'users', u.uid), {
        isSuspended: newStatus,
        updatedAt: new Date().toISOString(),
      });
      onLogAudit(
        newStatus ? 'USER_SUSPEND' : 'USER_REACTIVATE',
        'USER',
        `User ${u.email} account status changed to ${newStatus ? 'Suspended' : 'Active'}`,
        u.uid
      );
      onRefresh();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${u.uid}`);
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleChangeRole = async (u: ManagedUser, newRole: string) => {
    if (u.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() && newRole !== 'admin') {
      alert('Master Super Admin cannot be demoted.');
      return;
    }

    setUpdatingUid(u.uid);
    try {
      await updateDoc(doc(db, 'users', u.uid), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      if (newRole === 'admin') {
        await setDoc(doc(db, 'admins', u.uid), {
          uid: u.uid,
          email: u.email,
          role: 'admin',
          assignedAt: new Date().toISOString(),
        }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'admins', u.uid)).catch(() => {});
      }

      onLogAudit(
        'USER_ROLE_CHANGE',
        'USER',
        `Changed role of ${u.email} to ${newRole}`,
        u.uid
      );
      onRefresh();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${u.uid}`);
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedUser) return;
    setSavingNotes(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser.uid), {
        adminNotes: adminNotes.trim(),
        updatedAt: new Date().toISOString(),
      });
      onLogAudit(
        'USER_NOTES_UPDATE',
        'USER',
        `Updated admin notes for user ${selectedUser.email}`,
        selectedUser.uid
      );
      setSelectedUser((prev) => (prev ? { ...prev, adminNotes: adminNotes.trim() } : null));
      onRefresh();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${selectedUser.uid}`);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) {
      alert('Master Super Admin account cannot be deleted.');
      return;
    }
    if (deleteConfirmation.trim().toLowerCase() !== userToDelete.email.toLowerCase()) {
      alert('Confirmation email does not match.');
      return;
    }

    setDeletingUser(true);
    try {
      await deleteDoc(doc(db, 'users', userToDelete.uid));
      await deleteDoc(doc(db, 'admins', userToDelete.uid)).catch(() => {});
      onLogAudit(
        'USER_DELETE',
        'USER',
        `Permanently deleted user document for ${userToDelete.email}`,
        userToDelete.uid
      );
      setUserToDelete(null);
      setDeleteConfirmation('');
      onRefresh();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userToDelete.uid}`);
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or UID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
                <option value="moderator">Moderators</option>
              </select>
            </div>

            <span className="text-xs text-slate-400 ml-2">
              Showing {filteredUsers.length} of {users.length}
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Registered</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isMaster = u.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();
                  return (
                    <tr key={u.uid} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{u.displayName || 'SobTools User'}</span>
                          {isMaster && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              OWNER
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                          {u.uid}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-300">
                        {u.email}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          disabled={isMaster || updatingUid === u.uid}
                          value={u.role || 'user'}
                          onChange={(e) => handleChangeRole(u, e.target.value)}
                          className={`text-[11px] font-semibold rounded-lg px-2 py-1 outline-none border cursor-pointer ${
                            u.role === 'admin' || isMaster
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                              : u.role === 'moderator'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Details / Notes */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setAdminNotes(u.adminNotes || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="View details & notes"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Suspend / Reactivate */}
                          {!isMaster && (
                            <button
                              onClick={() => handleToggleSuspend(u)}
                              disabled={updatingUid === u.uid}
                              className={`p-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                                u.isSuspended
                                  ? 'text-emerald-400 hover:bg-emerald-950/40'
                                  : 'text-amber-400 hover:bg-amber-950/40'
                              }`}
                              title={u.isSuspended ? 'Reactivate User' : 'Suspend User'}
                            >
                              {updatingUid === u.uid ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : u.isSuspended ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Delete */}
                          {!isMaster && (
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details & Notes Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">User Account Details</h3>
            <p className="text-xs text-slate-400 mb-4">{selectedUser.email}</p>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">UID:</span>
                <span className="font-mono text-slate-300 select-all">{selectedUser.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Display Name:</span>
                <span className="text-white font-medium">{selectedUser.displayName || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role:</span>
                <span className="capitalize text-indigo-400 font-semibold">{selectedUser.role || 'user'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={selectedUser.isSuspended ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {selectedUser.isSuspended ? 'Suspended' : 'Active'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Preferred Language:</span>
                <span className="text-white uppercase">{selectedUser.preferredLanguage || 'bn'}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Internal Admin Notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Private administrative notes regarding this user..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">Delete User Account</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              This action will permanently delete user document and permissions for{' '}
              <strong className="text-white">{userToDelete.email}</strong>.
            </p>

            <div className="mb-4">
              <label className="block text-xs text-slate-300 mb-1">
                Type user email to confirm deletion:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={userToDelete.email}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser || deleteConfirmation.trim().toLowerCase() !== userToDelete.email.toLowerCase()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
              >
                {deletingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
