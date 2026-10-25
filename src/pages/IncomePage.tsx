import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account, Category, Transaction } from '../types';
import {
  ArrowDownLeft,
  PlusCircle,
  Briefcase,
  TrendingUp,
  Receipt,
  Calendar,
  CheckCircle2,
  X
} from 'lucide-react';

export const IncomePage: React.FC = () => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDate, formatDigits } = useLanguage();
  const [incomes, setIncomes] = useState<Transaction[]>([]);
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
        api.getTransactions({ type: 'INCOME' }),
        api.getAccounts(),
        api.getCategories(),
      ]);
      setIncomes(txs);
      setAccounts(accs);
      setCategories(cats.filter(c => c.type === 'INCOME'));
      if (accs.length > 0 && !formData.accountId) {
        setFormData(prev => ({ ...prev, accountId: accs[0].id }));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed loading income records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await api.createTransaction({
        accountId: formData.accountId,
        categoryId: formData.categoryId || null,
        type: 'INCOME',
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
      setErrorMessage(err.message || 'Failed recording income');
    }
  };

  const cur = user?.currency || 'INR';
  const totalIncome = incomes.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('incomeTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('incomeSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
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

      {/* Income Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('incomeTitle')}</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            +{formatCurrency(totalIncome, cur)}
          </div>
          <span className="text-[11px] text-slate-400">{t('totalCount')}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('totalCount')}</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {formatDigits(incomes.length)}
          </div>
          <span className="text-[11px] text-slate-400">{t('typeIncome')}</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">{t('averageLabel' in t ? 'Average' : 'incomeTarget')}</span>
          <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {formatCurrency(incomes.length > 0 ? totalIncome / incomes.length : 0, cur)}
          </div>
          <span className="text-[11px] text-slate-400">{t('typeIncome')} / item</span>
        </div>
      </div>

      {/* Income Records List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('incomeTitle')}</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('loading')}</div>
        ) : incomes.length === 0 ? (
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
                {incomes.map(item => {
                  const acc = accounts.find(a => a.id === item.account_id);
                  const cat = categories.find(c => c.id === item.category_id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{formatDate(item.transaction_date)}</td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-semibold">
                        <div>{item.payee || t('typeIncome')}</div>
                        {item.notes && <div className="text-[10px] text-slate-400 font-normal">{item.notes}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{acc?.name || '—'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                          {cat?.name || t('typeIncome')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        +{formatCurrency(item.amount, cur)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('addTransaction')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleRecordIncome} className="space-y-3.5 text-xs">
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
                  placeholder="e.g. Employer Inc, Client, Dividend"
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
                    <option key={c.id} value={c.id}>{c.name}</option>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
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
