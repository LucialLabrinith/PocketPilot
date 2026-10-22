import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { api } from '../services/api';
import {
  Settings,
  User,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  LogOut,
  CheckCircle2,
  Globe,
  Binary
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const { t, language, setLanguage, useIndicNumerals, setUseIndicNumerals, formatNumber } = useLanguage();
  const [selectedCurrency] = useState(user?.currency || 'INR');
  const [message, setMessage] = useState<string | null>(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);

  const handleGenerateDemoData = async () => {
    if (!confirm('This will populate synthetic demo financial data (accounts, transactions, budget, goals) for testing. Proceed?')) return;
    setGeneratingDemo(true);
    setMessage(null);
    try {
      // 1. Create accounts
      const acc1 = await api.createAccount({
        name: 'HDFC Main Checking',
        accountType: 'CHECKING',
        openingBalance: '25000.00',
        currency: selectedCurrency,
        institution: 'HDFC Bank',
        accountNumber: '•••• 7812',
      });

      const acc2 = await api.createAccount({
        name: 'SBI High-Yield Savings',
        accountType: 'SAVINGS',
        openingBalance: '75000.00',
        currency: selectedCurrency,
        institution: 'State Bank of India',
        accountNumber: '•••• 3490',
      });

      await api.createAccount({
        name: 'Daily Cash Wallet',
        accountType: 'CASH',
        openingBalance: '3500.00',
        currency: selectedCurrency,
      });

      // 2. Add sample transactions
      const today = new Date().toISOString().split('T')[0];
      await api.createTransaction({
        accountId: acc1.data.id,
        type: 'INCOME',
        amount: '85000.00',
        transactionDate: today,
        payee: 'Tech Systems Ltd (Monthly Salary)',
        notes: 'Monthly direct salary deposit',
      });

      await api.createTransaction({
        accountId: acc1.data.id,
        type: 'EXPENSE',
        amount: '18500.00',
        transactionDate: today,
        payee: 'Residential Rent (Need)',
        notes: 'Monthly apartment rent',
      });

      await api.createTransaction({
        accountId: acc1.data.id,
        type: 'EXPENSE',
        amount: '3450.00',
        transactionDate: today,
        payee: 'Supermarket Groceries (Need)',
        notes: 'Weekly fresh provisions',
      });

      await api.createTransaction({
        accountId: acc1.data.id,
        toAccountId: acc2.data.id,
        type: 'TRANSFER',
        amount: '15000.00',
        transactionDate: today,
        notes: 'Automated transfer to high-yield savings (Transfer)',
      });

      // 3. Add savings goal
      await api.createGoal({
        name: 'Emergency Reserve Fund',
        targetAmount: '200000.00',
        currentAmount: '75000.00',
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'EMERGENCY',
        notes: '6-month living expense reserve',
      });

      // 4. Add recurring bill
      await api.createBill({
        name: 'Airtel Fiber Broadband',
        amount: '999.00',
        billingCycle: 'MONTHLY',
        dueDay: 15,
        isAutopay: true,
      });

      // 5. Add investment
      await api.createInvestment({
        investmentType: 'MUTUAL_FUND_SIP',
        name: 'Nifty 50 Index Fund SIP',
        investedAmount: '60000.00',
        currentValue: '72500.00',
        annualRatePercent: '12.5',
      });

      setMessage(t('demoDataSuccess'));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGeneratingDemo(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {t('settingsTitle')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('settingsSubtitle')}
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Language & Indic Numerals Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-sky-500" />
          {t('displayPreferences')}
        </h2>

        {/* Language Selection Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {t('selectLanguage')} / भाषा निवडा / భాషను ఎంచుకోండి
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'en' as Language, label: 'English', sub: 'Standard' },
              { id: 'hi' as Language, label: 'हिन्दी', sub: 'Hindi' },
              { id: 'mr' as Language, label: 'मराठी', sub: 'Marathi' },
              { id: 'te' as Language, label: 'తెలుగు', sub: 'Telugu' },
            ].map(item => {
              const active = language === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setLanguage(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-sm font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-500">{item.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Indic Numerals Toggle */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Binary className="h-4 w-4 text-indigo-500" />
              <span>{t('indicNumeralsToggle')}</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-lg leading-relaxed">
              {t('indicNumeralsDesc')}
            </p>
            <div className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400">
              Sample: {formatNumber(125450.75)}
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={useIndicNumerals}
              onChange={e => setUseIndicNumerals(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        {/* Theme and Base Currency */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t('themeMode')}</label>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white cursor-pointer shadow-xs hover:border-slate-400 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-4 w-4 text-sky-400" /> {t('themeDark')}
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-500" /> {t('themeLight')}
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t('baseCurrency')}</label>
            <div className="font-mono font-bold text-sm text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
              {user?.currency || 'INR (₹)'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-5 w-5 text-sky-500" />
          {t('userProfile')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-0.5">{t('fullName')}</label>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{user?.fullName}</div>
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">{t('emailAddress')}</label>
            <div className="font-semibold text-slate-900 dark:text-white text-sm">{user?.email}</div>
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">{t('accountIdLabel')}</label>
            <div className="font-mono text-slate-500 text-xs truncate">{user?.userId}</div>
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">{t('verificationStatus')}</label>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" /> {t('verifiedBadge')}
            </span>
          </div>
        </div>
      </div>

      {/* Development OTP Mode Explanation */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          {t('otpModeTitle')}
        </h2>
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>{t('otpDevDesc')}</p>
        </div>
      </div>

      {/* Synthetic Demo Data Generator */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('demoDataTitle')}</h2>
              <p className="text-xs text-slate-500">{t('demoDataDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleGenerateDemoData}
            disabled={generatingDemo}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50 transition-all self-start sm:self-auto"
          >
            {generatingDemo ? t('generating') : t('demoDataBtn')}
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('signOut')}</h2>
          <p className="text-xs text-slate-500">{t('settingsSubtitle')}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow cursor-pointer transition-all"
        >
          <LogOut className="h-4 w-4" />
          {t('signOut')}
        </button>
      </div>
    </div>
  );
};
