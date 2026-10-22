import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account, Transaction, FinancialSummary, MonthlyBudget } from '../types';
import {
  Wallet,
  Scale,
  PlusCircle,
  Receipt,
  PieChart,
  RefreshCw,
  Target,
  AlertCircle,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { PageId } from '../components/Navigation';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
  onOpenDesktopSimulator: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenDesktopSimulator }) => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDigits, formatDate } = useLanguage();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, accs, txs, bud] = await Promise.all([
        api.getSummary(),
        api.getAccounts(),
        api.getTransactions(),
        api.getCurrentBudget(),
      ]);
      setSummary(sumData);
      setAccounts(accs);
      setRecentTransactions(txs.slice(0, 7));
      setBudget(bud);
    } catch (err: any) {
      setError(err.message || 'Failed loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const cur = summary?.currency || user?.currency || 'USD';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 text-sky-500 animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-900 border border-sky-500/20 shadow-lg text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
              {t('overviewTitle')}
            </span>
            <span className="text-xs text-slate-400">
              {t('monthLabel')}: {summary?.currentMonth || t('currentMonth')}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            {t('welcomeBack', { name: user?.fullName || 'User' })}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {t('dashboardSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            {t('addTransaction')}
          </button>
          <button
            onClick={onOpenDesktopSimulator}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4 text-sky-400" />
            {t('syncDesktop')}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>{t('netWorth')}</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(summary?.netWorth || '0.00', cur)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t('totalAssets')}: {formatCurrency(summary?.totalAssets || '0.00', cur)}</span>
            <span>{t('totalDebts')}: {formatCurrency(summary?.totalLiabilities || '0.00', cur)}</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>{t('monthlyIncome')}</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(summary?.monthlyIncome || '0.00', cur)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {t('incomeTarget')}: {formatCurrency(budget?.monthly_income_target || '0.00', cur)}
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>{t('monthlyExpenses')}</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
            -{formatCurrency(summary?.monthlyExpense || '0.00', cur)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {t('typeTransfer')} excluded
          </div>
        </div>

        {/* Monthly Net Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>{t('netSavings')}</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-sky-600 dark:text-sky-400">
            {formatCurrency(summary?.monthlySavings || '0.00', cur)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t('savingsRate')}</span>
            <span className="font-semibold text-sky-500 font-mono">{formatDigits(summary?.savingsRate || 0)}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Accounts & Budget Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts Carousel / Overview */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-sky-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('yourAccounts')}</h2>
            </div>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              {t('manageAccounts')} <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {accounts.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('noAccountsYet')}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('createAccountPrompt')}
              </p>
              <button
                onClick={() => onNavigate('accounts')}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer shadow"
              >
                {t('addAccountBtn')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col justify-between hover:border-sky-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {acc.account_type === 'CHECKING' ? t('checkingAccount') :
                         acc.account_type === 'SAVINGS' ? t('savingsAccount') :
                         acc.account_type === 'CASH' ? t('cashWallet') :
                         acc.account_type === 'CREDIT_CARD' ? t('creditCard') :
                         t('investmentAccount')}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white mt-1.5 truncate">
                        {acc.name}
                      </h3>
                      {acc.institution && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{acc.institution}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-slate-900 dark:text-emerald-400">
                        {formatCurrency(acc.current_balance, acc.currency)}
                      </div>
                      <span className={`text-[10px] ${acc.is_reconciled ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {acc.is_reconciled ? t('reconciled') : t('pending')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget 50/30/20 Snapshot */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('budgetSnapshot')}</h2>
            </div>
            <button
              onClick={() => onNavigate('budget')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {t('navMonthlyBudget')}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Needs */}
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                <span>{t('classificationNeed')} ({formatDigits(budget?.needs_percentage || 50)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${budget?.needs_percentage || 50}%` }}
                />
              </div>
            </div>

            {/* Wants */}
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                <span>{t('classificationWant')} ({formatDigits(budget?.wants_percentage || 30)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${budget?.wants_percentage || 30}%` }}
                />
              </div>
            </div>

            {/* Savings */}
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium mb-1">
                <span>{t('classificationSavings')} ({formatDigits(budget?.savings_percentage || 20)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${budget?.savings_percentage || 20}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('recentTransactions')}</h2>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {t('viewAll')} ({formatDigits(summary?.totalTransactionsCount || 0)}) <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            {t('noTransactionsYet')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">{t('date')}</th>
                  <th className="py-2.5 px-3">{t('accountType')}</th>
                  <th className="py-2.5 px-3">{t('payee')}</th>
                  <th className="py-2.5 px-3 text-right">{t('amount')}</th>
                  <th className="py-2.5 px-3 text-center">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-500">{formatDate(tx.transaction_date)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        tx.type === 'EXPENSE' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        tx.type === 'TRANSFER' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {tx.type === 'INCOME' ? t('typeIncome') :
                         tx.type === 'EXPENSE' ? t('typeExpense') :
                         tx.type === 'TRANSFER' ? t('typeTransfer') :
                         t('typeRefund')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-900 dark:text-slate-200">
                      <div>{tx.payee || tx.notes || t('recentTransactions')}</div>
                      {tx.notes && tx.payee && (
                        <div className="text-[10px] text-slate-400">{tx.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={
                        tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' :
                        tx.type === 'EXPENSE' ? 'text-rose-600 dark:text-rose-400' :
                        tx.type === 'REFUND' ? 'text-amber-600 dark:text-amber-400' :
                        'text-blue-600 dark:text-blue-400'
                      }>
                        {tx.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.amount, cur)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        tx.is_reconciled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {tx.is_reconciled ? t('reconciled') : t('pending')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
