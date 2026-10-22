import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { MonthlyBudget, Transaction, Category } from '../types';
import {
  PieChart,
  Save,
  CheckCircle2,
  Home,
  ShoppingBag,
  Shield,
  Info
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDigits } = useLanguage();
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [incomeTarget, setIncomeTarget] = useState('3000.00');
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const [bud, txs, cats] = await Promise.all([
        api.getCurrentBudget(),
        api.getTransactions({ startDate: `${currentMonth}-01` }),
        api.getCategories(),
      ]);
      setBudget(bud);
      setTransactions(txs);
      setCategories(cats);
      setIncomeTarget(bud.monthly_income_target);
      setNeedsPct(bud.needs_percentage);
      setWantsPct(bud.wants_percentage);
      setSavingsPct(bud.savings_percentage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api.saveBudget({
        monthlyIncomeTarget: incomeTarget,
        needsPercentage: needsPct,
        wantsPercentage: wantsPct,
        savingsPercentage: savingsPct,
      });
      setBudget(updated.data);
      setMessage(t('save') + '!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const cur = user?.currency || 'INR';
  const totalTarget = parseFloat(incomeTarget || '0');

  // Compute allocated amounts
  const needsBudgetAmount = (totalTarget * needsPct) / 100;
  const wantsBudgetAmount = (totalTarget * wantsPct) / 100;
  const savingsBudgetAmount = (totalTarget * savingsPct) / 100;

  // Compute actual expenditures this month by category classification
  let actualNeeds = 0;
  let actualWants = 0;
  let actualSavings = 0;

  transactions.forEach(tx => {
    const amt = parseFloat(tx.amount || '0');
    if (tx.type === 'EXPENSE') {
      const cat = categories.find(c => c.id === tx.category_id);
      if (cat?.classification === 'NEED') actualNeeds += amt;
      else if (cat?.classification === 'WANT') actualWants += amt;
      else if (cat?.classification === 'SAVINGS') actualSavings += amt;
      else actualWants += amt;
    }
  });

  const totalPct = Number(needsPct) + Number(wantsPct) + Number(savingsPct);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('budgetTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('budgetSubtitle')}
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Target Setup Card */}
      <form onSubmit={handleSaveBudget} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('budgetSnapshot')}</h2>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? t('loading') : t('save')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {t('incomeTarget')}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={incomeTarget}
              onChange={e => setIncomeTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
              {t('classificationNeed')} ({formatDigits(needsPct)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={needsPct}
              onChange={e => setNeedsPct(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-mono">
              {t('needsTarget')}: {formatCurrency(needsBudgetAmount, cur)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-purple-500 mb-1">
              {t('classificationWant')} ({formatDigits(wantsPct)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={wantsPct}
              onChange={e => setWantsPct(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-mono">
              {t('wantsTarget')}: {formatCurrency(wantsBudgetAmount, cur)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-500 mb-1">
              {t('classificationSavings')} ({formatDigits(savingsPct)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={savingsPct}
              onChange={e => setSavingsPct(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-mono">
              {t('savingsTarget')}: {formatCurrency(savingsBudgetAmount, cur)}
            </span>
          </div>
        </div>

        {totalPct !== 100 && (
          <div className="text-xs text-amber-500 flex items-center gap-1.5 font-medium">
            <Info className="h-4 w-4" />
            Total: {formatDigits(totalPct)}% (100% recommended)
          </div>
        )}
      </form>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Needs Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('classificationNeed')}</h3>
                <span className="text-[10px] text-slate-400">{formatDigits(needsPct)}%</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">{t('needsTarget')}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(needsBudgetAmount, cur)}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{t('typeExpense')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(actualNeeds, cur)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  actualNeeds > needsBudgetAmount ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${needsBudgetAmount > 0 ? Math.min(100, (actualNeeds / needsBudgetAmount) * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>{t('remainingUnallocated')}:</span>
              <span className={`font-mono font-semibold ${needsBudgetAmount - actualNeeds >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(needsBudgetAmount - actualNeeds, cur)}
              </span>
            </div>
          </div>
        </div>

        {/* Wants Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('classificationWant')}</h3>
                <span className="text-[10px] text-slate-400">{formatDigits(wantsPct)}%</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">{t('wantsTarget')}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(wantsBudgetAmount, cur)}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{t('typeExpense')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(actualWants, cur)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  actualWants > wantsBudgetAmount ? 'bg-red-500' : 'bg-purple-500'
                }`}
                style={{ width: `${wantsBudgetAmount > 0 ? Math.min(100, (actualWants / wantsBudgetAmount) * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>{t('remainingUnallocated')}:</span>
              <span className={`font-mono font-semibold ${wantsBudgetAmount - actualWants >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(wantsBudgetAmount - actualWants, cur)}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('classificationSavings')}</h3>
                <span className="text-[10px] text-slate-400">{formatDigits(savingsPct)}%</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-slate-400">{t('savingsTarget')}</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(savingsBudgetAmount, cur)}</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{t('classificationSavings')}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(actualSavings, cur)}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${savingsBudgetAmount > 0 ? Math.min(100, (actualSavings / savingsBudgetAmount) * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>{t('remainingUnallocated')}:</span>
              <span className="font-mono font-semibold text-sky-500">
                {formatCurrency(Math.max(0, savingsBudgetAmount - actualSavings), cur)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
