import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { Navigation, PageId } from './components/Navigation';
import { DevOtpBanner } from './components/DevOtpBanner';
import { DesktopSimulatorModal } from './components/DesktopSimulatorModal';
import { UpiPayModal } from './components/UpiPayModal';
import { BankSwitchComplianceModal } from './components/BankSwitchComplianceModal';

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

import { RefreshCw, Monitor, Globe, Sun, Moon, Zap } from 'lucide-react';
import { Language } from './i18n/translations';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, theme, toggleTheme } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isUpiPayModalOpen, setIsUpiPayModalOpen] = useState(false);
  const [isBankSwitchModalOpen, setIsBankSwitchModalOpen] = useState(false);
  const [upiInitialTab, setUpiInitialTab] = useState<'QR' | 'CONTACT' | 'UPI_ID' | 'BANK_TRANSFER' | 'SELF' | 'RECEIVE'>('QR');
  const [dataVersion, setDataVersion] = useState(0);

  const handlePaymentSuccess = () => {
    setDataVersion(v => v + 1);
  };

  const handleOpenQrScanner = () => {
    setUpiInitialTab('QR');
    setIsUpiPayModalOpen(true);
  };

  const handleOpenUpiPay = (tab: 'QR' | 'CONTACT' | 'UPI_ID' | 'BANK_TRANSFER' | 'SELF' | 'RECEIVE' = 'UPI_ID') => {
    setUpiInitialTab(tab);
    setIsUpiPayModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-sky-500 animate-spin" />
          <p className="text-sm font-semibold">{t('loading')}</p>
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
        onOpenQrScanner={handleOpenQrScanner}
        onOpenUpiPay={() => handleOpenUpiPay('UPI_ID')}
        onOpenBankSwitch={() => setIsBankSwitchModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white/95 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-sm uppercase tracking-wider text-slate-950 dark:text-slate-200">
              {t('appName')}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              {t('sharedDbConnected')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs">
              <Globe className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="bg-transparent text-slate-900 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="en" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">English</option>
                <option value="hi" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">हिन्दी (Hindi)</option>
                <option value="mr" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">मराठी (Marathi)</option>
                <option value="te" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">తెలుగు (Telugu)</option>
              </select>
            </div>

            {/* Header Scan Any QR Button */}
            <button
              onClick={handleOpenQrScanner}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <span className="text-sm">📷</span>
              <span>Scan QR</span>
            </button>

            {/* Header UPI Pay Button */}
            <button
              onClick={() => handleOpenUpiPay('UPI_ID')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="h-3.5 w-3.5 fill-slate-950" />
              <span>⚡ UPI Pay</span>
            </button>

            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer shadow-2xs"
              title={t('toggleTheme')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>

            {/* Desktop Sync Button */}
            <button
              onClick={() => setIsDesktopModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:border-sky-400 transition-all cursor-pointer shadow-xs"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>{t('navDesktopSync')}</span>
            </button>

            {/* Pinnacle CBS & NPCI Switch Gateway Button */}
            <button
              onClick={() => setIsBankSwitchModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 transition-all cursor-pointer shadow-xs"
              title="Pinnacle CBS, NPCI & Bank Switch Legal Clearing"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden xl:inline">Pinnacle &amp; NPCI Switch</span>
              <span className="xl:hidden">Switch</span>
            </button>

            {/* Connected Google Account Badge */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-2.5 border-l border-slate-300 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs border border-white dark:border-slate-800">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'G'}
                </div>
                <div className="text-left text-xs leading-tight">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{user.fullName || 'Divyaam P'}</span>
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <div className="text-[10px] text-cyan-700 dark:text-cyan-300 font-mono truncate max-w-[140px]">
                    {user.email}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <DevOtpBanner />

          {currentPage === 'dashboard' && (
            <DashboardPage
              key={dataVersion}
              onNavigate={page => setCurrentPage(page)}
              onOpenDesktopSimulator={() => setIsDesktopModalOpen(true)}
              onOpenUpiPay={() => handleOpenUpiPay('UPI_ID')}
              onOpenQrScanner={handleOpenQrScanner}
            />
          )}
          {currentPage === 'accounts' && (
            <AccountsPage
              key={dataVersion}
              onNavigate={page => setCurrentPage(page)}
              onOpenUpiPay={() => handleOpenUpiPay('UPI_ID')}
            />
          )}
          {currentPage === 'linked' && <LinkedPage key={dataVersion} onNavigate={page => setCurrentPage(page)} />}
          {currentPage === 'transactions' && <TransactionsPage key={dataVersion} onNavigate={page => setCurrentPage(page)} />}
          {currentPage === 'income' && <IncomePage />}
          {currentPage === 'expenses' && <ExpensesPage />}
          {currentPage === 'categories' && <CategoriesPage />}
          {currentPage === 'budget' && <BudgetsPage />}
          {currentPage === 'savings' && <SavingsGoalsPage />}
          {currentPage === 'bills' && <BillsPage />}
          {currentPage === 'investments' && (
            <InvestmentsPage
              key={dataVersion}
              onNavigate={page => setCurrentPage(page)}
              onOpenUpiPay={() => handleOpenUpiPay('UPI_ID')}
            />
          )}
          {currentPage === 'assets' && <AssetsLiabilitiesPage />}
          {currentPage === 'networth' && <NetWorthPage />}
          {currentPage === 'reports' && <ReportsPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Floating Action Buttons for Scanner & UPI Pay */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={handleOpenQrScanner}
          className="flex items-center gap-1.5 px-3.5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-2xl shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/40"
        >
          <span className="text-sm">📷</span>
          <span>Scan QR</span>
        </button>

        <button
          onClick={() => handleOpenUpiPay('UPI_ID')}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black text-xs shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
        >
          <Zap className="h-4 w-4 fill-slate-950" />
          <span>⚡ UPI Pay</span>
        </button>
      </div>

      {/* UPI Super Pay Modal with Camera QR Scanner */}
      <UpiPayModal
        isOpen={isUpiPayModalOpen}
        defaultMode={upiInitialTab}
        onClose={() => setIsUpiPayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Desktop Client Simulator Modal */}
      <DesktopSimulatorModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />

      {/* Pinnacle CBS & NPCI Bank Switch Compliance Modal */}
      <BankSwitchComplianceModal
        isOpen={isBankSwitchModalOpen}
        onClose={() => setIsBankSwitchModalOpen(false)}
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
