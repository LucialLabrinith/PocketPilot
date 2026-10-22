import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FinancialSummary, Transaction, Category } from '../types';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sum, txs, cats] = await Promise.all([
          api.getSummary(),
          api.getTransactions(),
          api.getCategories(),
        ]);
        setSummary(sum);
        setTransactions(txs);
        setCategories(cats);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cur = summary?.currency || user?.currency || 'USD';
  const monthlyExpense = parseFloat(summary?.monthlyExpense || '0');
  const cashBank = parseFloat(summary?.cashAndBank || '0');

  // Emergency runway calculation: Cash & Bank divided by average monthly expense
  const emergencyRunwayMonths = monthlyExpense > 0 ? (cashBank / monthlyExpense).toFixed(1) : '∞';

  // Category distribution
  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
  const catTotals = new Map<string, number>();

  expenseTransactions.forEach(t => {
    const catId = t.category_id || 'uncategorized';
    const amt = parseFloat(t.amount || '0');
    catTotals.set(catId, (catTotals.get(catId) || 0) + amt);
  });

  const sortedCats = Array.from(catTotals.entries())
    .map(([catId, amount]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        name: cat?.name || 'Uncategorized',
        color: cat?.color || '#94a3b8',
        classification: cat?.classification || 'NONE',
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const totalExpense = sortedCats.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Reports, Analytics &amp; Financial Insights
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Objective breakdown of your cashflow distribution, emergency runway, and financial health indicators.
        </p>
      </div>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Savings Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Savings Rate Indicator</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
            {summary?.savingsRate || 0}%
          </div>
          <p className="text-[11px] text-slate-400">
            {Number(summary?.savingsRate || 0) >= 20 ? (
              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Healthy (exceeds recommended 20%)
              </span>
            ) : (
              <span className="text-amber-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Target at least 20% for long-term independence
              </span>
            )}
          </p>
        </div>

        {/* Emergency Runway */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Liquid Emergency Runway</span>
            <ShieldCheck className="h-4 w-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
            {emergencyRunwayMonths} <span className="text-base font-normal text-slate-400">Months</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Based on current liquid cash ({cur} {cashBank.toFixed(2)}) vs monthly burn
          </p>
        </div>

        {/* Debt-to-Asset Ratio */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Debt-to-Asset Ratio</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white">
            {parseFloat(summary?.totalAssets || '0') > 0
              ? `${Math.round((parseFloat(summary?.totalLiabilities || '0') / parseFloat(summary?.totalAssets || '1')) * 100)}%`
              : '0%'}
          </div>
          <p className="text-[11px] text-slate-400">
            Lower ratios indicate lower financial fragility and risk
          </p>
        </div>
      </div>

      {/* Category Spending Distribution */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Spending Breakdown by Category
        </h2>

        {sortedCats.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            No expense records logged to generate category analytics.
          </p>
        ) : (
          <div className="space-y-3">
            {sortedCats.map(cat => {
              const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{cat.name}</span>
                      {cat.classification !== 'NONE' && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {cat.classification}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-slate-900 dark:text-white">
                      {cur} {cat.amount.toFixed(2)} ({pct}%)
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Insights Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/20 text-white space-y-3">
        <div className="flex items-center gap-2 text-sky-400">
          <Lightbulb className="h-5 w-5" />
          <h2 className="text-base font-bold">PocketPilot Financial Insights</h2>
        </div>
        <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Zero Forced Assumptions:</strong> PocketPilot does not make arbitrary market predictions or simulate fake bank connections. All insights are calculated directly from your real transactions.
          </li>
          <li>
            <strong>Transfer Exclusions:</strong> Transfers between your checking and savings accounts are accurately categorized as liquidity movements and never counted as income or expenses.
          </li>
          <li>
            <strong>Dual-Client Cohesion:</strong> Every record here is accessible via both this web portal and your native JavaFX desktop client with synchronized token authentication.
          </li>
        </ul>
      </div>
    </div>
  );
};
