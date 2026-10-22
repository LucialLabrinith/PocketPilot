import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Account, Investment } from '../types';
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
  QrCode
} from 'lucide-react';

export const LinkedPage: React.FC = () => {
  const { user } = useAuth();
  const { t, formatCurrency, formatNumber, formatDate, formatDigits } = useLanguage();
  const [linkedItems, setLinkedItems] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [growthLog, setGrowthLog] = useState<string[]>([]);

  // Modals
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isSimulateUpiModalOpen, setIsSimulateUpiModalOpen] = useState(false);

  // Forms
  const [bankForm, setBankForm] = useState({
    bankName: 'HDFC Bank',
    accountNumber: '501004829104',
    ifscOrRouting: 'HDFC0000123',
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
      alert(err.message);
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
      alert(err.message);
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
      alert(err.message);
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
      alert(err.message);
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
      alert(err.message);
    }
  };

  const handleUnlink = async (id: string) => {
    if (!confirm('Unlink this provider?')) return;
    try {
      await api.unlinkProvider(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const cur = user?.currency || 'INR';

  const bankItems = linkedItems.filter(i => i.item_type === 'BANK');
  const upiItems = linkedItems.filter(i => i.item_type === 'UPI');
  const investmentItems = linkedItems.filter(i => i.item_type === 'INVESTMENT');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('linkedTitle')}
          </h1>
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
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
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
          <p className="text-xs text-slate-500 mt-1">Connect SBI, HDFC, ICICI, Axis or US banks</p>
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
              return (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                          {item.status}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{item.provider_name}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{item.identifier}</p>
                      </div>
                      <button onClick={() => handleUnlink(item.id)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs flex justify-between items-baseline font-mono">
                    <span className="text-slate-400">Live Balance:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(acc?.current_balance || '0.00', acc?.currency || cur)}
                    </span>
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
                      <button onClick={() => handleUnlink(item.id)} className="text-slate-400 hover:text-red-500">
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
                    <button onClick={() => handleUnlink(item.id)} className="text-slate-400 hover:text-red-500">
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

      {/* Modal: Link Bank */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Link Bank Account</h3>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleLinkBank} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Bank Name</label>
                <select
                  value={bankForm.bankName}
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  <option value="Chase Bank">Chase Bank</option>
                  <option value="Bank of America">Bank of America</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  placeholder="501004829104"
                  value={bankForm.accountNumber}
                  onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">IFSC / Routing</label>
                  <input
                    type="text"
                    placeholder="HDFC0000123"
                    value={bankForm.ifscOrRouting}
                    onChange={e => setBankForm({ ...bankForm, ifscOrRouting: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Initial Balance ({cur})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bankForm.openingBalance}
                    onChange={e => setBankForm({ ...bankForm, openingBalance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] leading-relaxed">
                <ShieldCheck className="h-4 w-4 inline mr-1 text-sky-400" />
                Auto-growth engine calculates standard 3.5% p.a. quarterly savings interest credit automatically.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setIsBankModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold">
                  Connect Bank
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
