import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { SavingsGoal, Account } from '../types';
import {
  Target,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Coins,
  X,
  Sparkles
} from 'lucide-react';

export const SavingsGoalsPage: React.FC = () => {
  const { user } = useAuth();
  const { t, formatCurrency, formatDate, formatDigits } = useLanguage();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Create Goal Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0.00',
    targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'GENERAL',
    notes: '',
  });

  // Contribute Modal
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [contribForm, setContribForm] = useState({
    amount: '',
    accountId: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [gList, accs] = await Promise.all([
        api.getGoals(),
        api.getAccounts(),
      ]);
      setGoals(gList);
      setAccounts(accs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createGoal(goalForm);
      setIsCreateModalOpen(false);
      setGoalForm({
        name: '',
        targetAmount: '',
        currentAmount: '0.00',
        targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'GENERAL',
        notes: '',
      });
      setMessage(t('save') + '!');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Operation failed'}`);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    try {
      await api.contributeToGoal(activeGoal.id, contribForm);
      setIsContributeModalOpen(false);
      setActiveGoal(null);
      setContribForm({ amount: '', accountId: '', notes: '' });
      setMessage(t('confirm') + '!');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Contribution failed'}`);
    }
  };

  const cur = user?.currency || 'INR';

  const getRequiredMonthly = (goal: SavingsGoal) => {
    const target = parseFloat(goal.target_amount || '0');
    const current = parseFloat(goal.current_amount || '0');
    const remaining = Math.max(0, target - current);
    if (remaining === 0) return '0.00';

    const now = new Date();
    const targetDate = new Date(goal.target_date);
    const diffMonths = Math.max(1, (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()));
    return (remaining / diffMonths).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('goalsTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('goalsSubtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          {t('addGoalBtn')}
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">{t('loading')}</div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('goalsTitle')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('goalsSubtitle')}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow cursor-pointer"
          >
            {t('addGoalBtn')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map(goal => {
            const target = parseFloat(goal.target_amount || '0');
            const current = parseFloat(goal.current_amount || '0');
            const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const requiredPerMonth = getRequiredMonthly(goal);
            const isFinished = current >= target;

            return (
              <div
                key={goal.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        {goal.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {goal.name}
                      </h3>
                      {goal.notes && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{goal.notes}</p>
                      )}
                    </div>
                    {isFinished && (
                      <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-500" title="Goal Completed!">
                        <Sparkles className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-base">
                        {formatCurrency(goal.current_amount, cur)}
                      </span>
                      <span className="text-slate-400 font-mono">
                        {t('targetAmount')}: {formatCurrency(goal.target_amount, cur)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFinished ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>{t('progress')}: {formatDigits(percent)}%</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(goal.target_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    <div>Needed / month</div>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                      {formatCurrency(requiredPerMonth, cur)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveGoal(goal);
                      setContribForm({
                        amount: '',
                        accountId: accounts[0]?.id || '',
                        notes: `Contribution to ${goal.name}`,
                      });
                      setIsContributeModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 hover:text-sky-500 text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Coins className="h-3.5 w-3.5 text-sky-500" />
                    <span>Contribute</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('addGoalBtn')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('goalName')}</label>
                <input
                  type="text"
                  required
                  value={goalForm.name}
                  onChange={e => setGoalForm({ ...goalForm, name: e.target.value })}
                  placeholder="e.g. 6-Month Emergency Fund, Down Payment"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">{t('targetAmount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={goalForm.targetAmount}
                    onChange={e => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                    placeholder="10000.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-slate-500 mb-1">{t('currentSavings')}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.currentAmount}
                    onChange={e => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('targetDate')}</label>
                <input
                  type="date"
                  required
                  value={goalForm.targetDate}
                  onChange={e => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('notes')}</label>
                <input
                  type="text"
                  value={goalForm.notes}
                  onChange={e => setGoalForm({ ...goalForm, notes: e.target.value })}
                  placeholder="Rationale or notes..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {isContributeModalOpen && activeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Contribute to: {activeGoal.name}
              </h3>
              <button onClick={() => setIsContributeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleContribute} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('amount')}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={contribForm.amount}
                  onChange={e => setContribForm({ ...contribForm, amount: e.target.value })}
                  placeholder="500.00"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-slate-500 mb-1">{t('account')}</label>
                <select
                  value={contribForm.accountId}
                  onChange={e => setContribForm({ ...contribForm, accountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">None (External / Offline Deposit)</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.currency} {formatCurrency(a.current_balance, a.currency)})</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Optional: Deducting from an account records a transfer or savings allocation.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContributeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow"
                >
                  {t('confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
