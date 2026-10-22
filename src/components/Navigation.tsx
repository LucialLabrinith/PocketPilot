import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import {
  LayoutDashboard,
  Wallet,
  Smartphone,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Tags,
  PieChart,
  Target,
  CalendarDays,
  TrendingUp,
  Landmark,
  Scale,
  BarChart3,
  Monitor,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ShieldCheck,
  Globe
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'accounts'
  | 'linked'
  | 'income'
  | 'expenses'
  | 'transactions'
  | 'categories'
  | 'budget'
  | 'savings'
  | 'bills'
  | 'investments'
  | 'assets'
  | 'networth'
  | 'reports'
  | 'settings';

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenDesktopSimulator: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  onOpenDesktopSimulator,
}) => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navSections = [
    {
      title: t('navCoreFinance'),
      items: [
        { id: 'dashboard' as PageId, label: t('navDashboard'), icon: LayoutDashboard },
        { id: 'accounts' as PageId, label: t('navAccounts'), icon: Wallet },
        { id: 'linked' as PageId, label: t('navLinked'), icon: Smartphone, badge: 'Auto-Sync' },
        { id: 'income' as PageId, label: t('navIncome'), icon: ArrowDownLeft },
        { id: 'expenses' as PageId, label: t('navExpenses'), icon: ArrowUpRight },
        { id: 'transactions' as PageId, label: t('navTransactions'), icon: Receipt },
        { id: 'categories' as PageId, label: t('navCategories'), icon: Tags },
      ],
    },
    {
      title: t('navBudgetsGoals'),
      items: [
        { id: 'budget' as PageId, label: t('navMonthlyBudget'), icon: PieChart },
        { id: 'savings' as PageId, label: t('navSavingsGoals'), icon: Target },
        { id: 'bills' as PageId, label: t('navBillsSubscriptions'), icon: CalendarDays },
      ],
    },
    {
      title: t('navWealthAssets'),
      items: [
        { id: 'investments' as PageId, label: t('navInvestments'), icon: TrendingUp },
        { id: 'assets' as PageId, label: t('navAssetsLiabilities'), icon: Landmark },
        { id: 'networth' as PageId, label: t('navNetWorth'), icon: Scale },
        { id: 'reports' as PageId, label: t('navReportsAnalytics'), icon: BarChart3 },
      ],
    },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
            PP
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              {t('appName')}
            </span>
            <span className="ml-1.5 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {t('freeFirst')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile Language Switcher */}
          <select
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}
            className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          >
            <option value="en">EN</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
            <option value="te">తెలుగు</option>
          </select>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title={t('toggleTheme')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-sky-500/20">
              PP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">{t('appName')}</span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> {t('appTagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map(sec => (
            <div key={sec.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {sec.title}
              </div>
              {sec.items.map(item => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Desktop Client Companion Launcher */}
          <div className="pt-2">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t('navDesktopSync')}
            </div>
            <button
              onClick={() => {
                onOpenDesktopSimulator();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 text-sky-300 hover:border-sky-400 hover:text-white transition-all cursor-pointer shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <Monitor className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>{t('navDesktopSync')}</span>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono">
                Live
              </span>
            </button>
          </div>
        </nav>

        {/* User Profile & Footer Controls */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          {/* Language Switcher in Sidebar */}
          <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('selectLanguage')}:</span>
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as Language)}
              className="text-xs font-semibold bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* Quick Settings & Theme */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => handleNavClick('settings')}
              className={`flex items-center gap-2 text-xs transition-colors cursor-pointer ${
                currentPage === 'settings' ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>{t('navSettings')}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={t('toggleTheme')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
            </button>
          </div>

          {/* User pill & Logout */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-sky-600/20 text-sky-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-sky-500/30">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{user?.fullName || 'User'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              title={t('signOut')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}
    </>
  );
};
