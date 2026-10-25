import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account } from '../types';
import { PageId } from '../components/Navigation';
import {
  COUNTRY_BANK_CATALOG,
  getCountryBanking,
  detectBankFromIfsc,
  CountryBankingInfo,
  BankInfo,
  BankBranch
} from '../data/bankCatalog';
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
  X,
  Lock,
  ArrowRight,
  ExternalLink,
  Smartphone,
  Receipt,
  Landmark,
  KeyRound,
  Zap
} from 'lucide-react';
import { ConnectBankModal } from '../components/ConnectBankModal';
import { BankBranchSelector } from '../components/BankBranchSelector';

interface AccountsPageProps {
  onNavigate?: (page: PageId) => void;
}

export const AccountsPage: React.FC<AccountsPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDigits } = useLanguage();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('IN');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    accountType: 'SAVINGS',
    openingBalance: '10000.00',
    currency: user?.currency || 'INR',
    accountNumber: '',
    institution: '',
    country: 'IN',
    ifscCode: '',
    branchName: '',
  });

  const activeCountry = getCountryBanking(selectedCountryCode);

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

  const handleSetPrimaryReceiving = async (id: string, name: string) => {
    try {
      const res = await api.setPrimaryReceivingAccount(id);
      setSuccessMessage(res.message || `${name} is now primary receiving account.`);
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed updating primary account');
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // When country changes, reset bank & branch
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = getCountryBanking(countryCode);
    const firstBank = country.banks[0];
    const firstBranch = firstBank?.branches[0];

    setSelectedBankId(firstBank?.id || '');
    setSelectedBranchCode(firstBranch?.code || '');
    setFormData(prev => ({
      ...prev,
      country: countryCode,
      currency: country.currency,
      institution: firstBank?.name || '',
      ifscCode: firstBranch?.code || '',
      branchName: firstBranch?.branchName || '',
      name: firstBank ? `${firstBank.shortName} ${prev.accountType === 'SAVINGS' ? 'Savings' : 'Account'}` : prev.name,
    }));
  };

  // When bank changes, update branches and IFSC
  const handleBankChange = (bankId: string) => {
    setSelectedBankId(bankId);
    const bank = activeCountry.banks.find(b => b.id === bankId);
    if (bank) {
      const firstBranch = bank.branches[0];
      setSelectedBranchCode(firstBranch?.code || '');
      setFormData(prev => ({
        ...prev,
        institution: bank.name,
        ifscCode: firstBranch?.code || bank.codePrefix || '',
        branchName: firstBranch?.branchName || '',
        name: `${bank.shortName} ${prev.accountType === 'SAVINGS' ? 'Savings' : 'Account'}`,
      }));
    }
  };

  // When branch changes, update IFSC and branch name
  const handleBranchChange = (code: string) => {
    setSelectedBranchCode(code);
    const bank = activeCountry.banks.find(b => b.id === selectedBankId);
    const branch = bank?.branches.find(br => br.code === code);
    if (branch) {
      setFormData(prev => ({
        ...prev,
        ifscCode: branch.code,
        branchName: branch.branchName,
      }));
    }
  };

  // If user manually types IFSC code, attempt auto-detect
  const handleIfscInputChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setFormData(prev => ({ ...prev, ifscCode: clean }));
    const detected = detectBankFromIfsc(clean, selectedCountryCode);
    if (detected?.bank) {
      setSelectedBankId(detected.bank.id);
      setFormData(prev => ({
        ...prev,
        institution: detected.bank!.name,
        branchName: detected.branch?.branchName || prev.branchName,
      }));
    }
  };

  const openCreateModal = () => {
    setEditingAccount(null);
    const country = getCountryBanking(user?.currency === 'USD' ? 'US' : 'IN');
    const firstBank = country.banks[0];
    const firstBranch = firstBank?.branches[0];

    setSelectedCountryCode(country.code);
    setSelectedBankId(firstBank?.id || '');
    setSelectedBranchCode(firstBranch?.code || '');

    setFormData({
      name: firstBank ? `${firstBank.shortName} Savings` : 'Main Bank Account',
      accountType: 'SAVINGS',
      openingBalance: '25000.00',
      currency: country.currency,
      accountNumber: '501004829104',
      institution: firstBank?.name || 'HDFC Bank',
      country: country.code,
      ifscCode: firstBranch?.code || 'HDFC0000240',
      branchName: firstBranch?.branchName || 'Fort Mumbai Branch',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setSelectedCountryCode(acc.country || 'IN');
    setFormData({
      name: acc.name,
      accountType: acc.account_type,
      openingBalance: acc.opening_balance,
      currency: acc.currency,
      accountNumber: acc.account_number_masked || acc.account_number || '',
      institution: acc.institution || '',
      country: acc.country || 'IN',
      ifscCode: acc.ifsc_code || '',
      branchName: acc.branch_name || '',
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
          currency: formData.currency,
          country: formData.country,
          ifsc_code: formData.ifscCode,
          branch_name: formData.branchName,
        });
        setSuccessMessage('Account updated and secured in cryptographic vault.');
      } else {
        await api.createAccount(formData);
        setSuccessMessage(`Account created and synced with ${formData.institution}!`);
      }
      setIsModalOpen(false);
      loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save account');
    }
  };

  const handleSyncRealAccount = async (id: string, name: string) => {
    setSyncingId(id);
    setErrorMessage(null);
    try {
      const res = await api.syncAccount(id);
      setSuccessMessage(res.message || `Account ${name} synced with live records!`);
      await loadAccounts();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sync account');
    } finally {
      setSyncingId(null);
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Only empty accounts can be removed.`)) {
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
      {/* Navigation Pills Bar */}
      {onNavigate && (
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ← {t('navDashboard')}
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-xs"
          >
            🏦 {t('navAccounts')} (Active)
          </button>
          <button
            onClick={() => onNavigate('linked')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Smartphone className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{t('navLinked')} (Auto-Sync)</span>
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Receipt className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('navTransactions')}</span>
          </button>
          <button
            onClick={() => onNavigate('assets')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Landmark className="h-3.5 w-3.5 text-slate-500" />
            <span>{t('navAssetsLiabilities')}</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Military-Grade AES-256 Vault
            </span>
            <span className="text-xs text-slate-400">
              {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'} Synced
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            {t('accountsTitle')}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {t('accountsSubtitle')} • Select country banks, branches, and IFSC codes with real-time balance sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
          >
            <Zap className="h-4 w-4 fill-white" />
            <span>Connect Bank Account</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{t('addAccountBtn')}</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('linked')}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Smartphone className="h-4 w-4" />
              <span>Link via UPI & Banking</span>
            </button>
          )}
        </div>
      </div>

      {/* Security Vault Banner */}
      <div className="p-4 rounded-2xl bg-cyan-500/10 dark:bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3 text-xs">
        <Lock className="h-5 w-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Next-Level Database Vault Security Active</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold">
              AES-256-GCM + HMAC-SHA256
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            All account numbers and IFSC identifiers are encrypted at rest with hardware-accelerated AES-256-GCM. Cryptographic HMAC seals prevent unauthorized database tampering, and real account balances sync directly with verified transaction records.
          </p>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Accounts List / Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-2">{t('loading')}</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Wallet className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Bank Account Connected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your Google Account is active. Connect your bank account with verified NPCI simulation, or add an account manually.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>Connect Bank Account</span>
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer transition-all"
            >
              {t('addAccountBtn')} (Manual)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(acc => {
            const Icon = getAccountIcon(acc.account_type);
            const country = COUNTRY_BANK_CATALOG.find(c => c.code === (acc.country || 'IN')) || COUNTRY_BANK_CATALOG[0];
            const isSyncing = syncingId === acc.id;

            return (
              <div
                key={acc.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {getLocalizedTypeLabel(acc.account_type)}
                          </span>
                          <span className="text-xs" title={country.name}>
                            {country.flag}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                          {acc.name}
                        </h3>
                        {acc.is_primary_receiving ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 mt-1">
                            ★ Primary for Receiving
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetPrimaryReceiving(acc.id, acc.name)}
                            className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer mt-0.5 block"
                          >
                            Set as Primary Receiving
                          </button>
                        )}
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bank & Branch Details */}
                  <div className="mt-3 space-y-1 text-xs">
                    {acc.institution && (
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>{t('institution')}:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{acc.institution}</span>
                      </div>
                    )}
                    {acc.branch_name && (
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>Branch:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{acc.branch_name}</span>
                      </div>
                    )}
                    {acc.ifsc_code && (
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>{country.codeLabel}:</span>
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{acc.ifsc_code}</span>
                      </div>
                    )}
                    {(acc.account_number_masked || acc.account_number) && (
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span>{t('accountNumber')}:</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
                          <Lock className="h-3 w-3 text-emerald-500" />
                          <span>{acc.account_number_masked || acc.account_number}</span>
                        </span>
                      </div>
                    )}
                    {acc.upi_vpa && (
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <span>UPI VPA:</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold">{acc.upi_vpa}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Balances & Live Sync Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">{t('currentBalance')}</span>
                    <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(acc.current_balance, acc.currency)}
                    </span>
                  </div>

                  {/* Sync & Reconcile Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                    <button
                      onClick={() => handleSyncRealAccount(acc.id, acc.name)}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-semibold cursor-pointer transition-all disabled:opacity-50"
                      title="Sync live balance with verified transactions and banking records"
                    >
                      <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync Real Account'}</span>
                    </button>

                    <button
                      onClick={() => handleReconcileAccount(acc.id)}
                      className={`flex items-center gap-1 font-semibold cursor-pointer ${
                        acc.is_reconciled
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-500 hover:underline'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>{acc.is_reconciled ? 'Verified' : 'Unverified'}</span>
                    </button>
                  </div>

                  {/* Cryptographic Security Seal Badge */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span className="text-slate-500">Vault Seal:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {acc.security_seal ? `HMAC-${acc.security_seal}` : 'AES-GCM Secure'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT BANK ACCOUNT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingAccount ? 'Edit Bank Account' : 'Add Bank Account with IFSC'}
                </h3>
                <p className="text-xs text-slate-500">
                  Select your country, bank institution, branch, and IFSC code for encrypted tracking.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              {/* Hierarchical Country, State, City, Bank & Registered Branch Selector */}
              <div>
                <BankBranchSelector
                  initialCountry={selectedCountryCode}
                  initialBankId={selectedBankId}
                  initialIfsc={formData.ifscCode}
                  onSelect={({ bank, branch, country }) => {
                    setSelectedCountryCode(country.code);
                    setSelectedBankId(bank.id);
                    setSelectedBranchCode(branch.code);
                    setFormData(prev => ({
                      ...prev,
                      country: country.code,
                      currency: country.currency,
                      institution: bank.name,
                      ifscCode: branch.code,
                      branchName: branch.branchName,
                      name: `${bank.shortName} ${prev.accountType === 'SAVINGS' ? 'Savings' : 'Account'}`,
                    }));
                  }}
                />
              </div>

              {/* Account Nickname & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('accountName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. HDFC Salary Account"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('accountType')}
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={e => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="SAVINGS">{t('savingsAccount')}</option>
                    <option value="CHECKING">{t('checkingAccount')} (Current)</option>
                    <option value="CREDIT_CARD">{t('creditCard')}</option>
                    <option value="INVESTMENT">{t('investmentAccount')}</option>
                    <option value="CASH">{t('cashWallet')}</option>
                  </select>
                </div>
              </div>

              {/* IFSC Code & Branch Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>{activeCountry.codeLabel}</span>
                    <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">Auto-detected</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ifscCode}
                    onChange={e => handleIfscInputChange(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-bold focus:outline-none focus:border-cyan-500 uppercase"
                    placeholder={activeCountry.codePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.branchName}
                    onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                    placeholder="e.g. Fort Main Branch"
                  />
                </div>
              </div>

              {/* Account Number & Opening Balance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{t('accountNumber')}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-bold focus:outline-none focus:border-cyan-500"
                    placeholder="501004829104"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Encrypted with AES-256-GCM vault security
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('openingBalance')} ({formData.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.openingBalance}
                    onChange={e => setFormData({ ...formData, openingBalance: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-bold focus:outline-none focus:border-cyan-500"
                    placeholder="10000.00"
                  />
                </div>
              </div>

              {/* Security confirmation badge */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  Anti-hack cryptographic storage active: Account number will be masked as {formData.accountNumber ? `•••• •••• ${formData.accountNumber.slice(-4)}` : '•••• •••• XXXX'}.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {editingAccount ? t('save') : 'Save & Secure in Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Bank Modal */}
      <ConnectBankModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={loadAccounts}
      />
    </div>
  );
};
