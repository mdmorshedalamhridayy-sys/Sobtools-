import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { tools } from '../config/toolsRegistry';
import { ToolDefinition } from '../types';
import {
  LayoutDashboard,
  Star,
  History,
  User,
  Shield,
  LogOut,
  Wrench,
  CheckCircle2,
  Clock,
  Trash2,
  ArrowRight,
  ExternalLink,
  Lock,
  Globe,
  Sun,
  Moon,
  AlertTriangle,
  Loader2,
  Sparkles,
  Camera,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    user,
    userProfile,
    favorites,
    toolHistory,
    logout,
    updateUserProfileData,
    changePassword,
    toggleFavorite,
    deleteUserAccount,
  } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Profile edit states
  const [displayName, setDisplayName] = useState(user?.displayName || userProfile?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || userProfile?.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account deletion states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await updateUserProfileData({
        displayName: displayName.trim(),
        photoURL: photoURL.trim(),
        preferredLanguage: language,
        theme: theme,
      });
      setProfileMsg({
        type: 'success',
        text: language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।' : 'Profile updated successfully.',
      });
    } catch {
      setProfileMsg({
        type: 'error',
        text: language === 'bn' ? 'প্রোফাইল সংরক্ষণে সমস্যা হয়েছে।' : 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPassword.length < 6) {
      setPassMsg({
        type: 'error',
        text: language === 'bn' ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.',
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassMsg({
        type: 'error',
        text: language === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না।' : 'New passwords do not match.',
      });
      return;
    }
    setSavingPass(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPassMsg({
        type: 'success',
        text: language === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে।' : 'Password updated successfully.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch {
      setPassMsg({
        type: 'error',
        text: language === 'bn' ? 'বর্তমান পাসওয়ার্ড সঠিক নয় বা পরিবর্তন ব্যর্থ হয়েছে।' : 'Current password incorrect or update failed.',
      });
    } finally {
      setSavingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteUserAccount(deletePassword);
      navigate('/', { replace: true });
    } catch {
      setDeleteError(
        language === 'bn'
          ? 'একাউন্ট মোছা সম্ভব হয়নি। পাসওয়ার্ড সঠিক কিনা নিশ্চিত করুন।'
          : 'Failed to delete account. Please confirm your password or re-login.'
      );
      setDeleting(false);
    }
  };

  // Find tool objects for favorites
  const favoriteTools = tools.filter((t: ToolDefinition) => favorites.includes(t.id));
  const popularTools = tools.filter((t: ToolDefinition) => t.popular).slice(0, 6);

  // Formatted creation date
  const creationDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* User Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-950 flex items-center justify-center">
                  {user?.photoURL || userProfile?.photoURL ? (
                    <img
                      src={user?.photoURL || userProfile?.photoURL}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-indigo-400" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {user?.displayName || userProfile?.displayName || 'SobTools User'}
                </h1>
                {user?.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    {language === 'bn' ? 'ভেরিফাইড' : 'Verified'}
                  </span>
                ) : (
                  <Link
                    to="/verify-email"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    <Clock className="w-3 h-3" />
                    {language === 'bn' ? 'ভেরিফাই করুন' : 'Verify Email'}
                  </Link>
                )}
                {userProfile?.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {language === 'bn' ? `সদস্য হয়েছেন: ${creationDate}` : `Member since: ${creationDate}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tools"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{t('allTools')}</span>
            </Link>
            <button
              onClick={() => logout()}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Navigation Tabs + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 space-y-1 sticky top-24">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>{language === 'bn' ? 'ওভারভিউ' : 'Overview'}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4" />
                <span>{t('myFavorites')}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {favorites.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4" />
                <span>{t('toolHistory')}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
                {toolHistory.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4" />
                <span>{t('myProfile')}</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4" />
                <span>{t('securitySettings')}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">{t('myFavorites')}</span>
                    <Star className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{favorites.length}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === 'bn' ? 'বুকমার্ক করা প্রিয় টুলস' : 'Bookmarked utilities'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">{t('toolHistory')}</span>
                    <History className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{toolHistory.length}</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === 'bn' ? 'ব্যবহারের রেকর্ড' : 'Usage sessions recorded'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">
                      {language === 'bn' ? 'এক্সেস স্ট্যাটাস' : 'Access Level'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold text-emerald-400">
                    {user?.emailVerified ? 'Active & Verified' : 'Pending Verification'}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {language === 'bn' ? 'সম্পূর্ণ ব্রাউজার এনক্রিপ্টেড' : 'Protected sandbox'}
                  </span>
                </div>
              </div>

              {/* Quick Launch Popular Tools */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{t('popularToolsTitle')}</span>
                  </h2>
                  <Link
                    to="/tools"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>{t('allTools')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {popularTools.map((tool: ToolDefinition) => (
                    <Link
                      key={tool.id}
                      to={`/tools/${tool.slug}`}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors">
                            {tool.name[language]}
                          </h3>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {tool.shortDescription[language]}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Tool History preview */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <span>{t('toolHistory')}</span>
                  </h2>
                  {toolHistory.length > 0 && (
                    <button
                      onClick={() => setActiveTab('history')}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      {language === 'bn' ? 'সব দেখুন' : 'View all'}
                    </button>
                  )}
                </div>

                {toolHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    {t('noRecentTools')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {toolHistory.slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-medium text-slate-200">{item.toolName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.usedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                <span>{t('myFavorites')}</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {language === 'bn'
                  ? 'আপনার দ্রুত ব্যবহারের জন্য সংরক্ষিত প্রিয় টুলস সমূহ।'
                  : 'Your bookmarked utilities for quick 1-click access.'}
              </p>

              {favoriteTools.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <Star className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">
                    {language === 'bn' ? 'কোনো প্রিয় টুল যুক্ত করা হয়নি।' : 'No favorite tools saved yet.'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    {language === 'bn'
                      ? 'টুল পেজে স্টার আইকনে ক্লিক করে প্রিয় তালিকায় যোগ করুন।'
                      : 'Click the star icon on any tool page to add it to your favorites.'}
                  </p>
                  <Link
                    to="/tools"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                  >
                    {t('allTools')}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteTools.map((tool: ToolDefinition) => (
                    <div
                      key={tool.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-white">
                            {tool.name[language]}
                          </h3>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {tool.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/tools/${tool.slug}`}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors"
                        >
                          {t('viewTool')}
                        </Link>
                        <button
                          onClick={() => toggleFavorite(tool.id, tool.name[language])}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <span>{t('toolHistory')}</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {language === 'bn'
                  ? 'আপনার সাম্প্রতিক ব্যবহৃত টুলস এবং ব্যবহারের সময়রেখা।'
                  : 'Chronological timeline of your tool usages.'}
              </p>

              {toolHistory.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">{t('noRecentTools')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {toolHistory.map((item, idx) => {
                    const matchedTool = tools.find((t: ToolDefinition) => t.id === item.toolId);
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-400 flex items-center justify-center">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.toolName}</div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(item.usedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {matchedTool && (
                          <Link
                            to={`/tools/${matchedTool.slug}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <span>{t('viewTool')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span>{t('myProfile')}</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                {language === 'bn'
                  ? 'আপনার ব্যক্তিগত প্রোফাইল তথ্য এবং পছন্দসমূহ হালনাগাদ করুন।'
                  : 'Update your display profile, photo avatar, and regional preferences.'}
              </p>

              {profileMsg && (
                <div
                  className={`mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                      : 'bg-red-950/40 border border-red-800/60 text-red-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    {language === 'bn' ? 'প্রোফাইল ছবি নির্বাচন করুন' : 'Profile Avatar'}
                  </label>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoURL(preset)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                          photoURL === preset
                            ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/30'
                            : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {language === 'bn' ? 'পুরো নাম' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {language === 'bn' ? 'রেজিস্টার্ড ইমেইল (পরিবর্তনযোগ্য নয়)' : 'Registered Email (Read Only)'}
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {language === 'bn' ? 'পছন্দের ভাষা' : 'Preferred Language'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setLanguage('bn')}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          language === 'bn'
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        বাংলা (Bengali)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          language === 'en'
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {language === 'bn' ? 'থিম পছন্দ' : 'Theme Preference'}
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border bg-slate-950 border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2"
                      >
                        {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                        <span className="capitalize">{theme} Theme</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{language === 'bn' ? 'প্রোফাইল পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Change Password */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-md">
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-400" />
                  <span>{language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  {language === 'bn'
                    ? 'আপনার একাউন্ট নিরাপদ রাখতে একটি শক্তিশালী পাসওয়ার্ড নির্ধারণ করুন।'
                    : 'Update your account password with a secure new combination.'}
                </p>

                {passMsg && (
                  <div
                    className={`mb-6 p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                      passMsg.type === 'success'
                        ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                        : 'bg-red-950/40 border border-red-800/60 text-red-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {language === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {language === 'bn' ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {language === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Confirm New Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPass}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {savingPass ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...'}</span>
                      </>
                    ) : (
                      <span>{language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Password'}</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-6 sm:p-8 shadow-md">
                <h3 className="text-base font-bold text-red-400 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>{language === 'bn' ? 'একাউন্ট মুছে ফেলুন (Danger Zone)' : 'Delete Account'}</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {language === 'bn'
                    ? 'আপনার একাউন্ট এবং সাথে সম্পর্কিত বুকমার্ক, হিস্ট্রি ও প্রোফাইল ডেটা চিরতরে মুছে ফেলা হবে। এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।'
                    : 'Permanently remove your account and all associated user preferences, favorites, and history. This action cannot be undone.'}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'একাউন্ট মুছে ফেলতে চাই' : 'Delete My Account'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-2">
              {language === 'bn' ? 'সত্যিই একাউন্ট মুছতে চান?' : 'Are you absolutely sure?'}
            </h3>
            <p className="text-xs text-slate-300 text-center leading-relaxed mb-6">
              {language === 'bn'
                ? 'নিরাপত্তা নিশ্চিত করতে আপনার পাসওয়ার্ড প্রদান করুন। একাউন্ট মুছে ফেললে আপনার সমস্ত ফেভারিট ও হিস্ট্রি স্থায়ীভাবে মুছে যাবে।'
                : 'This action is irreversible. Enter your password to authenticate and permanently delete your profile.'}
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs text-center">
                {deleteError}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {language === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Confirm Password'}
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {t('close')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>{language === 'bn' ? 'স্থায়ীভাবে মুছুন' : 'Confirm Delete'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
