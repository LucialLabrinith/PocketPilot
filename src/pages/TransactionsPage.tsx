import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account, Category, Transaction } from '../types';
import { PageId } from '../components/Navigation';
import {
  Receipt,
  PlusCircle,
  Download,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit2,
  ArrowRightLeft,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  Calendar,
  LayoutDashboard,
  Wallet,
  Smartphone,
  PieChart,
  Scale,
  FileText
} from 'lucide-react';
import { BankSwitchComplianceModal } from '../components/BankSwitchComplianceModal';
import { LegalTransferCertificate } from '../types';

interface TransactionsPageProps {
  onNavigate?: (page: PageId) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDate, formatDigits } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importAccountId, setImportAccountId] = useState('');
  const [viewingCert, setViewingCert] = useState<LegalTransferCertificate | null>(null);

  const handleViewLegalCertificate = async (txId: string) => {
    try {
      const res = await api.getLegalCertificate(txId);
      setViewingCert(res.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load legal certificate');
    }
  };

  // Form State
  const [txForm, setTxForm] = useState({
    accountId: '',
    toAccountId: '',
    categoryId: '',
    type: 'EXPENSE',
    amount: '',
    transactionDate: new Date().toISOString().split('T')[0],
    notes: '',
    payee: '',
    isReconciled: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [txs, accs, cats] = await Promise.all([
        api.getTransactions({
          type: selectedType || undefined,
          accountId: selectedAccount || undefined,
          categoryId: selectedCategory || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          search: search || undefined,
        }),
        api.getAccounts(),
        api.getCategories(),
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setCategories(cats);
      if (accs.length > 0 && !txForm.accountId) {
        setTxForm(prev => ({ ...prev, accountId: accs[0].id }));
        setImportAccountId(accs[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed loading transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedType, selectedAccount, selectedCategory, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openAddModal = (defaultType = 'EXPENSE') => {
    setEditingTx(null);
    setTxForm({
      accountId: accounts[0]?.id || '',
      toAccountId: accounts[1]?.id || '',
      categoryId: categories.find(c => c.type === defaultType)?.id || '',
      type: defaultType,
      amount: '',
      transactionDate: new Date().toISOString().split('T')[0],
      notes: '',
      payee: '',
      isReconciled: false,
    });
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setTxForm({
      accountId: tx.account_id,
      toAccountId: tx.to_account_id || '',
      categoryId: tx.category_id || '',
      type: tx.type,
      amount: tx.amount,
      transactionDate: tx.transaction_date,
      notes: tx.notes || '',
      payee: tx.payee || '',
      isReconciled: tx.is_reconciled,
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!txForm.accountId) {
      setErrorMessage('Please select an account');
      return;
    }

    try {
      if (editingTx) {
        await api.updateTransaction(editingTx.id, {
          accountId: txForm.accountId,
          toAccountId: txForm.type === 'TRANSFER' ? txForm.toAccountId : null,
          categoryId: txForm.type === 'TRANSFER' ? null : (txForm.categoryId || null),
          type: txForm.type as any,
          amount: txForm.amount,
          transactionDate: txForm.transactionDate,
          notes: txForm.notes,
          payee: txForm.payee,
          is_reconciled: txForm.isReconciled,
        });
        setSuccessMessage('Transaction updated successfully');
      } else {
        await api.createTransaction({
          accountId: txForm.accountId,
          toAccountId: txForm.type === 'TRANSFER' ? txForm.toAccountId : null,
          categoryId: txForm.type === 'TRANSFER' ? null : (txForm.categoryId || null),
          type: txForm.type,
          amount: txForm.amount,
          transactionDate: txForm.transactionDate,
          notes: txForm.notes,
          payee: txForm.payee,
        });
        setSuccessMessage('Transaction recorded successfully');
      }
      setIsAddEditModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.deleteTransaction(id);
      setSuccessMessage('Transaction deleted');
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed deleting transaction');
    }
  };

  const handleExportCsv = () => {
    window.location.href = '/api/transactions/export-csv';
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCsvText.trim()) return;
    try {
      const res = await api.importCsv(importCsvText, importAccountId);
      setSuccessMessage(res.message);
      setIsImportModalOpen(false);
      setImportCsvText('');
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'CSV Import failed');
    }
  };

  const cur = user?.currency || 'USD';

  return (
    <div className="space-y-6">
      {/* Cross-Page Navigation */}
      {onNavigate && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
            Navigate:
          </span>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-sky-500" />
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('accounts')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <Wallet className="h-3.5 w-3.5 text-blue-500" />
            Accounts &amp; Cards
          </button>
          <button
            onClick={() => onNavigate('linked')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <Smartphone className="h-3.5 w-3.5 text-sky-500" />
            Linked Banking
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0 shadow-2xs cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5 text-amber-500" />
            Transactions
          </button>
          <button
            onClick={() => onNavigate('income')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
            Income
          </button>
          <button
            onClick={() => onNavigate('expenses')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
            Expenses
          </button>
          <button
            onClick={() => onNavigate('budget')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <PieChart className="h-3.5 w-3.5 text-indigo-500" />
            Budgets
          </button>
          <button
            onClick={() => onNavigate('networth')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <Scale className="h-3.5 w-3.5 text-purple-500" />
            Net Worth
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('transactionsTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('transactionsSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            {t('importCsv')}
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {t('exportCsv')}
          </button>
          <button
            onClick={() => openAddModal('EXPENSE')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            {t('addTransaction')}
          </button>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search payee or notes..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </form>

          {/* Type filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="">{t('filterByType')}</option>
              <option value="INCOME">{t('typeIncome')} (+)</option>
              <option value="EXPENSE">{t('typeExpense')} (-)</option>
              <option value="TRANSFER">{t('typeTransfer')} (↔)</option>
              <option value="REFUND">{t('typeRefund')} (↺)</option>
            </select>
          </div>

          {/* Account filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="">{t('filterByAccount')}</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="">{t('filterByCategory')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-medium">Date Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
          {(selectedType || selectedAccount || selectedCategory || startDate || endDate || search) && (
            <button
              onClick={() => {
                setSelectedType('');
                setSelectedAccount('');
                setSelectedCategory('');
                setStartDate('');
                setEndDate('');
                setSearch('');
              }}
              className="text-xs text-sky-500 hover:underline cursor-pointer ml-auto"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading ledger records...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No transactions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records for the current filter criteria or your ledger is fresh.
            </p>
            <button
              onClick={() => openAddModal('EXPENSE')}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow cursor-pointer"
            >
              + Record Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t('date')}</th>
                  <th className="py-3 px-4">{t('accountType')}</th>
                  <th className="py-3 px-4">{t('payee')}</th>
                  <th className="py-3 px-4">{t('account')}</th>
                  <th className="py-3 px-4">{t('category')}</th>
                  <th className="py-3 px-4 text-right">{t('amount')}</th>
                  <th className="py-3 px-4 text-center">{t('reconciled')}</th>
                  <th className="py-3 px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {transactions.map(tx => {
                  const sourceAcc = accounts.find(a => a.id === tx.account_id);
                  const destAcc = tx.to_account_id ? accounts.find(a => a.id === tx.to_account_id) : null;
                  const cat = categories.find(c => c.id === tx.category_id);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{formatDate(tx.transaction_date)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
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
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{tx.payee || '—'}</span>
                          {tx.npci_rrn && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title={`NPCI RRN: ${tx.npci_rrn} | Pinnacle Ref: ${tx.cbs_pinnacle_ref || 'N/A'}`}>
                              NPCI {tx.npci_rrn.slice(0, 4)}...{tx.npci_rrn.slice(-4)}
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-400 line-clamp-1">{tx.notes}</div>
                        )}
                        {tx.transfer_fee !== undefined && (
                          <div className="text-[9px] text-emerald-600 dark:text-emerald-400/80 font-mono flex items-center gap-1 mt-0.5">
                            <span>RBI Sec 10(2) Legal Fee: ₹{Number(tx.transfer_fee).toFixed(2)}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {tx.type === 'TRANSFER' ? (
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            {sourceAcc?.name || 'Account'} → {destAcc?.name || 'Account'}
                          </span>
                        ) : (
                          <span>{sourceAcc?.name || '—'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {cat ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={
                          tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' :
                          tx.type === 'EXPENSE' ? 'text-rose-600 dark:text-rose-400' :
                          tx.type === 'REFUND' ? 'text-amber-600 dark:text-amber-400' :
                          'text-blue-600 dark:text-blue-400'
                        }>
                          {tx.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.amount, cur)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          tx.is_reconciled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {tx.is_reconciled ? t('reconciled') : t('pending')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewLegalCertificate(tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                            title="View Legal NPCI & Pinnacle Transfer Certificate"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Transaction Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTx ? 'Edit Transaction' : 'Record Transaction'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              {/* Type selector pills */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'EXPENSE', label: 'Expense', icon: ArrowUpRight, color: 'hover:border-rose-500' },
                    { id: 'INCOME', label: 'Income', icon: ArrowDownLeft, color: 'hover:border-emerald-500' },
                    { id: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'hover:border-blue-500' },
                    { id: 'REFUND', label: 'Refund', icon: RotateCcw, color: 'hover:border-amber-500' },
                  ].map(t => {
                    const active = txForm.type === t.id;
                    const Icon = t.icon;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setTxForm({ ...txForm, type: t.id })}
                        className={`py-2 px-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 ' + t.color
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-[11px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Amount ({cur})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={txForm.amount}
                    onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-base font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={txForm.transactionDate}
                    onChange={e => setTxForm({ ...txForm, transactionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Source & Destination Accounts */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    {txForm.type === 'TRANSFER' ? 'From Account' : 'Account'}
                  </label>
                  <select
                    value={txForm.accountId}
                    onChange={e => setTxForm({ ...txForm, accountId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.currency} {a.current_balance})</option>
                    ))}
                  </select>
                </div>

                {txForm.type === 'TRANSFER' ? (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      To Account
                    </label>
                    <select
                      value={txForm.toAccountId}
                      onChange={e => setTxForm({ ...txForm, toAccountId: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                    >
                      <option value="">Select destination...</option>
                      {accounts.filter(a => a.id !== txForm.accountId).map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.currency} {a.current_balance})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Category
                    </label>
                    <select
                      value={txForm.categoryId}
                      onChange={e => setTxForm({ ...txForm, categoryId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                    >
                      <option value="">No Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Payee / Description */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Payee / Merchant
                  </label>
                  <input
                    type="text"
                    value={txForm.payee}
                    onChange={e => setTxForm({ ...txForm, payee: e.target.value })}
                    placeholder="e.g. Supermarket, Employer, Landlord"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={txForm.notes}
                    onChange={e => setTxForm({ ...txForm, notes: e.target.value })}
                    placeholder="Optional details or memo"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={txForm.isReconciled}
                    onChange={e => setTxForm({ ...txForm, isReconciled: e.target.checked })}
                    className="rounded text-sky-600"
                  />
                  <span>Mark as reconciled with statement</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow cursor-pointer"
                  >
                    {editingTx ? 'Update Transaction' : 'Record Transaction'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-sky-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import CSV Ledger</h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleImportCsv} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Target Account for Imported Records
                </label>
                <select
                  value={importAccountId}
                  onChange={e => setImportAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Paste CSV Content (Headers: Date, Type, Amount, Payee, Notes)
                </label>
                <textarea
                  rows={6}
                  required
                  value={importCsvText}
                  onChange={e => setImportCsvText(e.target.value)}
                  placeholder="Date,Type,Amount,Payee,Notes&#10;2026-10-15,EXPENSE,45.50,Grocery Store,Weekly veggies&#10;2026-10-18,INCOME,1200.00,Client Freelance,Web project milestone"
                  className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Execute CSV Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bank Switch & Legal Certificate Compliance Modal */}
      {viewingCert && (
        <BankSwitchComplianceModal
          isOpen={Boolean(viewingCert)}
          onClose={() => setViewingCert(null)}
          selectedCertificate={viewingCert}
        />
      )}
    </div>
  );
};
