import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Category, Transaction } from '../types';
import {
  Tags,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  DollarSign
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    classification: 'WANT',
    color: '#6366f1',
    monthlyLimit: '300.00',
  });
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, txs] = await Promise.all([
        api.getCategories(),
        api.getTransactions(),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    try {
      await api.createCategory({
        name: formData.name,
        type: formData.type,
        classification: formData.type === 'EXPENSE' ? formData.classification : 'NONE',
        color: formData.color,
        monthlyLimit: formData.monthlyLimit,
      });
      setMessage('Category created successfully');
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: 'EXPENSE',
        classification: 'WANT',
        color: '#6366f1',
        monthlyLimit: '300.00',
      });
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed creating category'}`);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      setMessage('Category deleted');
      loadData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed deleting category'}`);
    }
  };

  const cur = user?.currency || 'USD';

  const filtered = categories.filter(c => {
    if (filterType === 'ALL') return true;
    return c.type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Categories &amp; Spending Limits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Group transactions into Needs, Wants, and Savings with monthly budget thresholds.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Create Category
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(['ALL', 'EXPENSE', 'INCOME'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              filterType === tab
                ? 'bg-sky-600 text-white shadow'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab === 'ALL' ? 'All Categories' : tab === 'EXPENSE' ? 'Expense Categories' : 'Income Categories'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(cat => {
          // Calculate total spent in this category
          const spent = transactions
            .filter(t => t.category_id === cat.id)
            .reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
          const limit = parseFloat(cat.monthly_limit || '0');
          const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-slate-400 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {cat.type}
                      </span>
                      {cat.classification !== 'NONE' && (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          cat.classification === 'NEED' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          cat.classification === 'SAVINGS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                        }`}>
                          {cat.classification}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!cat.is_default && (
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                    title="Delete custom category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {cat.type === 'EXPENSE' && limit > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Spent: <strong className="text-slate-800 dark:text-slate-200 font-mono">{cur} {spent.toFixed(2)}</strong></span>
                    <span>Limit: <span className="font-mono">{cur} {limit.toFixed(2)}</span></span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Category</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pet Care, Online Courses, Gym"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Category Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>

                {formData.type === 'EXPENSE' && (
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Classification</label>
                    <select
                      value={formData.classification}
                      onChange={e => setFormData({ ...formData, classification: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="NEED">Need (Essential)</option>
                      <option value="WANT">Want (Discretionary)</option>
                      <option value="SAVINGS">Savings &amp; Debt</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Monthly Spending Limit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyLimit}
                    onChange={e => setFormData({ ...formData, monthlyLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">Color Tag</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-9 rounded-xl bg-transparent border border-slate-300 dark:border-slate-700 cursor-pointer"
                  />
                </div>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
