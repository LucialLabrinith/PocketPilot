import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { Navigation, PageId } from './components/Navigation';
import { DevOtpBanner } from './components/DevOtpBanner';
import { DesktopSimulatorModal } from './components/DesktopSimulatorModal';

import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { LinkedPage } from './pages/LinkedPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SavingsGoalsPage } from './pages/SavingsGoalsPage';
import { BillsPage } from './pages/BillsPage';
import { InvestmentsPage } from './pages/InvestmentsPage';
import { AssetsLiabilitiesPage } from './pages/AssetsLiabilitiesPage';
import { NetWorthPage } from './pages/NetWorthPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

import { RefreshCw, Monitor, Globe, Sun, Moon } from 'lucide-react';
import { Language } from './i18n/translations';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading, theme, toggleTheme } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-sky-500 animate-spin" />
          <p className="text-sm font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Navigation
        currentPage={currentPage}
        onNavigate={page => setCurrentPage(page)}
        onOpenDesktopSimulator={() => setIsDesktopModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-300">
              {t('appName')}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {t('sharedDbConnected')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <Globe className="h-3.5 w-3.5 text-sky-500" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="bg-transparent text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">English</option>
                <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">हिन्दी (Hindi)</option>
                <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">मराठी (Marathi)</option>
                <option value="te" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">తెలుగు (Telugu)</option>
              </select>
            </div>

            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-400 transition-colors cursor-pointer shadow-2xs"
              title={t('toggleTheme')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>

            {/* Desktop Sync Button */}
            <button
              onClick={() => setIsDesktopModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:border-sky-400 transition-all cursor-pointer shadow-xs"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>{t('navDesktopSync')}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <DevOtpBanner />

          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={page => setCurrentPage(page)}
              onOpenDesktopSimulator={() => setIsDesktopModalOpen(true)}
            />
          )}
          {currentPage === 'accounts' && <AccountsPage />}
          {currentPage === 'linked' && <LinkedPage />}
          {currentPage === 'transactions' && <TransactionsPage />}
          {currentPage === 'income' && <IncomePage />}
          {currentPage === 'expenses' && <ExpensesPage />}
          {currentPage === 'categories' && <CategoriesPage />}
          {currentPage === 'budget' && <BudgetsPage />}
          {currentPage === 'savings' && <SavingsGoalsPage />}
          {currentPage === 'bills' && <BillsPage />}
          {currentPage === 'investments' && <InvestmentsPage />}
          {currentPage === 'assets' && <AssetsLiabilitiesPage />}
          {currentPage === 'networth' && <NetWorthPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Desktop Client Simulator Modal */}
      <DesktopSimulatorModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
