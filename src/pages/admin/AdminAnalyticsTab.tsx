import React from 'react';
import {
  BarChart3,
  Download,
  Users,
  Wrench,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
} from 'lucide-react';
import { ToolDefinition, CategoryDefinition, ActiveSession } from '../../types';

interface AnalyticsProps {
  usersCount: number;
  tools: ToolDefinition[];
  categories: CategoryDefinition[];
  activeSessions: ActiveSession[];
}

export const AdminAnalyticsTab: React.FC<AnalyticsProps> = ({
  usersCount,
  tools,
  categories,
  activeSessions,
}) => {
  // Device breakdown from live sessions
  const mobileCount = activeSessions.filter((s) => s.deviceType === 'Mobile').length;
  const tabletCount = activeSessions.filter((s) => s.deviceType === 'Tablet').length;
  const desktopCount = activeSessions.filter((s) => s.deviceType !== 'Mobile' && s.deviceType !== 'Tablet').length;
  const totalTracked = activeSessions.length || 1;

  // Tools popularity ranking
  const popularTools = [...tools]
    .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
    .slice(0, 10);

  const handleExportJson = () => {
    const data = {
      exportTimestamp: new Date().toISOString(),
      platform: 'SobTools',
      stats: {
        totalRegisteredUsers: usersCount,
        totalTools: tools.length,
        totalCategories: categories.length,
        activeSessionsNow: activeSessions.length,
        devices: { desktop: desktopCount, mobile: mobileCount, tablet: tabletCount },
      },
      tools: tools.map((t) => ({
        id: t.id,
        name: t.name.en,
        category: t.category,
        popular: t.popular || false,
        status: t.status,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sobtools_analytics_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Platform Usage Analytics & Statistics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated client-side metrics and real-time visitor distributions.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Export Analytics JSON</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Registered Users</span>
          <span className="text-2xl font-bold text-white mt-1 block">{usersCount}</span>
          <span className="text-[11px] text-emerald-400 mt-0.5 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Realtime Verified
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Active Heartbeats</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block">{activeSessions.length}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Last 5-minute window</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Catalog Tools</span>
          <span className="text-2xl font-bold text-cyan-400 mt-1 block">{tools.length}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">100% Client execution</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Categories</span>
          <span className="text-2xl font-bold text-purple-400 mt-1 block">{categories.length}</span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Fully organized suites</span>
        </div>
      </div>

      {/* Two Column Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Tools */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-4">Top Featured & Popular Tools</h3>
          <div className="space-y-3">
            {popularTools.map((t, idx) => {
              const pct = Math.max(30, 100 - idx * 7);
              return (
                <div key={t.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-white flex items-center gap-1.5">
                      <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                      <span>{t.name.en}</span>
                    </span>
                    <span className="text-slate-400 capitalize text-[11px]">{t.category}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Device Distribution & Category Breakdown */}
        <div className="space-y-6">
          {/* Device Split */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-4">Device Usage Distribution</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <Monitor className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Desktop</div>
                <div className="text-lg font-bold text-white mt-1">
                  {Math.round((desktopCount / totalTracked) * 100)}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <Smartphone className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Mobile</div>
                <div className="text-lg font-bold text-white mt-1">
                  {Math.round((mobileCount / totalTracked) * 100)}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <Tablet className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <div className="text-xs text-slate-400">Tablet</div>
                <div className="text-lg font-bold text-white mt-1">
                  {Math.round((tabletCount / totalTracked) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Category Tools Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3">Tools Distribution by Category</h3>
            <div className="space-y-2.5">
              {categories.map((c) => {
                const count = tools.filter((t) => t.category === c.id).length;
                const pct = Math.round((count / (tools.length || 1)) * 100);
                return (
                  <div key={c.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{c.name.en}</span>
                      <span className="text-slate-400 text-[11px]">{count} tools ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${c.color || 'from-indigo-500 to-cyan-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
