import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Investment } from '../types';
import {
  TrendingUp,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Calendar,
  Landmark
} from 'lucide-react';

export const InvestmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    investmentType: 'MUTUAL_FUND_SIP',
    name: '',
    investedAmount: '',
    currentValue: '',
    annualRatePercent: '12.0',
    startDate: new Date().toISOString().split('T')[0],
    maturityDate: '',
    sipMonthlyAmount: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getInvestments();
      setInvestments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.investedAmount) return;
    try {
      await api.createInvestment({
        investmentType: formData.investmentType,
        name: formData.name,
        investedAmount: formData.investedAmount,
        currentValue: formData.currentValue || formData.investedAmount,
        annualRatePercent: formData.annualRatePercent,
        startDate: formData.startDate,
        maturityDate: formData.maturityDate || null,
        sipMonthlyAmount: formData.sipMonthlyAmount || null,
        notes: formData.notes,
      });
      setMessage('Investment tracked successfully');
      setIsModalOpen(false);
      setFormData({
        investmentType: 'MUTUAL_FUND_SIP',
        name: '',
        investedAmount: '',
        currentValue: '',
        annualRatePercent: '12.0',
        startDate: new Date().toISOString().split('T')[0],
        maturityDate: '',
        sipMonthlyAmount: '',
        notes: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!confirm('Remove this investment record?')) return;
    try {
      await api.deleteInvestment(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const cur = user?.currency || 'USD';

  let totalInvested = 0;
  let totalCurrent = 0;
  investments.forEach(i => {
    totalInvested += parseFloat(i.invested_amount || '0');
    totalCurrent += parseFloat(i.current_value || '0');
  });

  const totalGainLoss = totalCurrent - totalInvested;
  const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Investments, SIPs &amp; Fixed Deposits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track mutual funds, recurring SIPs, and fixed deposits with transparent interest calculations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Add Investment
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Disclaimers & Free-First Transparency Banner */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
        <Info className="h-4 w-4 text-sky-500 shrink-0" />
        <span>
          <strong>Transparent Financial Tracking:</strong> PocketPilot uses user-specified valuations and transparent math formulas. No third-party paid broker API dependencies.
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Current Portfolio</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {cur} {totalCurrent.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Current valuation</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Invested (Principal)</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            {cur} {totalInvested.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Net capital deployed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Estimated Returns</span>
          <div className={`text-2xl font-bold font-mono mt-1 ${totalGainLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {totalGainLoss >= 0 ? '+' : ''}{cur} {totalGainLoss.toFixed(2)}
          </div>
          <span className="text-[11px] font-semibold text-emerald-500">
            {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}% all-time
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading investments...</div>
      ) : investments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No investment records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Track your Mutual Fund SIPs, Fixed Deposits, Index funds or government bonds.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow cursor-pointer"
          >
            Add First Investment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {investments.map(inv => {
            const p = parseFloat(inv.invested_amount || '0');
            const v = parseFloat(inv.current_value || '0');
            const diff = v - p;
            const diffPct = p > 0 ? (diff / p) * 100 : 0;

            return (
              <div
                key={inv.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        {inv.investment_type.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                        {inv.name}
                      </h3>
                      {inv.notes && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{inv.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteInvestment(inv.id)}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-1.5 font-mono">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-400">Current Value:</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {cur} {inv.current_value}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Invested:</span>
                      <span>{cur} {inv.invested_amount}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400">Gain / Return:</span>
                      <span className={`font-semibold ${diff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {diff >= 0 ? '+' : ''}{cur} {diff.toFixed(2)} ({diffPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
                  <span>Start: {inv.start_date}</span>
                  {inv.annual_rate_percent && (
                    <span className="font-semibold text-sky-500">
                      ~{inv.annual_rate_percent}% p.a.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Investment</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvestment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Investment Type</label>
                <select
                  value={formData.investmentType}
                  onChange={e => setFormData({ ...formData, investmentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="MUTUAL_FUND_SIP">Mutual Fund / SIP</option>
                  <option value="FIXED_DEPOSIT">Fixed Deposit (FD)</option>
                  <option value="STOCK">Stock / Index ETF</option>
                  <option value="OTHER">Government Bond / Gold / Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Asset / Fund Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. S&P 500 Index Fund, 3-Yr Bank Fixed Deposit"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Invested Amount ({cur})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1000.00"
                    value={formData.investedAmount}
                    onChange={e => setFormData({ ...formData, investedAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Current Valuation ({cur})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Same as invested"
                    value={formData.currentValue}
                    onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Expected Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="12.0"
                    value={formData.annualRatePercent}
                    onChange={e => setFormData({ ...formData, annualRatePercent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly SIP on 5th of each month"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

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
                  Save Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
