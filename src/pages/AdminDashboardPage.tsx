import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth, ADMIN_BOOTSTRAP_EMAIL } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Users,
  Activity,
  Wrench,
  Layers,
  Megaphone,
  Palette,
  FileText,
  Globe,
  BarChart3,
  Shield,
  ShieldCheck,
  Settings,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  LogOut,
  Radio,
  Lock,
  Mail,
} from 'lucide-react';

import {
  fetchAllTools,
  fetchCategories,
  fetchAdvertisements,
  fetchAnnouncements,
  fetchActiveSessions,
  fetchAuditLogs,
  fetchAdminRoles,
  fetchContactMessages,
  logAdminAction,
} from '../services/cmsService';
import { collection, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  ToolDefinition,
  CategoryDefinition,
  AdvertisementConfig,
  AnnouncementItem,
  ActiveSession,
  AdminAuditLog,
  AdminRoleItem,
} from '../types';

// Subcomponents
import { AdminOverviewTab } from './admin/AdminOverviewTab';
import { AdminUsersTab } from './admin/AdminUsersTab';
import { AdminActiveSessionsTab } from './admin/AdminActiveSessionsTab';
import { AdminToolsTab } from './admin/AdminToolsTab';
import { AdminCategoriesTab } from './admin/AdminCategoriesTab';
import { AdminAdsTab } from './admin/AdminAdsTab';
import { AdminHomepageTab } from './admin/AdminHomepageTab';
import { AdminPagesTab } from './admin/AdminPagesTab';
import { AdminAppearanceTab } from './admin/AdminAppearanceTab';
import { AdminMessagesTab } from './admin/AdminMessagesTab';
import { AdminSeoTab } from './admin/AdminSeoTab';
import { AdminAnalyticsTab } from './admin/AdminAnalyticsTab';
import { AdminAnnouncementsTab } from './admin/AdminAnnouncementsTab';
import { AdminRolesTab } from './admin/AdminRolesTab';
import { AdminAuditLogsTab } from './admin/AdminAuditLogsTab';
import { AdminSettingsTab } from './admin/AdminSettingsTab';

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

