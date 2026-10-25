import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { Investment, PocketMoneyState, Account } from '../types';
import { PageId } from '../components/Navigation';
import {
  TrendingUp,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Calendar,
  Landmark,
  Coins,
  Sparkles,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building2,
  ExternalLink,
  PieChart,
  LayoutDashboard,
  Wallet,
  Smartphone,
  Receipt,
  Scale,
  Settings
} from 'lucide-react';

interface InvestmentsPageProps {
  onNavigate?: (page: PageId) => void;
  onOpenUpiPay?: () => void;
}

const SUPPORTED_BROKERS = [
  { name: 'Zerodha Kite', tag: 'Equities & F&O', color: 'from-blue-600 to-indigo-700', logo: '🪁' },
  { name: 'Groww', tag: 'Direct Mutual Funds & Stocks', color: 'from-emerald-600 to-teal-700', logo: '🌱' },
  { name: 'Upstox', tag: 'Discount Brokerage', color: 'from-purple-600 to-indigo-700', logo: '📈' },
  { name: 'Angel One', tag: 'Smart Trading', color: 'from-amber-600 to-orange-700', logo: '👼' },
  { name: 'ICICI Direct', tag: 'Banking 3-in-1 Demat', color: 'from-orange-600 to-red-700', logo: '🏦' },
  { name: 'Dhan', tag: 'Superfast Trading', color: 'from-green-600 to-emerald-700', logo: '⚡' },
];

