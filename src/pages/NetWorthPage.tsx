import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FinancialSummary } from '../types';
import {
  Scale,
  TrendingUp,
  ShieldAlert,
  Wallet,
  Home,
  CreditCard,
  Building,
  Info,
  CheckCircle2
} from 'lucide-react';

export const NetWorthPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getSummary();
        setSummary(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cur = summary?.currency || user?.currency || 'USD';
  const netWorth = parseFloat(summary?.netWorth || '0');
  const totalAssets = parseFloat(summary?.totalAssets || '0');
  const totalLiabilities = parseFloat(summary?.totalLiabilities || '0');

  const cashBank = parseFloat(summary?.cashAndBank || '0');
  const investments = parseFloat(summary?.investmentsValue || '0');
  const physicalAssets = parseFloat(summary?.physicalAssets || '0');

  const creditCardDebt = parseFloat(summary?.creditCardDebt || '0');
  const loans = parseFloat(summary?.loansAndLiabilities || '0');

  const cashPct = totalAssets > 0 ? Math.round((cashBank / totalAssets) * 100) : 0;
  const investPct = totalAssets > 0 ? Math.round((investments / totalAssets) * 100) : 0;
  const physicalPct = totalAssets > 0 ? Math.round((physicalAssets / totalAssets) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Net Worth Tracker &amp; Balance Sheet
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Complete holistic view of your real financial equity with transparent double-entry aggregation.
        </p>
      </div>

      {/* Net Worth Hero Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 shadow-xl text-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 px-2.5 py-0.5 rounded bg-sky-500/20">
              Total Calculated Net Worth
            </span>
            <div className="mt-2 text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
              {cur} {summary?.netWorth || '0.00'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Reflects all accounts, investments, physical assets, and outstanding liabilities in real-time.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-400 block uppercase">Total Assets</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                +{cur} {summary?.totalAssets || '0.00'}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-xs font-semibold text-rose-400 block uppercase">Total Debts</span>
              <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
                -{cur} {summary?.totalLiabilities || '0.00'}
              </span>
            </div>
          </div>
        </div>

        {/* Formula Explanation */}
        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="h-4 w-4 text-sky-400 shrink-0" />
          <span>
            <strong>Calculation Formula:</strong> (Cash &amp; Bank + Investments + Tangible Assets) - (Credit Card Balances + Loans).
          </span>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Asset Portfolio Allocation
        </h2>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
          <div className="bg-sky-500 transition-all" style={{ width: `${cashPct}%` }} title={`Cash & Bank: ${cashPct}%`} />
          <div className="bg-indigo-500 transition-all" style={{ width: `${investPct}%` }} title={`Investments: ${investPct}%`} />
          <div className="bg-emerald-500 transition-all" style={{ width: `${physicalPct}%` }} title={`Physical Assets: ${physicalPct}%`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="w-3 h-3 rounded-full bg-sky-500 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">Liquid Cash &amp; Bank ({cashPct}%)</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {cur} {cashBank.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">Investments &amp; SIPs ({investPct}%)</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {cur} {investments.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <div className="text-xs text-slate-500">Tangible Real Estate &amp; Assets ({physicalPct}%)</div>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {cur} {physicalAssets.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liabilities Breakdown */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Liabilities &amp; Debt Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-500">Revolving Credit Card Balances</div>
              <div className="text-xs text-slate-400 mt-0.5">Short-term card liabilities</div>
            </div>
            <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
              {cur} {creditCardDebt.toFixed(2)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-500">Term Loans &amp; Mortgages</div>
              <div className="text-xs text-slate-400 mt-0.5">Fixed repayment obligations</div>
            </div>
            <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
              {cur} {loans.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
