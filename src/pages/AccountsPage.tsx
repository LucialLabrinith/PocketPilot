import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account } from '../types';
import {
  Wallet,
  PlusCircle,
  CreditCard,
  Building,
  Coins,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDigits } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    accountType: 'CHECKING',
    openingBalance: '0.00',
    currency: user?.currency || 'USD',
    accountNumber: '',
    institution: '',
  });

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed loading accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormData({
      name: '',
      accountType: 'CHECKING',
      openingBalance: '0.00',
      currency: user?.currency || 'USD',
      accountNumber: '',
      institution: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setFormData({
      name: acc.name,
      accountType: acc.account_type,
      openingBalance: acc.opening_balance,
      currency: acc.currency,
      accountNumber: acc.account_number || '',
      institution: acc.institution || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      if (editingAccount) {
        await api.updateAccount(editingAccount.id, {
          name: formData.name,
          account_type: formData.accountType as any,
          institution: formData.institution,
          account_number: formData.accountNumber,
        });
        setSuccessMessage('Account updated successfully');
      } else {
        await api.createAccount(formData);
        setSuccessMessage('Account created successfully');
      }
      setIsModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save account');
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All associated transactions will be preserved or must be detached.`)) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await api.deleteAccount(id);
      setSuccessMessage('Account deleted successfully');
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete account');
    }
  };

  const handleReconcileAccount = async (id: string) => {
    try {
      await api.reconcileAccount(id);
      setSuccessMessage('Account marked as reconciled');
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reconcile account');
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return Building;
      case 'SAVINGS':
        return Wallet;
      case 'CREDIT_CARD':
        return CreditCard;
      case 'INVESTMENT':
        return TrendingUp;
      case 'CASH':
      default:
        return Coins;
    }
  };

  const getLocalizedTypeLabel = (type: string) => {
    switch (type) {
      case 'CHECKING':
        return t('checkingAccount');
      case 'SAVINGS':
        return t('savingsAccount');
      case 'CREDIT_CARD':
        return t('creditCard');
      case 'INVESTMENT':
        return t('investmentAccount');
      case 'CASH':
      default:
        return t('cashWallet');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('accountsTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('accountsSubtitle')}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          {t('addAccountBtn')}
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Accounts List / Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <RefreshCw className="h-8 w-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">{t('loading')}</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
            <Wallet className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('noAccountsYet')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('createAccountPrompt')}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow cursor-pointer"
          >
            {t('addAccountBtn')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(acc => {
            const Icon = getAccountIcon(acc.account_type);
            return (
              <div
                key={acc.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between hover:border-sky-500/40 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {getLocalizedTypeLabel(acc.account_type)}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {acc.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(acc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        title={t('edit')}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {acc.institution && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {t('institution')}: <span className="font-medium text-slate-700 dark:text-slate-300">{acc.institution}</span>
                    </div>
                  )}
                  {acc.account_number && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {t('accountNumber')}: <span className="font-mono text-slate-700 dark:text-slate-300">{formatDigits(acc.account_number)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">{t('currentBalance')}</span>
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(acc.current_balance, acc.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t('openingBalance')}: {formatCurrency(acc.opening_balance, acc.currency)}</span>
                    <button
                      onClick={() => handleReconcileAccount(acc.id)}
                      className={`flex items-center gap-1 font-semibold cursor-pointer ${
                        acc.is_reconciled
                          ? 'text-emerald-600 dark:text-emerald-400 hover:opacity-80'
                          : 'text-amber-500 hover:underline'
                      }`}
                      title={t('reconcileAccount')}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {acc.is_reconciled ? t('reconciled') : t('pending')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingAccount ? t('edit') : t('addAccountBtn')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  {t('accountName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Chase Main Checking, Cash Wallet"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {t('accountType')}
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={e => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="CHECKING">{t('checkingAccount')}</option>
                    <option value="SAVINGS">{t('savingsAccount')}</option>
                    <option value="CASH">{t('cashWallet')}</option>
                    <option value="CREDIT_CARD">{t('creditCard')}</option>
                    <option value="INVESTMENT">{t('investmentAccount')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {t('currency')}
                  </label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>

              {!editingAccount && (
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {t('openingBalance')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.openingBalance}
                    onChange={e => setFormData({ ...formData, openingBalance: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">{t('openingBalance')}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {t('institution')}
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. HDFC Bank, SBI"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {t('accountNumber')}
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. •••• 4521"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow cursor-pointer"
                >
                  {editingAccount ? t('save') : t('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