export const InvestmentsPage: React.FC<InvestmentsPageProps> = ({ onNavigate, onOpenUpiPay }) => {
  const { user } = useAuth();
  const { formatCurrency, formatDigits } = useLanguage();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioData, setPortfolioData] = useState<any | null>(null);
  const [pocketMoney, setPocketMoney] = useState<PocketMoneyState | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingMarket, setSyncingMarket] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Category View: 'ALL' | 'STOCKS' | 'MUTUAL_FUNDS' | 'FIXED_DEPOSITS'
  const [activeTab, setActiveTab] = useState<'ALL' | 'STOCKS' | 'MUTUAL_FUNDS' | 'FIXED_DEPOSITS'>('ALL');

  // Modals
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);
  const [isFdModalOpen, setIsFdModalOpen] = useState<boolean>(false);
  const [isPocketMoneyModalOpen, setIsPocketMoneyModalOpen] = useState<boolean>(false);

  // Trade Form
  const [tradeForm, setTradeForm] = useState({
    brokerApp: 'Zerodha Kite',
    name: 'Reliance Industries (RELIANCE)',
    stockSymbol: 'RELIANCE',
    quantity: '10',
    buyPrice: '2750.00',
    annualRatePercent: '14.5',
  });

  // FD Form
  const [fdForm, setFdForm] = useState({
    bankName: 'State Bank of India',
    name: 'SBI Green Fixed Deposit (1 Year)',
    investedAmount: '50000.00',
    annualRatePercent: '7.25',
    fdTenureMonths: '12',
  });

  // PocketMoney Limit Config
  const [pocketLimitInput, setPocketLimitInput] = useState<string>('500.00');
  const [pocketSourceAccountId, setPocketSourceAccountId] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [portRes, pmRes, accsRes] = await Promise.all([
        api.getTradingPortfolio(),
        api.getPocketMoney(),
        api.getAccounts(),
      ]);
      setPortfolioData(portRes.data);
      setInvestments(portRes.data?.investments || []);
      setPocketMoney(pmRes.data);
      setPocketLimitInput(pmRes.data?.dailyLimit || '500.00');
      setAccounts(accsRes);
      if (accsRes.length > 0 && !pocketSourceAccountId) {
        setPocketSourceAccountId(pmRes.data?.sourceAccountId || accsRes[0].id);
      }
    } catch (err: any) {
      console.error('Failed loading investment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync Live Market Price Fluctuations & FD Compounding
  const handleSyncMarket = async () => {
    setSyncingMarket(true);
    setErrorMessage(null);
    try {
      const res = await api.syncMarket();
      setStatusMessage(res.message);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed syncing market ticks');
    } finally {
      setSyncingMarket(false);
    }
  };

  // Connect Broker App
  const handleConnectBroker = async (brokerName: string) => {
    setErrorMessage(null);
    try {
      const res = await api.connectBroker(brokerName);
      setStatusMessage(res.message);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed connecting broker');
    }
  };

  // Record Stock Trade
  const handleRecordTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const res = await api.addTrade({
        investmentType: 'STOCK',
        brokerApp: tradeForm.brokerApp,
        name: tradeForm.name,
        stockSymbol: tradeForm.stockSymbol,
        quantity: tradeForm.quantity,
        buyPrice: tradeForm.buyPrice,
        annualRatePercent: tradeForm.annualRatePercent,
      });
      setStatusMessage(res.message);
      setIsTradeModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed recording trade');
    }
  };

  // Open / Record FD
  const handleRecordFd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const now = new Date();
      const maturity = new Date(now.setMonth(now.getMonth() + parseInt(fdForm.fdTenureMonths || '12')));
      const res = await api.addTrade({
        investmentType: 'FIXED_DEPOSIT',
        brokerApp: fdForm.bankName,
        name: fdForm.name,
        investedAmount: fdForm.investedAmount,
        annualRatePercent: fdForm.annualRatePercent,
        fdTenureMonths: fdForm.fdTenureMonths,
        maturityDate: maturity.toISOString().split('T')[0],
      });
      setStatusMessage(res.message);
      setIsFdModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed opening fixed deposit');
    }
  };

  // 1-Tap PocketMoney Quick Spend
  const handlePocketMoneyQuickSpend = async (amt: string, title: string, category: string) => {
    setErrorMessage(null);
    try {
      const res = await api.spendPocketMoney({
        amount: amt,
        title,
        category,
        classification: 'WANT',
      });
      setStatusMessage(res.message);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed spending pocket money');
    }
  };

  // Update PocketMoney Config
  const handleSavePocketMoneyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const res = await api.updatePocketMoneyConfig({
        dailyLimit: pocketLimitInput,
        sourceAccountId: pocketSourceAccountId,
      });
      setStatusMessage(res.message);
      setIsPocketMoneyModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed updating pocket money settings');
    }
  };

  const cur = user?.currency || 'INR';

  // Filtered investments list
  const filteredInvestments = investments.filter(inv => {
    if (activeTab === 'STOCKS') return inv.investment_type === 'STOCK';
    if (activeTab === 'MUTUAL_FUNDS') return inv.investment_type === 'MUTUAL_FUND_SIP';
    if (activeTab === 'FIXED_DEPOSITS') return inv.investment_type === 'FIXED_DEPOSIT';
    return true;
  });

  const totalInvestedNum = parseFloat(portfolioData?.totalInvested || '0');
  const totalCurrentNum = parseFloat(portfolioData?.totalCurrent || '0');
  const totalPnlNum = totalCurrentNum - totalInvestedNum;

  // Pocket money progress calculation
  const pDailyLimit = parseFloat(pocketMoney?.dailyLimit || '500');
  const pTodaySpent = parseFloat(pocketMoney?.todaySpent || '0');
  const pSpentPercent = Math.min(100, Math.round((pTodaySpent / (pDailyLimit || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Cross-Page Quick Navigation Bar */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 shadow-2xs cursor-pointer"
          >
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            Trading &amp; FDs
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

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Trading Apps, Funds &amp; FDs
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-3 w-3" />
              Live Market Tracking
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track stock trades across Zerodha, Groww &amp; Upstox, mutual fund SIPs, fixed deposits &amp; daily pocket money.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenUpiPay && (
            <button
              onClick={onOpenUpiPay}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              <span>UPI Pay SIP / Funds</span>
            </button>
          )}

          <button
            onClick={handleSyncMarket}
            disabled={syncingMarket}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-800 dark:text-slate-200 font-semibold text-xs shadow-xs cursor-pointer transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-500 ${syncingMarket ? 'animate-spin' : ''}`} />
            <span>{syncingMarket ? 'Syncing Ticks...' : 'Sync Live Market Ticks'}</span>
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

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* FEATURE 1: POCKETMONEY DAILY ALLOWANCE CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-slate-900/5 dark:bg-slate-900 border border-amber-500/25 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-2xs">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-black text-slate-900 dark:text-white">PocketMoney Daily Allowance</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  Daily Auto-Reset
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Small daily expenses (Chai, Snacks, Auto, Coffee) auto-tracked and deducted from {pocketMoney?.sourceAccountName || 'Bank'}.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPocketMoneyModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500 cursor-pointer shadow-2xs"
          >
            <Settings className="h-3.5 w-3.5 text-amber-500" />
            <span>Set Daily Limit</span>
          </button>
        </div>

        {/* PocketMoney Stats Bar & 1-Tap Quick Spends */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Daily Meter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Today's Allowance</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                ₹{pocketMoney?.todaySpent || '0.00'} / ₹{pocketMoney?.dailyLimit || '500.00'}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  pSpentPercent > 80 ? 'bg-rose-500' : pSpentPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${pSpentPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] pt-0.5">
              <span className="text-slate-400">Remaining Today:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                ₹{pocketMoney?.remainingToday || '500.00'}
              </span>
            </div>
          </div>

          {/* 1-Tap Quick Pay Buttons */}
          <div className="md:col-span-2 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              ⚡ 1-Tap Instant Micro-Spend (Auto-Updates Budget)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handlePocketMoneyQuickSpend('20.00', 'Chai & Tea', 'Tea / Beverage')}
                className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-all cursor-pointer"
              >
                <div className="text-base">☕</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">₹20 Chai / Tea</div>
                <div className="text-[10px] text-slate-400">1-Tap Debit</div>
              </button>

              <button
                onClick={() => handlePocketMoneyQuickSpend('50.00', 'Coffee / Cold Brew', 'Snacks & Drinks')}
                className="p-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-left transition-all cursor-pointer"
              >
                <div className="text-base">🧋</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">₹50 Coffee</div>
                <div className="text-[10px] text-slate-400">1-Tap Debit</div>
              </button>

              <button
                onClick={() => handlePocketMoneyQuickSpend('120.00', 'Evening Snacks', 'Food & Snacks')}
                className="p-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-left transition-all cursor-pointer"
              >
                <div className="text-base">🥪</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">₹120 Snacks</div>
                <div className="text-[10px] text-slate-400">1-Tap Debit</div>
              </button>

              <button
                onClick={() => handlePocketMoneyQuickSpend('40.00', 'Auto / Metro Fare', 'Local Travel')}
                className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all cursor-pointer"
              >
                <div className="text-base">🛺</div>
                <div className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">₹40 Auto / Metro</div>
                <div className="text-[10px] text-slate-400">1-Tap Debit</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PORTFOLIO METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Invested Capital</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalInvestedNum, cur)}
          </div>
          <span className="text-[11px] text-slate-500">Across Stocks, Funds &amp; FDs</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Market Valuation</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatCurrency(totalCurrentNum, cur)}
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">Live Market Value</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Profit &amp; Loss</span>
          <div className={`text-2xl font-black font-mono flex items-center gap-1 ${
            totalPnlNum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {totalPnlNum >= 0 ? <ArrowUpRight className="h-6 w-6 shrink-0" /> : <ArrowDownRight className="h-6 w-6 shrink-0" />}
            <span>{portfolioData?.totalPnl || '₹0.00'}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Return: {portfolioData?.overallReturnPercent || '0.00'}%</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Trading Apps</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatDigits(portfolioData?.connectedBrokers?.length || 2)} / {formatDigits(SUPPORTED_BROKERS.length)}
          </div>
          <span className="text-[11px] text-sky-500 font-semibold">Zerodha, Groww, SBI Sync</span>
        </div>
      </div>

      {/* BROKER CONNECTIVITY HUB */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-sky-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Connected Trading Apps &amp; Depository Platforms
            </h2>
          </div>
          <span className="text-[10px] text-slate-400">Instant API / Demat Synchronization</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {SUPPORTED_BROKERS.map(broker => {
            const isConnected = portfolioData?.connectedBrokers?.some(
              (b: string) => b.toLowerCase().includes(broker.name.toLowerCase().split(' ')[0])
            );
            return (
              <div
                key={broker.name}
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                  isConnected
                    ? 'border-emerald-500/40 bg-emerald-500/5 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{broker.logo}</span>
                    {isConnected ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Synced
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnectBroker(broker.name)}
                        className="text-[9px] font-bold text-sky-600 hover:underline cursor-pointer"
                      >
                        + Connect
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5">{broker.name}</h3>
                  <p className="text-[9px] text-slate-400 line-clamp-1">{broker.tag}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HOLDINGS TABLE & CATEGORY TABS */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              All Assets ({investments.length})
            </button>
            <button
              onClick={() => setActiveTab('STOCKS')}
              className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors ${
                activeTab === 'STOCKS'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Equities &amp; Stocks ({investments.filter(i => i.investment_type === 'STOCK').length})
            </button>
            <button
              onClick={() => setActiveTab('MUTUAL_FUNDS')}
              className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors ${
                activeTab === 'MUTUAL_FUNDS'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Mutual Funds &amp; SIPs ({investments.filter(i => i.investment_type === 'MUTUAL_FUND_SIP').length})
            </button>
            <button
              onClick={() => setActiveTab('FIXED_DEPOSITS')}
              className={`px-3 py-1.5 rounded-xl font-semibold cursor-pointer transition-colors ${
                activeTab === 'FIXED_DEPOSITS'
                  ? 'bg-sky-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Fixed Deposits (FDs) ({investments.filter(i => i.investment_type === 'FIXED_DEPOSIT').length})
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTradeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>+ Record Stock Trade</span>
            </button>
            <button
              onClick={() => setIsFdModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>+ Open FD</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredInvestments.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <TrendingUp className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No holdings found in this category.</p>
            <p className="text-xs text-slate-400">Click "+ Record Stock Trade" or "+ Open FD" to begin tracking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-950/50">
                  <th className="py-3 px-4">Instrument / Holding</th>
                  <th className="py-3 px-4">Platform / Broker</th>
                  <th className="py-3 px-4 text-right">Invested Value</th>
                  <th className="py-3 px-4 text-right">Current Value</th>
                  <th className="py-3 px-4 text-right">P&amp;L / Yield</th>
                  <th className="py-3 px-4 text-right">Tenure / Maturity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredInvestments.map(inv => {
                  const isStock = inv.investment_type === 'STOCK';
                  const isFd = inv.investment_type === 'FIXED_DEPOSIT';
                  const isSip = inv.investment_type === 'MUTUAL_FUND_SIP';
                  const pnlNum = parseFloat(inv.current_value || '0') - parseFloat(inv.invested_amount || '0');

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {isStock ? '📈' : isFd ? '🏦' : '🌱'}
                          <span>{inv.name}</span>
                        </div>
                        {inv.stock_symbol && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-0.5 inline-block">
                            {inv.stock_symbol} {inv.quantity ? `• Qty: ${inv.quantity}` : ''}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          {inv.broker_app || inv.linked_provider || 'Direct Demat'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(inv.invested_amount || '0.00', cur)}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(inv.current_value || '0.00', cur)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className={`font-black flex items-center justify-end gap-0.5 ${
                          pnlNum >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {pnlNum >= 0 ? '+' : ''}{pnlNum.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {inv.annual_rate_percent}% p.a.
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-sans text-slate-500 text-[11px]">
                        {isFd ? (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {inv.fd_tenure_months ? `${inv.fd_tenure_months} Months` : '1 Year'}
                            </span>
                            <div className="text-[10px] text-emerald-500 font-mono">
                              Maturity: {inv.maturity_date || '2027-01-01'}
                            </div>
                          </div>
                        ) : isSip ? (
                          <div>
                            <span className="font-semibold text-indigo-500">Monthly SIP</span>
                            <div className="text-[10px] text-slate-400 font-mono">₹{inv.sip_monthly_amount || '5000'}/mo</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Equity Delivery</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: RECORD STOCK TRADE */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>📈</span> Record Stock Trade / Demat Buy
              </h3>
              <button onClick={() => setIsTradeModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTrade} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Trading App / Broker</label>
                <select
                  value={tradeForm.brokerApp}
                  onChange={e => setTradeForm({ ...tradeForm, brokerApp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {SUPPORTED_BROKERS.map(b => (
                    <option key={b.name} value={b.name}>{b.logo} {b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Stock / Asset Name</label>
                <input
                  type="text"
                  required
                  value={tradeForm.name}
                  onChange={e => setTradeForm({ ...tradeForm, name: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Stock Symbol</label>
                  <input
                    type="text"
                    required
                    value={tradeForm.stockSymbol}
                    onChange={e => setTradeForm({ ...tradeForm, stockSymbol: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFCBANK"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tradeForm.quantity}
                    onChange={e => setTradeForm({ ...tradeForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Buy Price (₹ / unit)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={tradeForm.buyPrice}
                    onChange={e => setTradeForm({ ...tradeForm, buyPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Expected Return %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tradeForm.annualRatePercent}
                    onChange={e => setTradeForm({ ...tradeForm, annualRatePercent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTradeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold cursor-pointer"
                >
                  Record Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: OPEN FIXED DEPOSIT (FD) */}
      {isFdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🏦</span> Open / Record Fixed Deposit (FD)
              </h3>
              <button onClick={() => setIsFdModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordFd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={fdForm.bankName}
                  onChange={e => setFdForm({ ...fdForm, bankName: e.target.value })}
                  placeholder="e.g. State Bank of India, HDFC Bank"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">FD Scheme Name</label>
                <input
                  type="text"
                  required
                  value={fdForm.name}
                  onChange={e => setFdForm({ ...fdForm, name: e.target.value })}
                  placeholder="e.g. SBI Green Fixed Deposit"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Principal Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={fdForm.investedAmount}
                    onChange={e => setFdForm({ ...fdForm, investedAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    required
                    value={fdForm.fdTenureMonths}
                    onChange={e => setFdForm({ ...fdForm, fdTenureMonths: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">Interest Rate % p.a.</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={fdForm.annualRatePercent}
                  onChange={e => setFdForm({ ...fdForm, annualRatePercent: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFdModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold cursor-pointer"
                >
                  Open Fixed Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POCKETMONEY CONFIG */}
      {isPocketMoneyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                Configure PocketMoney Allowance
              </h3>
              <button onClick={() => setIsPocketMoneyModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePocketMoneyConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">
                  Daily PocketMoney Limit (₹)
                </label>
                <input
                  type="number"
                  step="10"
                  required
                  value={pocketLimitInput}
                  onChange={e => setPocketLimitInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-base"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Allowance resets daily at midnight. Spends exceeding this will prompt a confirmation.
                </p>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">
                  Linked Funding Bank Account
                </label>
                <select
                  value={pocketSourceAccountId}
                  onChange={e => setPocketSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.institution || 'Bank'}) — Available: {acc.currency} {acc.current_balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPocketMoneyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
