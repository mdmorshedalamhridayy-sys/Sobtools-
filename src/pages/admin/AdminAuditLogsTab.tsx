import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Tag,
} from 'lucide-react';
import { AdminAuditLog } from '../../types';

interface AuditLogsProps {
  logs: AdminAuditLog[];
}

export const AdminAuditLogsTab: React.FC<AuditLogsProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetId && log.targetId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sobtools_audit_logs_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'USER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'TOOL':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'AD':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'CATEGORY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'AUTH':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'ANNOUNCEMENT':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Immutable Administrative Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically sealed audit trail of all administrative updates, user suspensions, and configuration changes.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export Logs JSON</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by action, admin email, details, or target..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="USER">User Actions</option>
                <option value="TOOL">Tool Changes</option>
                <option value="AD">Ad Settings</option>
                <option value="CATEGORY">Category Changes</option>
                <option value="CMS">CMS Content</option>
                <option value="ANNOUNCEMENT">Announcements</option>
                <option value="AUTH">Role Privileges</option>
                <option value="SETTINGS">Site Settings</option>
              </select>
            </div>

            <span className="text-xs text-slate-400">
              Showing {filtered.length} of {logs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Admin Account</th>
                <th className="py-3 px-4 font-semibold">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-semibold text-white">
                      {log.action}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadgeStyle(
                          log.category
                        )}`}
                      >
                        {log.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-indigo-300 font-mono text-[11px]">
                      {log.adminEmail}
                    </td>

                    <td className="py-3 px-4 text-slate-300 leading-relaxed">
                      {log.details}
                      {log.targetId && (
                        <span className="font-mono text-[10px] text-slate-500 ml-1.5">
                          (Target: {log.targetId})
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
