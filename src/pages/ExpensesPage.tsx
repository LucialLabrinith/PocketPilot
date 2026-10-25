import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account, Category, Transaction } from '../types';
import {
  ArrowUpRight,
  PlusCircle,
  ShoppingBag,
  Home,
  Shield,
  X
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDate, formatDigits } = useLanguage();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    categoryId: '',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
    payee: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [txs, accs, cats] = await Promise.all([
        api.getTransactions({ type: 'EXPENSE' }),
        api.getAccounts(),
        api.getCategories(),
      ]);
      setExpenses(txs);
      setAccounts(accs);
      setCategories(cats.filter(c => c.type === 'EXPENSE'));
      if (accs.length > 0 && !formData.accountId) {
        setFormData(prev => ({ ...prev, accountId: accs[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.amount) return;
    try {
      await api.createTransaction({
        accountId: formData.accountId,
        categoryId: formData.categoryId || null,
        type: 'EXPENSE',
        amount: formData.amount,
        transactionDate: formData.transactionDate,
        notes: formData.notes,
        payee: formData.payee,
      });
      setIsModalOpen(false);
      setFormData({
        accountId: accounts[0]?.id || '',
        categoryId: '',
        amount: '',
        transactionDate: new Date().toISOString().split('T')[0],
        notes: '',
        payee: '',
      });
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed recording expense');
    }
  };

  const cur = user?.currency || 'INR';
  const totalExpense = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);

  // Group by Needs vs Wants
  let needsTotal = 0;
  let wantsTotal = 0;
  let savingsDebtTotal = 0;

  expenses.forEach(e => {
    const cat = categories.find(c => c.id === e.category_id);
    const amt = parseFloat(e.amount || '0');
    if (cat?.classification === 'NEED') needsTotal += amt;
    else if (cat?.classification === 'WANT') wantsTotal += amt;
    else if (cat?.classification === 'SAVINGS') savingsDebtTotal += amt;
    else wantsTotal += amt; // Default unclassified to wants
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('expensesTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('expensesSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          {t('addTransaction')}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* Needs vs Wants Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('expensesTitle')}</span>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            -{formatCurrency(totalExpense, cur)}
          </div>
          <span className="text-[11px] text-slate-400">{formatDigits(expenses.length)} {t('typeExpense')}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-500 uppercase">
            <span>{t('classificationNeed')}</span>
            <Home className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(needsTotal, cur)}
          </div>
          <span className="text-[11px] text-slate-400">
            {formatDigits(totalExpense > 0 ? Math.round((needsTotal / totalExpense) * 100) : 0)}% of total
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-500 uppercase">
            <span>{t('classificationWant')}</span>
            <ShoppingBag className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(wantsTotal, cur)}
          </div>
          <span className="text-[11px] text-slate-400">
            {formatDigits(totalExpense > 0 ? Math.round((wantsTotal / totalExpense) * 100) : 0)}% of total
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-500 uppercase">
            <span>{t('classificationSavings')}</span>
            <Shield className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatCurrency(savingsDebtTotal, cur)}
          </div>
          <span className="text-[11px] text-slate-400">
            {formatDigits(totalExpense > 0 ? Math.round((savingsDebtTotal / totalExpense) * 100) : 0)}% of total
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('expensesTitle')}</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('loading')}</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic">
            {t('noTransactionsYet')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">{t('date')}</th>
                  <th className="py-2.5 px-3">{t('payee')}</th>
                  <th className="py-2.5 px-3">{t('account')}</th>
                  <th className="py-2.5 px-3">{t('category')}</th>
                  <th className="py-2.5 px-3 text-right">{t('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {expenses.map(item => {
                  const acc = accounts.find(a => a.id === item.account_id);
                  const cat = categories.find(c => c.id === item.category_id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{formatDate(item.transaction_date)}</td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-semibold">
                        <div>{item.payee || t('typeExpense')}</div>
                        {item.notes && <div className="text-[10px] text-slate-400 font-normal">{item.notes}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{acc?.name || '—'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                          {cat?.name || t('typeExpense')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        -{formatCurrency(item.amount, cur)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('addTransaction')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('account')}</label>
                <select
                  value={formData.accountId}
                  onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  required
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency} {formatCurrency(a.current_balance, a.currency)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">{t('amount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">{t('date')}</label>
                  <input
                    type="date"
                    required
                    value={formData.transactionDate}
                    onChange={e => setFormData({ ...formData, transactionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('payee')}</label>
                <input
                  type="text"
                  required
                  value={formData.payee}
                  onChange={e => setFormData({ ...formData, payee: e.target.value })}
                  placeholder="e.g. Grocery Store, Electric Utility, Restaurant"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('category')}</label>
                <select
                  value={formData.categoryId}
                  onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">{t('all')}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.classification})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('notes')}</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional details..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
