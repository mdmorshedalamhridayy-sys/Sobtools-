import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Radio,
  Clock,
  XCircle,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { ActiveSession } from '../../types';
import { removeActiveSession, fetchActiveSessions } from '../../services/cmsService';

interface ActiveSessionsProps {
  initialSessions: ActiveSession[];
  onLogAudit: (action: string, category: 'USER', details: string, targetId?: string) => void;
}

export const AdminActiveSessionsTab: React.FC<ActiveSessionsProps> = ({
  initialSessions,
  onLogAudit,
}) => {
  const [sessions, setSessions] = useState<ActiveSession[]>(initialSessions);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const live = await fetchActiveSessions(5);
      setSessions(live);
    } catch (err) {
      console.warn('Error fetching live sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadSessions();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleTerminateSession = async (s: ActiveSession) => {
    if (!confirm(`Forcibly terminate session for ${s.email}?`)) return;
    try {
      await removeActiveSession(s.sessionId);
      setSessions((prev) => prev.filter((item) => item.sessionId !== s.sessionId));
      onLogAudit(
        'SESSION_TERMINATE',
        'USER',
        `Forcibly terminated active session ${s.sessionId} for ${s.email}`,
        s.uid
      );
    } catch (err) {
      console.warn('Error terminating session:', err);
    }
  };

  const getRelativeTime = (isoString: string): string => {
    const ms = Date.now() - new Date(isoString).getTime();
    const seconds = Math.floor(ms / 1000);
    if (seconds < 20) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const getDeviceIcon = (type?: string) => {
    if (type === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-indigo-400" />;
    if (type === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-cyan-400" />;
    return <Monitor className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar with Live Indicator & Auto-refresh */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Real-Time Active Visitors & Sessions</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {sessions.length} Live
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sessions actively pinging heartbeats within the last 5-minute sliding window.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <span>Auto-refresh (15s)</span>
          </label>

          <button
            onClick={loadSessions}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Active Sessions Grid / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">User Profile</th>
                <th className="py-3 px-4 font-semibold">Current Viewing Location</th>
                <th className="py-3 px-4 font-semibold">Device</th>
                <th className="py-3 px-4 font-semibold">Last Heartbeat</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No active user sessions currently recorded.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.sessionId} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                          {(s.displayName?.[0] || s.email[0] || 'U').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">
                            {s.displayName || 'SobTools User'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{s.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{s.currentPath || '/'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        {getDeviceIcon(s.deviceType)}
                        <span className="text-[11px] font-medium">{s.deviceType || 'Desktop'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-300 text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{getRelativeTime(s.lastSeen)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Active</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleTerminateSession(s)}
                        className="px-2.5 py-1 rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-800/40 text-[10px] font-semibold transition-colors inline-flex items-center gap-1"
                        title="Force disconnect this session"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Terminate</span>
                      </button>
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
