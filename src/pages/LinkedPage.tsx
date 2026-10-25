import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account, Investment } from '../types';
import { PageId } from '../components/Navigation';
import {
  COUNTRY_BANK_CATALOG,
  getCountryBanking,
  detectBankFromIfsc,
  CountryBankingInfo,
  BankInfo,
  BankBranch
} from '../data/bankCatalog';
import { BankBranchSelector } from '../components/BankBranchSelector';
import {
  Building2,
  Smartphone,
  TrendingUp,
  PlusCircle,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Trash2,
  X,
  CreditCard,
  ShieldCheck,
  Send,
  ArrowRight,
  Sparkles,
  QrCode,
  Lock,
  Landmark,
  Shield,
  KeyRound,
  Coins,
  LayoutDashboard,
  Wallet,
  Receipt,
  Scale
} from 'lucide-react';

interface LinkedPageProps {
  onNavigate?: (page: PageId) => void;
}

export const LinkedPage: React.FC<LinkedPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, formatCurrency, formatNumber, formatDate, formatDigits } = useLanguage();
  const [linkedItems, setLinkedItems] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [growthLog, setGrowthLog] = useState<string[]>([]);
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isSimulateUpiModalOpen, setIsSimulateUpiModalOpen] = useState(false);

  // Country Bank Catalog state
  const defaultCountry = COUNTRY_BANK_CATALOG[0]; // India
  const [selectedCountryName, setSelectedCountryName] = useState<string>('India');
  const [selectedBankId, setSelectedBankId] = useState<string>(defaultCountry.banks[0]?.id || 'sbi');
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>(defaultCountry.banks[0]?.branches[0]?.code || 'SBIN0000300');
  const [ifscFormatValid, setIfscFormatValid] = useState<boolean>(true);

  // Forms
  const [bankForm, setBankForm] = useState({
    country: 'India',
    bankName: 'State Bank of India (SBI)',
    branchName: 'Mumbai Main Branch (Fort)',
    accountNumber: '38192048190',
    ifscOrRouting: 'SBIN0000300',
    accountType: 'SAVINGS',
    openingBalance: '25000.00',
  });

  const [upiForm, setUpiForm] = useState({
    upiId: 'alex@okhdfcbank',
    upiApp: 'Google Pay',
    linkedAccountId: '',
  });

  const [invForm, setInvForm] = useState({
    providerName: 'Zerodha Coin (Mutual Funds)',
    folioOrPan: '1048291048',
    portfolioType: 'MUTUAL_FUND_SIP',
    initialInvested: '50000.00',
    expectedCagr: '12.5',
  });

  const [upiSimForm, setUpiSimForm] = useState({
    upiId: '',
    type: 'EXPENSE',
    amount: '450.00',
    merchantOrPayer: 'Starbucks Cafe / QR Scan',
    notes: 'Coffee and breakfast via UPI',
  });

  // Current active country config
  const activeCountry = getCountryBanking(selectedCountryName) || defaultCountry;

  // Sync real account with live balance calculation
  const handleSyncAccount = async (accId: string) => {
    setSyncingAccountId(accId);
    try {
      const res = await api.syncAccount(accId);
      setStatusMessage(res.message);
      await loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Sync failed'}`);
    } finally {
      setSyncingAccountId(null);
    }
  };

  // When country changes, update active bank and branch
  const handleCountryChange = (countryName: string) => {
    setSelectedCountryName(countryName);
    const countryObj = getCountryBanking(countryName) || defaultCountry;
    const firstBank = countryObj.banks[0];
    const firstBranch = firstBank?.branches[0];

    setSelectedBankId(firstBank?.id || '');
    setSelectedBranchCode(firstBranch?.code || '');
    setBankForm(prev => ({
      ...prev,
      country: countryName,
      bankName: firstBank?.name || '',
      branchName: firstBranch?.branchName || '',
      ifscOrRouting: firstBranch?.code || '',
    }));
    setIfscFormatValid(true);
  };

  // When bank changes, update active branch and IFSC
  const handleBankChange = (bankId: string) => {
    setSelectedBankId(bankId);
    const bank = activeCountry.banks.find(b => b.id === bankId);
    const firstBranch = bank?.branches[0];

    setSelectedBranchCode(firstBranch?.code || '');
    setBankForm(prev => ({
      ...prev,
      bankName: bank?.name || prev.bankName,
      branchName: firstBranch?.branchName || '',
      ifscOrRouting: firstBranch?.code || '',
    }));
    setIfscFormatValid(true);
  };

  // When branch changes, auto-fill IFSC/code
  const handleBranchChange = (branchCode: string) => {
    setSelectedBranchCode(branchCode);
    const bank = activeCountry.banks.find(b => b.id === selectedBankId);
    const branch = bank?.branches.find(br => br.code === branchCode);

    if (branch) {
      setBankForm(prev => ({
        ...prev,
        branchName: branch.branchName,
        ifscOrRouting: branch.code,
      }));
      setIfscFormatValid(true);
    }
  };

  // Manual IFSC change with auto-detection
  const handleIfscChange = (val: string) => {
    const upper = val.toUpperCase().trim();
    setBankForm(prev => ({ ...prev, ifscOrRouting: upper }));

    if (activeCountry.codeRegex) {
      setIfscFormatValid(upper === '' || activeCountry.codeRegex.test(upper));
    }

    // Auto-detect bank from code if India
    if (activeCountry.code === 'IN' && upper.length >= 4) {
      const detected = detectBankFromIfsc(upper);
      if (detected?.bank && detected.bank.id !== selectedBankId) {
        setSelectedBankId(detected.bank.id);
        setBankForm(prev => ({
          ...prev,
          bankName: detected.bank!.name,
          branchName: detected.branch?.branchName || prev.branchName
        }));
      }
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [linked, accs] = await Promise.all([
        api.getLinkedProviders(),
        api.getAccounts(),
      ]);
      setLinkedItems(linked);
      setAccounts(accs);
      if (accs.length > 0 && !upiForm.linkedAccountId) {
        setUpiForm(prev => ({ ...prev, linkedAccountId: accs[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLinkBank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.linkBank(bankForm);
      setStatusMessage(res.message);
      setIsBankModalOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Linking bank failed'}`);
    }
  };

  const handleLinkUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.linkUpi(upiForm);
      setStatusMessage(res.message);
      setIsUpiModalOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Linking UPI failed'}`);
    }
  };

  const handleLinkInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.linkInvestments(invForm);
      setStatusMessage(res.message);
      setIsInvestmentModalOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Linking investments failed'}`);
    }
  };

  const handleSimulateUpiPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.simulateUpiPayment(upiSimForm);
      setStatusMessage(res.message);
      setIsSimulateUpiModalOpen(false);
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'UPI simulation failed'}`);
    }
  };

  const handleTriggerAutoGrowth = async (months: number = 1) => {
    try {
      setStatusMessage(`Executing auto-growth engine for ${months} month(s)...`);
      const res = await api.triggerAutoGrowth(months);
      setStatusMessage(res.message);
      if (res.data?.details) {
        setGrowthLog(res.data.details);
      }
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Auto-growth simulation failed'}`);
    }
  };

  const handleUnlink = async (id: string) => {
    if (!confirm('Unlink this provider?')) return;
    try {
      await api.unlinkProvider(id);
      loadData();
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message || 'Failed unlinking provider'}`);
    }
  };

  const cur = user?.currency || 'INR';

  const bankItems = linkedItems.filter(i => i.item_type === 'BANK');
  const upiItems = linkedItems.filter(i => i.item_type === 'UPI');
  const investmentItems = linkedItems.filter(i => i.item_type === 'INVESTMENT');

  return (
    <div className="space-y-6">
      {/* Cross-Page Quick Navigation Bar */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-300 font-semibold shrink-0 shadow-2xs cursor-pointer"
          >
            <Smartphone className="h-3.5 w-3.5 text-sky-500" />
            Linked Banking (Auto-Sync)
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <Receipt className="h-3.5 w-3.5 text-amber-500" />
            Transactions
          </button>
          <button
            onClick={() => onNavigate('investments')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-500 transition-colors shrink-0 shadow-2xs font-medium cursor-pointer"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            Investments &amp; SIPs
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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('linkedTitle')}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="h-3 w-3" />
              AES-256 Encrypted
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('linkedSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTriggerAutoGrowth(1)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            {t('triggerAutoGrowthBtn')}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Auto-Growth Output Details */}
      {growthLog.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs space-y-2">
          <div className="font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Auto-Growth &amp; Yield Breakdown Applied:
          </div>
          <ul className="space-y-1 text-slate-300 font-mono text-[11px] list-disc list-inside">
            {growthLog.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Action Cards: Link Bank, Link UPI, Link Investment, Simulate UPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setIsBankModalOpen(true)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 shadow-sm transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('linkBankAccountBtn')}</h3>
          <p className="text-xs text-slate-500 mt-1">Connect Indian IFSC banks, US routing, UK or global accounts</p>
        </button>

        <button
          onClick={() => setIsUpiModalOpen(true)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Smartphone className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('linkUpiBtn')}</h3>
          <p className="text-xs text-slate-500 mt-1">Google Pay, PhonePe, Paytm, BHIM VPA</p>
        </button>

        <button
          onClick={() => setIsInvestmentModalOpen(true)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit mb-3 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('linkInvestmentBtn')}</h3>
          <p className="text-xs text-slate-500 mt-1">Zerodha, Groww, CAMS Mutual Fund SIPs</p>
        </button>

        <button
          onClick={() => {
            if (upiItems.length > 0) {
              setUpiSimForm(prev => ({ ...prev, upiId: upiItems[0].id }));
            }
            setIsSimulateUpiModalOpen(true);
          }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-sm transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-3 group-hover:scale-110 transition-transform">
            <QrCode className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('simulateUpiPaymentBtn')}</h3>
          <p className="text-xs text-slate-500 mt-1">Simulate instant QR scan / payment debit</p>
        </button>
      </div>

      {/* Linked Banks Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('linkedBanks')} ({formatDigits(bankItems.length)})
            </h2>
          </div>
          <button
            onClick={() => setIsBankModalOpen(true)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            + Add Bank
          </button>
        </div>

        {bankItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No bank accounts linked yet. Link a bank account to enable automatic interest accrual and live balance tracking.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankItems.map(item => {
              const acc = accounts.find(a => a.id === item.linked_account_id);
              const isSyncing = syncingAccountId === acc?.id;
              return (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-3 shadow-2xs">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                            {item.status}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Lock className="h-2.5 w-2.5" />
                            AES-256 Vault
                          </span>
                          {acc?.security_seal && (
                            <span className="text-[9px] font-mono text-slate-400" title={`HMAC: ${acc.security_seal}`}>
                              HMAC-SHA256 ✓
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">{item.provider_name}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{item.identifier}</p>
                        {acc?.branch_name && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <Landmark className="h-3 w-3 text-sky-400 shrink-0" />
                            {acc.branch_name}
                          </p>
                        )}
                        {acc?.ifsc_code && (
                          <p className="text-[10px] font-mono text-sky-500 dark:text-sky-400 mt-0.5">
                            IFSC: {acc.ifsc_code}
                          </p>
                        )}
                      </div>
                      <button onClick={() => handleUnlink(item.id)} className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="text-xs flex justify-between items-baseline font-mono">
                      <span className="text-slate-400 text-[11px]">Live Balance:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(acc?.current_balance || '0.00', acc?.currency || cur)}
                      </span>
                    </div>

                    {acc && (
                      <button
                        onClick={() => handleSyncAccount(acc.id)}
                        disabled={isSyncing}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all cursor-pointer"
                      >
                        <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Syncing Balance...' : 'Sync Real Account'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked UPI IDs Section */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('linkedUpis')} ({formatDigits(upiItems.length)})
            </h2>
          </div>
          <button
            onClick={() => setIsUpiModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            + Add UPI
          </button>
        </div>

        {upiItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No UPI IDs linked. Add your Google Pay, PhonePe, or Paytm UPI VPA to enable auto-ledgering.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upiItems.map(item => {
              const acc = accounts.find(a => a.id === item.linked_account_id);
              return (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          UPI VPA
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 font-mono">{item.identifier}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{item.provider_name}</p>
                      </div>
                      <button onClick={() => handleUnlink(item.id)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs flex justify-between items-baseline">
                    <span className="text-slate-400">Linked Account:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {acc?.name || 'Primary Bank'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked Investments & Portfolios */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('linkedInvestments')} ({formatDigits(investmentItems.length)})
            </h2>
          </div>
          <button
            onClick={() => setIsInvestmentModalOpen(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            + Add Portfolio
          </button>
        </div>

        {investmentItems.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No investment portfolios connected. Link Zerodha, Groww or CAMS to track automatic CAGR compounding.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investmentItems.map(item => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {item.growth_rate_percent}% CAGR Auto-Growth
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{item.provider_name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.identifier}</p>
                    </div>
                    <button onClick={() => handleUnlink(item.id)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Status: Active Auto-Yield</span>
                  <span className="text-emerald-500 font-semibold">Compounding</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Link Bank (With Country Banking Catalog, IFSC validation, and AES-256 Vault) */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Link Bank Account</h3>
                  <p className="text-[11px] text-slate-400">AES-256 Vault Encrypted &amp; Verified Sync</p>
                </div>
              </div>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLinkBank} className="space-y-4 text-xs">
              {/* Country, State, City, Bank & Branch Selector */}
              <div>
                <BankBranchSelector
                  initialCountry={activeCountry.code}
                  initialBankId={selectedBankId}
                  initialIfsc={bankForm.ifscOrRouting}
                  onSelect={({ bank, branch, country }) => {
                    setSelectedCountryName(country.name);
                    setSelectedBankId(bank.id);
                    setSelectedBranchCode(branch.code);
                    setBankForm(prev => ({
                      ...prev,
                      country: country.name,
                      bankName: bank.name,
                      branchName: branch.branchName,
                      ifscOrRouting: branch.code,
                    }));
                    setIfscFormatValid(true);
                  }}
                />
              </div>

              {/* IFSC / Routing Code & Account Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400">
                      {activeCountry.codeLabel}
                    </label>
                    {ifscFormatValid ? (
                      <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Valid
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                        <AlertCircle className="h-3 w-3" /> Check format
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={activeCountry.codePlaceholder}
                    value={bankForm.ifscOrRouting}
                    onChange={e => handleIfscChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase text-sm"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">{activeCountry.codeFormatHelp}</p>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 38192048190"
                    value={bankForm.accountNumber}
                    onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  />
                  {bankForm.accountNumber.length > 4 && (
                    <p className="text-[10px] text-emerald-500 font-mono mt-0.5">
                      Masked preview: •••• •••• {bankForm.accountNumber.slice(-4)}
                    </p>
                  )}
                </div>
              </div>

              {/* Account Type & Initial Balance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Account Type</label>
                  <select
                    value={bankForm.accountType}
                    onChange={e => setBankForm({ ...bankForm, accountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CHECKING">Current / Checking</option>
                    <option value="SALARY">Salary Account</option>
                    <option value="CREDIT_CARD">Credit Card Account</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Initial Balance ({activeCountry.currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bankForm.openingBalance}
                    onChange={e => setBankForm({ ...bankForm, openingBalance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  />
                </div>
              </div>

              {/* Next-Level Cryptographic Security Guarantee */}
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 space-y-1.5 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400">
                  <Shield className="h-4 w-4 shrink-0 text-sky-500" />
                  Bank-Grade Field Encryption &amp; Anti-Tamper Security
                </div>
                <p>
                  Account numbers and IFSC/routing codes are encrypted at rest using <strong>AES-256-GCM</strong> authenticated encryption. A cryptographic <strong>HMAC-SHA256 integrity seal</strong> protects against database manipulation, and only masked numbers are displayed.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold shadow-md cursor-pointer"
                >
                  Connect &amp; Vault Encrypt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link UPI */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Link UPI VPA ID</h3>
              <button onClick={() => setIsUpiModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleLinkUpi} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">UPI ID (VPA)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@okhdfcbank, 9876543210@ybl"
                  value={upiForm.upiId}
                  onChange={e => setUpiForm({ ...upiForm, upiId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">UPI App</label>
                <select
                  value={upiForm.upiApp}
                  onChange={e => setUpiForm({ ...upiForm, upiApp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm UPI">Paytm</option>
                  <option value="BHIM UPI">BHIM UPI</option>
                  <option value="CRED UPI">CRED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Link to Bank Account</label>
                <select
                  value={upiForm.linkedAccountId}
                  onChange={e => setUpiForm({ ...upiForm, linkedAccountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">Select account...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency} {a.current_balance})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsUpiModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                  Connect UPI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Link Investment */}
      {isInvestmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Link Investment / Demat Portfolio</h3>
              <button onClick={() => setIsInvestmentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleLinkInvestment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Platform / Broker</label>
                <select
                  value={invForm.providerName}
                  onChange={e => setInvForm({ ...invForm, providerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="Zerodha Coin (Mutual Funds)">Zerodha Coin (Mutual Funds)</option>
                  <option value="Groww (Direct Mutual Funds)">Groww (Direct Mutual Funds)</option>
                  <option value="CAMS / KFintech Consolidated">CAMS / KFintech</option>
                  <option value="Bank Fixed Deposit Portfolio">Bank Fixed Deposit (FD)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Folio / Demat ID</label>
                <input
                  type="text"
                  placeholder="e.g. 1048291048"
                  value={invForm.folioOrPan}
                  onChange={e => setInvForm({ ...invForm, folioOrPan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Invested Value ({cur})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={invForm.initialInvested}
                    onChange={e => setInvForm({ ...invForm, initialInvested: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Target CAGR (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={invForm.expectedCagr}
                    onChange={e => setInvForm({ ...invForm, expectedCagr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsInvestmentModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Link Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Simulate UPI Payment */}
      {isSimulateUpiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Simulate Live UPI Payment</h3>
              </div>
              <button onClick={() => setIsSimulateUpiModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSimulateUpiPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Select UPI VPA</label>
                <select
                  value={upiSimForm.upiId}
                  onChange={e => setUpiSimForm({ ...upiSimForm, upiId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                >
                  {upiItems.length === 0 ? (
                    <option value="">Default App UPI</option>
                  ) : (
                    upiItems.map(u => (
                      <option key={u.id} value={u.id}>{u.identifier} ({u.provider_name})</option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Payment Type</label>
                  <select
                    value={upiSimForm.type}
                    onChange={e => setUpiSimForm({ ...upiSimForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="EXPENSE">Debit / QR Scan (-)</option>
                    <option value="INCOME">Received via UPI (+)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Amount ({cur})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={upiSimForm.amount}
                    onChange={e => setUpiSimForm({ ...upiSimForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Merchant / Payer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Food, D-Mart Store, Friend"
                  value={upiSimForm.merchantOrPayer}
                  onChange={e => setUpiSimForm({ ...upiSimForm, merchantOrPayer: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsSimulateUpiModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  Execute UPI Simulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
