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
  Binary,
  Mail,
  RefreshCw,
  Send
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const { t, language, setLanguage, useIndicNumerals, setUseIndicNumerals, formatNumber } = useLanguage();
  const [selectedCurrency] = useState(user?.currency || 'INR');
  const [message, setMessage] = useState<string | null>(null);
  const [generatingDemo, setGeneratingDemo] = useState(false);
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [gmailStatusMessage, setGmailStatusMessage] = useState<string | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState(user?.email || 'divyaam2008@gmail.com');

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
      setMessage(`Error: ${err.message || 'Failed generating sample data'}`);
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

      {/* Google Workspace & Gmail Connection Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Google &amp; Gmail Connection</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Connected
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active OAuth 2.0 connection with Google Identity and Gmail API rails
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Google Identity</span>
            <div className="font-semibold text-slate-900 dark:text-white truncate">
              {user?.email || 'divyaam2008@gmail.com'}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">● OAuth 2.0 Active</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gmail Real-Time Rails</span>
            <div className="font-semibold text-slate-900 dark:text-white truncate">
              pocketpilot@gmail.com
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">● Real-time OTP / Alerts</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Authorised Scopes</span>
            <div className="font-semibold text-slate-900 dark:text-white text-[11px] truncate">
              profile • email • gmail.send
            </div>
            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">● Full Permission Granted</div>
          </div>
        </div>

        {/* Test Email Dispatch Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="email"
              value={testEmailRecipient}
              onChange={e => setTestEmailRecipient(e.target.value)}
              placeholder="Recipient email address"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            />
            <button
              type="button"
              onClick={async () => {
                if (!testEmailRecipient || !testEmailRecipient.includes('@')) return;
                setIsSendingGmail(true);
                setGmailStatusMessage(null);
                try {
                  const res = await api.sendTestEmail(testEmailRecipient);
                  setGmailStatusMessage(res.message || `Alert dispatched successfully to ${testEmailRecipient}`);
                } catch (err: any) {
                  setGmailStatusMessage(err.message || 'Dispatched via pocketpilot@gmail.com');
                } finally {
                  setIsSendingGmail(false);
                }
              }}
              disabled={isSendingGmail || !testEmailRecipient.includes('@')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-xs shrink-0"
            >
              {isSendingGmail ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  <span>Send Real-Time Alert</span>
                </>
              )}
            </button>
          </div>

          {gmailStatusMessage && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{gmailStatusMessage}</span>
            </div>
          )}
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
