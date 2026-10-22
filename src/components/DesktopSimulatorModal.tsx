import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Account, Transaction, SyncAuditLog } from '../types';
import { Monitor, RefreshCw, CheckCircle2, Shield, ArrowRight, Laptop, KeyRound, Database, Activity } from 'lucide-react';

interface DesktopSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopSimulatorModal: React.FC<DesktopSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [desktopToken, setDesktopToken] = useState<string | null>(null);
  const [desktopEmail, setDesktopEmail] = useState(user?.email || '');
  const [desktopPassword, setDesktopPassword] = useState('');
  const [desktopAccounts, setDesktopAccounts] = useState<Account[]>([]);
  const [desktopTransactions, setDesktopTransactions] = useState<Transaction[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncAuditLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSyncLogs();
    }
  }, [isOpen]);

  const loadSyncLogs = async () => {
    try {
      const logs = await api.getSyncLogs();
      setSyncLogs(logs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDesktopLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Authenticating via Desktop JavaFX Client...');
    try {
      const res = await api.login({
        email: desktopEmail,
        password: desktopPassword,
        clientType: 'DESKTOP_JAVAFX'
      });
      if (res.data?.token) {
        setDesktopToken(res.data.token);
        setStatusMessage('JavaFX Desktop Client authenticated successfully!');
        // Load accounts and transactions using shared DB
        const accs = await api.getAccounts();
        const txs = await api.getTransactions();
        setDesktopAccounts(accs);
        setDesktopTransactions(txs);
        loadSyncLogs();
      } else {
        setStatusMessage(res.message || 'Login failed');
      }
    } catch (err: any) {
      setStatusMessage('Error: ' + err.message);
    }
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setStatusMessage('Synchronizing with shared backend database...');
    try {
      await api.triggerSync('DESKTOP_JAVAFX');
      const accs = await api.getAccounts();
      const txs = await api.getTransactions();
      setDesktopAccounts(accs);
      setDesktopTransactions(txs);
      await loadSyncLogs();
      setStatusMessage('Synchronization complete. All financial records in sync!');
    } catch (err: any) {
      setStatusMessage('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Desktop Window Titlebar (Classic JavaFX Styling) */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-300 select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2 ml-3 text-xs font-mono font-medium text-slate-400">
              <Laptop className="h-3.5 w-3.5 text-sky-400" />
              <span>PocketPilot Desktop Client [JavaFX 21 + OpenJDK Runtime]</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Backend: 0.0.0.0:3000
            </span>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Banner explaining Dual-Client Sync */}
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-4 text-xs text-sky-200 flex items-start gap-3">
            <Database className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-sky-300">Shared Backend & Relational Database Architecture</p>
              <p className="mt-1 leading-relaxed opacity-90">
                Both the Web application and the native JavaFX Desktop application consume the exact same Spring Boot REST API endpoints (<code className="bg-sky-900/60 px-1 py-0.5 rounded">/api/accounts</code>, <code className="bg-sky-900/60 px-1 py-0.5 rounded">/api/transactions</code>) and persist into the same shared database schema.
              </p>
            </div>
          </div>

          {!desktopToken ? (
            /* Desktop Client Sign In Form */
            <div className="max-w-md mx-auto rounded-xl bg-slate-950/60 border border-slate-800 p-6 space-y-4 shadow-lg">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-xl bg-sky-500/10 text-sky-400 mb-1">
                  <Monitor className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">JavaFX Desktop Sign In</h3>
                <p className="text-xs text-slate-400">Authenticating client type: <span className="font-mono text-sky-400 font-semibold">DESKTOP_JAVAFX</span></p>
              </div>

              <form onSubmit={handleDesktopLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={desktopEmail}
                    onChange={e => setDesktopEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                  <input
                    type="password"
                    value={desktopPassword}
                    onChange={e => setDesktopPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Enter password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-medium text-white text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="h-4 w-4" />
                  Sign In to Desktop Client
                </button>
              </form>

              {statusMessage && (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300">
                  {statusMessage}
                </div>
              )}
            </div>
          ) : (
            /* Active Desktop Client Session */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      Connected: {desktopEmail}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                        CLIENT: DESKTOP_JAVAFX
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Session Token: {desktopToken.substring(0, 16)}...
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing DB...' : 'Synchronize Now'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopToken(null);
                      setDesktopAccounts([]);
                      setDesktopTransactions([]);
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {statusMessage && (
                <div className="px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-emerald-400 flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5" />
                  {statusMessage}
                </div>
              )}

              {/* Desktop Live State Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Desktop Accounts view */}
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Desktop Synced Accounts ({desktopAccounts.length})
                    </span>
                    <span className="text-xs text-sky-400 font-mono">Live SQL Mirror</span>
                  </div>
                  {desktopAccounts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No accounts found. Create an account in the web app or desktop client!
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {desktopAccounts.map(acc => (
                        <div key={acc.id} className="flex items-center justify-between p-2 rounded bg-slate-900 text-xs border border-slate-800/60">
                          <div>
                            <div className="font-medium text-slate-200">{acc.name}</div>
                            <div className="text-[10px] text-slate-500">{acc.account_type} • {acc.currency}</div>
                          </div>
                          <div className="font-mono font-semibold text-emerald-400">
                            {acc.currency} {acc.current_balance}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Transactions view */}
                <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recent Transactions ({desktopTransactions.length})
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">Shared Ledger</span>
                  </div>
                  {desktopTransactions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">
                      No transactions recorded yet in this account.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {desktopTransactions.slice(0, 6).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-2 rounded bg-slate-900 text-xs border border-slate-800/60">
                          <div>
                            <div className="font-medium text-slate-200">{tx.payee || tx.notes || tx.type}</div>
                            <div className="text-[10px] text-slate-500">{tx.transaction_date} • {tx.type}</div>
                          </div>
                          <div className={`font-mono font-semibold ${
                            tx.type === 'INCOME' ? 'text-emerald-400' :
                            tx.type === 'EXPENSE' ? 'text-rose-400' :
                            tx.type === 'REFUND' ? 'text-amber-400' : 'text-blue-400'
                          }`}>
                            {tx.type === 'EXPENSE' ? '-' : '+'}{tx.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sync Audit Logs */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Backend Client Audit &amp; Synchronization Logs</span>
                  <span className="text-[10px] text-slate-500">Shared Database Audit Log</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-400">
                  {syncLogs.length === 0 ? (
                    <p className="text-slate-600 italic py-2">No sync events logged yet.</p>
                  ) : (
                    syncLogs.map(l => (
                      <div key={l.id} className="flex items-start gap-2 py-1 border-b border-slate-900 last:border-0">
                        <span className="text-slate-500 text-[10px] whitespace-nowrap">
                          {new Date(l.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 text-[10px]">
                          {l.client_type}
                        </span>
                        <span className="text-emerald-400 font-semibold">{l.action}:</span>
                        <span className="text-slate-300 truncate">{l.details}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Native JavaFX Desktop App code located in: <code className="text-slate-300">/desktop/src/main/java</code>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