export type AdminTab =
  | 'overview'
  | 'users'
  | 'active-users'
  | 'tools'
  | 'categories'
  | 'advertisements'
  | 'homepage'
  | 'pages'
  | 'theme'
  | 'messages'
  | 'seo'
  | 'analytics'
  | 'announcements'
  | 'roles'
  | 'audit-logs'
  | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') as AdminTab) || 'overview';
  const [activeTab, setActiveTab] = useState<AdminTab>(tabParam);

  // Synchronized Datasets
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [tools, setTools] = useState<ToolDefinition[]>([]);
  const [categories, setCategories] = useState<CategoryDefinition[]>([]);
  const [ads, setAds] = useState<AdvertisementConfig[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminRoleItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const isMasterAdmin = user?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        toolsData,
        categoriesData,
        adsData,
        announcementsData,
        sessionsData,
        auditLogsData,
        adminRolesData,
        messagesData,
      ] = await Promise.all([
        fetchAllTools(),
        fetchCategories(),
        fetchAdvertisements(),
        fetchAnnouncements(),
        fetchActiveSessions(5),
        fetchAuditLogs(100),
        fetchAdminRoles(),
        fetchContactMessages().catch(() => []),
      ]);

      setTools(toolsData);
      setCategories(categoriesData);
      setAds(adsData);
      setAnnouncements(announcementsData);
      setActiveSessions(sessionsData);
      setAuditLogs(auditLogsData);
      setAdminRoles(adminRolesData);
      setUnreadCount(messagesData.filter((m) => m.status === 'unread').length);

      // Load Users
      const userSnap = await getDocs(collection(db, 'users'));
      const userList: ManagedUser[] = [];
      userSnap.forEach((d) => {
        userList.push({ uid: d.id, ...(d.data() as Omit<ManagedUser, 'uid'>) });
      });
      setUsers(userList);
    } catch (err) {
      console.warn('Error loading admin suite datasets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleAudit = useCallback(
    async (action: string, category: AdminAuditLog['category'], details: string, targetId?: string) => {
      if (!user) return;
      await logAdminAction(user.uid, user.email || 'admin@sobtools.com', action, category, details, targetId);
      // Reload logs
      fetchAuditLogs(100).then(setAuditLogs).catch(() => {});
    },
    [user]
  );

  const handleToggleSuspendUser = async (u: ManagedUser) => {
    if (u.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) {
      alert('Master Super Admin account cannot be suspended.');
      return;
    }
    const newStatus = !u.isSuspended;
    try {
      await updateDoc(doc(db, 'users', u.uid), {
        isSuspended: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setUsers((prev) =>
        prev.map((userItem) => (userItem.uid === u.uid ? { ...userItem, isSuspended: newStatus } : userItem))
      );
      await handleAudit(
        newStatus ? 'USER_SUSPEND' : 'USER_REACTIVATE',
        'USER',
        `User ${u.email} account status changed to ${newStatus ? 'Suspended' : 'Active'}`,
        u.uid
      );
    } catch (err: any) {
      alert('Failed to change user status: ' + (err.message || 'Unknown error'));
    }
  };

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'User Management', icon: Users, badge: users.length },
    {
      id: 'active-users',
      label: 'Active Users (Live)',
      icon: Activity,
      badge: activeSessions.length,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    { id: 'tools', label: 'Tool Management', icon: Wrench, badge: tools.length },
    { id: 'categories', label: 'Categories', icon: Layers, badge: categories.length },
    { id: 'advertisements', label: 'Advertisements', icon: Megaphone, badge: ads.length },
    { id: 'theme', label: 'Theme & Appearance', icon: Palette },
    {
      id: 'messages',
      label: 'Inquiries & Inbox',
      icon: Mail,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    { id: 'homepage', label: 'Homepage Editor', icon: Layers },
    { id: 'pages', label: 'Pages & CMS', icon: FileText },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'analytics', label: 'Usage Analytics', icon: BarChart3 },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      badge: announcements.filter((a) => a.active).length,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    { id: 'roles', label: 'Admin Roles & RBAC', icon: Shield },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldCheck, badge: auditLogs.length },
    { id: 'settings', label: 'General Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Admin Sticky Navigation Bar */}
      <div className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">SobTools Super Admin</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {isMasterAdmin ? 'Master Root' : 'Administrator'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Firestore Live</span>
          </div>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Refresh All Datasets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <Link
            to="/"
            target="_blank"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Admin Workspace: Sidebar + Content Area */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 lg:w-72 border-r border-slate-800/80 bg-slate-900/60 p-4 shrink-0 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="block px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Management Suite
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Admin Footer */}
          <div className="pt-4 mt-6 border-t border-slate-800 text-xs">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-950/30 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </aside>

        {/* Viewport Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              users={users}
              activeSessions={activeSessions}
              tools={tools}
              categories={categories}
              auditLogs={auditLogs}
              onNavigateTab={(tab) => handleTabChange(tab as AdminTab)}
              onToggleSuspendUser={handleToggleSuspendUser}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={users}
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'active-users' && (
            <AdminActiveSessionsTab
              initialSessions={activeSessions}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'tools' && (
            <AdminToolsTab
              tools={tools}
              categories={categories}
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categories={categories}
              tools={tools}
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'advertisements' && (
            <AdminAdsTab
              advertisements={ads}
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'theme' && (
            <AdminAppearanceTab
              onRefresh={loadAllData}
              onLogAudit={(action, category, details) => handleAudit(action, category, details)}
            />
          )}

          {activeTab === 'messages' && (
            <AdminMessagesTab />
          )}

          {activeTab === 'homepage' && (
            <AdminHomepageTab
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'pages' && (
            <AdminPagesTab
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'seo' && (
            <AdminSeoTab
              tools={tools}
              categories={categories}
              onRefresh={loadAllData}
              onLogAudit={(action, category, details) => handleAudit(action, category, details)}
            />
          )}

          {activeTab === 'analytics' && (
            <AdminAnalyticsTab
              usersCount={users.length}
              tools={tools}
              categories={categories}
              activeSessions={activeSessions}
            />
          )}

          {activeTab === 'announcements' && (
            <AdminAnnouncementsTab
              announcements={announcements}
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'roles' && (
            <AdminRolesTab
              roles={adminRoles}
              onRefresh={loadAllData}
              onLogAudit={(action, category, details, targetId) =>
                handleAudit(action, category, details, targetId)
              }
            />
          )}

          {activeTab === 'audit-logs' && <AdminAuditLogsTab logs={auditLogs} />}

          {activeTab === 'settings' && (
            <AdminSettingsTab
              onRefresh={loadAllData}
              onLogAudit={(action, category, details) => handleAudit(action, category, details)}
            />
          )}
        </main>
      </div>
    </div>
  );
};
