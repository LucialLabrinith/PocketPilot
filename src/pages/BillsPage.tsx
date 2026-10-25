import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BillSubscription, Account } from '../types';
import {
  CalendarDays,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Zap,
  Clock
} from 'lucide-react';

export const BillsPage: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<BillSubscription[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    billingCycle: 'MONTHLY',
    dueDay: 1,
    isAutopay: false,
    accountId: '',
    nextDueDate: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bList, accs] = await Promise.all([api.getBills(), api.getAccounts()]);
      setBills(bList);
      setAccounts(accs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;
    try {
      await api.createBill({
        name: formData.name,
        amount: formData.amount,
        billingCycle: formData.billingCycle,
        dueDay: Number(formData.dueDay),
        accountId: formData.accountId || undefined,
        isAutopay: formData.isAutopay,
        nextDueDate: formData.nextDueDate,
      });
      setMessage('Bill / Subscription tracked');
      setIsModalOpen(false);
      setFormData({
        name: '',
        amount: '',
        billingCycle: 'MONTHLY',
        dueDay: 1,
        isAutopay: false,
        accountId: '',
        nextDueDate: new Date().toISOString().split('T')[0],
      });
      setMessage('Bill scheduled successfully!');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed saving bill'}`);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm('Remove this recurring bill?')) return;
    try {
      await api.deleteBill(id);
      setMessage('Bill removed successfully!');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed deleting bill'}`);
    }
  };

  const cur = user?.currency || 'USD';
  const totalMonthlyCommitment = bills.reduce((acc, curr) => {
    const amt = parseFloat(curr.amount || '0');
    if (curr.billing_cycle === 'ANNUAL') return acc + amt / 12;
    if (curr.billing_cycle === 'WEEKLY') return acc + amt * 4.33;
    return acc + amt;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Bills &amp; Subscriptions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Keep track of recurring software subscriptions, utilities, rent, and due dates.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Add Bill / Subscription
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Monthly Recurring Total</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {cur} {totalMonthlyCommitment.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Normalized to monthly equivalent</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Active Subscriptions</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {bills.length}
          </div>
          <span className="text-[11px] text-slate-400">{bills.filter(b => b.is_autopay).length} on autopay</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Upcoming Cycle</span>
          <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            Active
          </div>
          <span className="text-[11px] text-slate-400">Automatic payment tracking</span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading subscriptions...</div>
      ) : bills.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
            <CalendarDays className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No recurring bills recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add recurring subscriptions like Spotify, Netflix, cloud hosting, gym, or broadband internet.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow cursor-pointer"
          >
            Add Recurring Bill
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {b.billing_cycle}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                      {b.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDeleteBill(b.id)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-baseline justify-between font-mono">
                  <span className="text-xs text-slate-400">Amount:</span>
                  <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {cur} {b.amount}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Due day: {b.due_day}th
                </span>
                <span className={`px-2 py-0.5 rounded font-semibold ${
                  b.is_autopay ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {b.is_autopay ? 'Autopay ON' : 'Manual'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Recurring Bill</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBill} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix 4K, Electricity, Fiber Internet"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Amount ({cur})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="19.99"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Due Day of Month (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formData.dueDay}
                    onChange={e => setFormData({ ...formData, dueDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.nextDueDate}
                    onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={formData.isAutopay}
                  onChange={e => setFormData({ ...formData, isAutopay: e.target.checked })}
                  className="rounded text-sky-600"
                />
                <span>Automatically debited (Autopay enabled)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
