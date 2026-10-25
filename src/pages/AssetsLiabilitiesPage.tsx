import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AssetLiability } from '../types';
import {
  Landmark,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Home,
  Car,
  Shield,
  CreditCard,
  Building,
  Scale
} from 'lucide-react';

export const AssetsLiabilitiesPage: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<AssetLiability[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recordType: 'ASSET',
    category: 'REAL_ESTATE',
    name: '',
    valuationAmount: '',
    interestRate: '',
    monthlyEmi: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAssetsLiabilities();
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.valuationAmount) return;
    try {
      await api.createAssetLiability({
        recordType: formData.recordType,
        category: formData.category,
        name: formData.name,
        valuationAmount: formData.valuationAmount,
        interestRate: formData.interestRate || null,
        monthlyEmi: formData.monthlyEmi || null,
        notes: formData.notes,
      });
      setMessage(`${formData.recordType === 'ASSET' ? 'Asset' : 'Liability'} recorded successfully`);
      setIsModalOpen(false);
      setFormData({
        recordType: 'ASSET',
        category: 'REAL_ESTATE',
        name: '',
        valuationAmount: '',
        interestRate: '',
        monthlyEmi: '',
        notes: '',
      });
      setMessage('Record saved successfully!');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed saving asset/liability'}`);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Remove this record?')) return;
    try {
      await api.deleteAssetLiability(id);
      setMessage('Record removed successfully!');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed deleting record'}`);
    }
  };

  const cur = user?.currency || 'USD';

  const assets = records.filter(r => r.record_type === 'ASSET');
  const liabilities = records.filter(r => r.record_type === 'LIABILITY');

  const totalAssets = assets.reduce((acc, curr) => acc + parseFloat(curr.valuation_amount || '0'), 0);
  const totalLiabilities = liabilities.reduce((acc, curr) => acc + parseFloat(curr.valuation_amount || '0'), 0);
  const totalMonthlyEmi = liabilities.reduce((acc, curr) => acc + parseFloat(curr.monthly_emi || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Assets, Liabilities &amp; Loans
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track fixed physical assets alongside mortgages, vehicle loans, and personal debts.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Add Asset or Loan
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Physical Assets Value</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            +{cur} {totalAssets.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">{assets.length} items logged</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold uppercase">Outstanding Loans &amp; Debts</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
            -{cur} {totalLiabilities.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">{liabilities.length} liabilities logged</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase">Monthly EMI Obligation</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {cur} {totalMonthlyEmi.toFixed(2)}/mo
          </div>
          <span className="text-[11px] text-slate-400">Total monthly debt service</span>
        </div>
      </div>

      {/* Two columns: Assets & Liabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-500" />
              Tangible Assets ({assets.length})
            </h2>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {cur} {totalAssets.toFixed(2)}
            </span>
          </div>

          {assets.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No physical assets logged yet.</p>
          ) : (
            <div className="space-y-3">
              {assets.map(a => (
                <div key={a.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {a.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{a.name}</h3>
                    {a.notes && <p className="text-xs text-slate-400">{a.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      +{cur} {a.valuation_amount}
                    </div>
                    <button onClick={() => handleDeleteRecord(a.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Liabilities Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-rose-500" />
              Liabilities &amp; Loans ({liabilities.length})
            </h2>
            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
              -{cur} {totalLiabilities.toFixed(2)}
            </span>
          </div>

          {liabilities.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No liabilities or loans recorded.</p>
          ) : (
            <div className="space-y-3">
              {liabilities.map(l => (
                <div key={l.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      {l.category.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1">{l.name}</h3>
                    <div className="text-[11px] text-slate-400">
                      {l.monthly_emi && <span>EMI: {cur} {l.monthly_emi}/mo</span>}
                      {l.interest_rate && <span className="ml-2">Rate: {l.interest_rate}%</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                      -{cur} {l.valuation_amount}
                    </div>
                    <button onClick={() => handleDeleteRecord(l.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Asset or Loan</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRecord} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Type</label>
                  <select
                    value={formData.recordType}
                    onChange={e => setFormData({ ...formData, recordType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="ASSET">Asset (+)</option>
                    <option value="LIABILITY">Liability / Loan (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    {formData.recordType === 'ASSET' ? (
                      <>
                        <option value="REAL_ESTATE">Real Estate / House</option>
                        <option value="VEHICLE">Automobile</option>
                        <option value="GOLD">Gold &amp; Precious Metals</option>
                        <option value="OTHER">Electronics / Other</option>
                      </>
                    ) : (
                      <>
                        <option value="HOME_LOAN">Home Mortgage</option>
                        <option value="CAR_LOAN">Auto Loan</option>
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="STUDENT_LOAN">Education Loan</option>
                        <option value="OTHER">Other Debt</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Residence, Tesla Model 3 Loan"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Valuation / Principal Outstanding ({cur})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="250000.00"
                  value={formData.valuationAmount}
                  onChange={e => setFormData({ ...formData, valuationAmount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm"
                />
              </div>

              {formData.recordType === 'LIABILITY' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="6.5"
                      value={formData.interestRate}
                      onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Monthly EMI ({cur})</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1200.00"
                      value={formData.monthlyEmi}
                      onChange={e => setFormData({ ...formData, monthlyEmi: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional details"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
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
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
