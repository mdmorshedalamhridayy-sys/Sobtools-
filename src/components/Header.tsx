import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wrench,
  Search,
  Sun,
  Moon,
  Globe,
  Menu,
  X,
  ChevronDown,
  Layers,
  Sparkles,
  User,
  Shield,
  Star,
  History,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { categories as defaultCategories } from '../config/toolsRegistry';
import { SearchModal } from './SearchModal';
import { fetchAnnouncements, fetchCategories } from '../services/cmsService';
import { AnnouncementItem, CategoryDefinition } from '../types';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const [categories, setCategories] = useState<CategoryDefinition[]>(defaultCategories);
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementItem | null>(null);
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState(false);

  React.useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchAnnouncements().then((list) => {
      const active = list.find((a) => {
        if (!a.active) return false;
        if (a.placement !== 'all' && a.placement !== 'header_banner') return false;
        if (a.targetAudience === 'logged_in' && !user) return false;
        if (a.targetAudience === 'unregistered' && user) return false;
        return true;
      });
      if (active) setActiveAnnouncement(active);
    }).catch(() => {});
  }, [user]);

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/tools', label: t('allTools') },
    { to: '/about', label: t('about') },
    { to: '/faq', label: t('faq') },
    { to: '/contact', label: t('contact') },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Dynamic Announcement Top Broadcast Banner */}
      {activeAnnouncement && !dismissedAnnouncement && (
        <div
          className={`py-2 px-4 text-xs font-medium text-center relative flex items-center justify-center gap-2 border-b transition-all ${
            activeAnnouncement.type === 'warning'
              ? 'bg-amber-950/70 border-amber-800/60 text-amber-200'
              : activeAnnouncement.type === 'alert'
              ? 'bg-rose-950/70 border-rose-800/60 text-rose-200'
              : activeAnnouncement.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-200'
              : 'bg-indigo-950/70 border-indigo-800/60 text-indigo-200'
          }`}
        >
          <span className="font-bold">{activeAnnouncement.title}:</span>
          <span>{activeAnnouncement.content}</span>
          {activeAnnouncement.dismissible && (
            <button
              onClick={() => setDismissedAnnouncement(true)}
              className="absolute right-3 p-1 hover:opacity-75 transition-opacity"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    SobTools
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    সবটুলস
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 -mt-1 hidden md:block">
                  {t('brandTagline')}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Categories Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <span>{t('categories')}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {categoriesOpen && (
                  <div className="absolute top-full left-0 w-64 pt-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-indigo-400 text-xs transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">
                              {cat.name[language]}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                              {cat.description[language]}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-sm"
                title="Search Tools (Ctrl+K or /)"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">
                  {language === 'bn' ? 'টুল খুঁজুন...' : 'Search tools...'}
                </span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 border border-slate-700">
                  /
                </kbd>
              </button>

              {/* Language Switcher */}
              <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    language === 'bn'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="বাংলা ভাষায় ব্যবহার করুন"
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>

              {/* Authentication Controls (Desktop) */}
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-white transition-all"
                    >
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 overflow-hidden flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                        {user.photoURL || userProfile?.photoURL ? (
                          <img
                            src={user.photoURL || userProfile?.photoURL}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                        )}
                      </div>
                      <span className="hidden md:inline font-medium truncate max-w-[100px]">
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* User dropdown menu */}
                    {userMenuOpen && (
                      <div
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-slate-800 mb-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {user.displayName || 'SobTools User'}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>

                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t('dashboard')}</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=favorites"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t('myFavorites')}</span>
                        </Link>

                        <Link
                          to="/dashboard?tab=history"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{t('toolHistory')}</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/40 transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{t('adminDashboard')}</span>
                          </Link>
                        )}

                        <div className="border-t border-slate-800 mt-1 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setUserMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{t('logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                    >
                      {t('login')}
                    </Link>
                    <Link
                      to="/signup"
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                    >
                      {t('signup')}
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-4 pb-6 space-y-4">
            {/* Mobile Auth Card */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {user.photoURL || userProfile?.photoURL ? (
                        <img
                          src={user.photoURL || userProfile?.photoURL}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate">
                        {user.displayName || 'SobTools User'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-slate-950 text-center text-xs font-medium text-slate-200"
                    >
                      {t('dashboard')}
                    </Link>
                    <Link
                      to="/dashboard?tab=favorites"
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-xl bg-slate-950 text-center text-xs font-medium text-slate-200"
                    >
                      {t('myFavorites')}
                    </Link>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-2 rounded-xl bg-indigo-950/40 text-center text-xs font-semibold text-indigo-300 border border-indigo-800/40"
                    >
                      {t('adminDashboard')}
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-1.5 text-center text-xs text-red-400 font-medium"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md shadow-indigo-600/20"
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive(link.to)
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <span className="block px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                {t('categories')}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs font-medium text-slate-200 hover:text-indigo-400"
                  >
                    {cat.name[language]}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
