import React, { useState } from 'react';
import {
  Users,
  Activity,
  Wrench,
  Layers,
  Megaphone,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Palette,
  Mail,
  Database,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { ToolDefinition, CategoryDefinition, ActiveSession, AdminAuditLog } from '../../types';
import { purgeStaleSessions } from '../../services/cmsService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface ManagedUser {
  uid: string;
  displayName?: string;
  email: string;
  role?: string;
  isSuspended?: boolean;
  createdAt?: string;
}

interface OverviewProps {
  users: ManagedUser[];
  activeSessions: ActiveSession[];
  tools: ToolDefinition[];
  categories: CategoryDefinition[];
  auditLogs: AdminAuditLog[];
  onNavigateTab: (tab: string) => void;
  onToggleSuspendUser: (user: ManagedUser) => void;
}

export const AdminOverviewTab: React.FC<OverviewProps> = ({
  users,
  activeSessions,
  tools,
  categories,
  auditLogs,
  onNavigateTab,
  onToggleSuspendUser,
}) => {
  const suspendedCount = users.filter((u) => u.isSuspended).length;
  const recentUsers = users.slice(0, 5);
  const recentLogs = auditLogs.slice(0, 5);

  const [dbLatency, setDbLatency] = useState<number | null>(null);
  const [testingLatency, setTestingLatency] = useState(false);
  const [purgingSessions, setPurgingSessions] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState<string | null>(null);

  const handleTestLatency = async () => {
    setTestingLatency(true);
    const start = performance.now();
    try {
      await getDoc(doc(db, 'siteSettings', 'general'));
      const end = performance.now();
      const latency = Math.round(end - start);
      setDbLatency(latency);
      setMaintenanceMsg(`Firestore Ping: ${latency}ms latency`);
    } catch {
      setDbLatency(-1);
      setMaintenanceMsg('Firestore ping failed or offline');
    } finally {
      setTestingLatency(false);
      setTimeout(() => setMaintenanceMsg(null), 4000);
    }
  };

  const handlePurgeSessions = async () => {
    if (!window.confirm('Purge active user session heartbeats older than 30 minutes?')) return;
    setPurgingSessions(true);
    try {
      const purged = await purgeStaleSessions(30);
      setMaintenanceMsg(`Purged ${purged} inactive visitor sessions.`);
    } catch (err: any) {
      setMaintenanceMsg('Purge failed: ' + err.message);
    } finally {
      setPurgingSessions(false);
      setTimeout(() => setMaintenanceMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Platform Status Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>SobTools System Operational</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Firestore Sync & Realtime Auth are running with 0 degraded services.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestLatency}
            disabled={testingLatency}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Check Firestore Roundtrip Latency"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>{testingLatency ? 'Pinging...' : dbLatency !== null ? `${dbLatency}ms` : 'Ping DB'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('active-users')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{activeSessions.length} Active Now</span>
          </button>
          <button
            onClick={() => onNavigateTab('settings')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            Site Settings
          </button>
        </div>
      </div>

      {maintenanceMsg && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            {maintenanceMsg}
          </span>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('users')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <span>{suspendedCount} suspended</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">{users.length - suspendedCount} active</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('active-users')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Live Active (5m)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-400">{activeSessions.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Heartbeat verified sessions</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('tools')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Platform Tools</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{tools.length}</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">All 100% browser client-side</div>
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('categories')}
          className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Categories</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">{categories.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Organized tool categories</div>
          </div>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Quick Management Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateTab('tools')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all"
          >
            <Zap className="w-4 h-4 text-indigo-400 mb-2" />
            <div className="text-xs font-semibold text-white">Manage Tools</div>
            <div className="text-[10px] text-slate-400">Add, edit & order</div>
          </button>
          <button
            onClick={() => onNavigateTab('theme')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all"
          >
            <Palette className="w-4 h-4 text-pink-400 mb-2" />
            <div className="text-xs font-semibold text-white">Theme & Colors</div>
            <div className="text-[10px] text-slate-400">6 color palettes & dark mode</div>
          </button>
          <button
            onClick={() => onNavigateTab('messages')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all"
          >
            <Mail className="w-4 h-4 text-sky-400 mb-2" />
            <div className="text-xs font-semibold text-white">Inbox Inquiries</div>
            <div className="text-[10px] text-slate-400">Support messages</div>
          </button>
          <button
            onClick={() => onNavigateTab('advertisements')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all"
          >
            <Megaphone className="w-4 h-4 text-amber-400 mb-2" />
            <div className="text-xs font-semibold text-white">Configure Ads</div>
            <div className="text-[10px] text-slate-400">AdSense & banner slots</div>
          </button>
          <button
            onClick={() => onNavigateTab('homepage')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition-all"
          >
            <Layers className="w-4 h-4 text-cyan-400 mb-2" />
            <div className="text-xs font-semibold text-white">Homepage Editor</div>
            <div className="text-[10px] text-slate-400">Hero & section ordering</div>
          </button>
          <button
            onClick={handlePurgeSessions}
            disabled={purgingSessions}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 text-left transition-all"
            title="Clean up stale visitor session heartbeats from Firestore"
          >
            <Trash2 className="w-4 h-4 text-rose-400 mb-2" />
            <div className="text-xs font-semibold text-white">Purge Sessions</div>
            <div className="text-[10px] text-slate-400">{purgingSessions ? 'Purging...' : 'Clean stale data'}</div>
          </button>
        </div>
      </div>

      {/* Two-Column Detail Split: Recent Users & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Recent Registrations</span>
            </h3>
            <button
              onClick={() => onNavigateTab('users')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No users registered yet.</p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u.uid}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">
                      {u.displayName || 'SobTools User'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.isSuspended
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                    <button
                      onClick={() => onToggleSuspendUser(u)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors"
                    >
                      {u.isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin Activity Stream</span>
            </h3>
            <button
              onClick={() => onNavigateTab('audit-logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
            >
              <span>View Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No recorded admin actions yet.</p>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-indigo-300">{log.action}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{log.details}</p>
                  <div className="text-[10px] text-slate-500 mt-1">By: {log.adminEmail}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
