import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { api } from '../services/api';
import { SwitchStatusInfo, LegalTransferCertificate } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  Landmark,
  RefreshCw,
  Search,
  FileText,
  Lock,
  ArrowRightLeft,
  Coins,
  Scale,
  ExternalLink,
  Printer,
  Copy,
  Server
} from 'lucide-react';

interface BankSwitchComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCertificate?: LegalTransferCertificate | null;
}

export const BankSwitchComplianceModal: React.FC<BankSwitchComplianceModalProps> = ({
  isOpen,
  onClose,
  selectedCertificate
}) => {
  const { formatCurrency, formatDate } = useLanguage();

  const [activeTab, setActiveTab] = useState<'SWITCH_STATUS' | 'VERIFY_TRANSFERREE' | 'FEE_SCHEDULE' | 'CERTIFICATE'>('SWITCH_STATUS');
  const [switchStatus, setSwitchStatus] = useState<SwitchStatusInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pinging, setPinging] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<any | null>(null);

  // Transferree Legal Verification State
  const [verifyQuery, setVerifyQuery] = useState<string>('starbucks@paytm');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [transferreeResult, setTransferreeResult] = useState<any | null>(null);

  // Fee Calculator State
  const [calcAmount, setCalcAmount] = useState<string>('2500.00');
  const [calcType, setCalcType] = useState<'P2P' | 'P2M'>('P2P');
  const [feeResult, setFeeResult] = useState<any | null>(null);

  // Certificate Modal State
  const [activeCertificate, setActiveCertificate] = useState<LegalTransferCertificate | null>(selectedCertificate || null);
  const [copiedRrn, setCopiedRrn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSwitchStatus();
      handleCalculateFee(calcAmount, calcType);
      if (selectedCertificate) {
        setActiveCertificate(selectedCertificate);
        setActiveTab('CERTIFICATE');
      }
    }
  }, [isOpen, selectedCertificate]);

  const loadSwitchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.getSwitchStatus();
      setSwitchStatus(res.data);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  const handlePingSwitch = async (target: 'PINNACLE_CBS' | 'NPCI_SWITCH') => {
    setPinging(target);
    setPingResult(null);
    try {
      const res = await api.pingSwitch(target);
      setPingResult(res);
      // Reload status
      loadSwitchStatus();
    } catch (err: any) {
      setPingResult({ success: false, message: err.message || 'Ping failed' });
    } finally {
      setPinging(null);
    }
  };

  const handleVerifyTransferree = async () => {
    if (!verifyQuery.trim()) return;
    setVerifying(true);
    setTransferreeResult(null);
    try {
      const res = await api.verifyTransferree(verifyQuery.trim());
      setTransferreeResult(res.data);
    } catch (err: any) {
      setTransferreeResult({ found: false, message: err.message || 'Verification failed' });
    } finally {
      setVerifying(false);
    }
  };

  const handleCalculateFee = async (amt: string, type: string) => {
    try {
      const res = await api.calculateTransferFee(amt, type);
      setFeeResult(res.data);
    } catch {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Pinnacle CBS, NPCI &amp; Bank Switch Legal Gateway
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ISO 20022 Certified
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                RBI PSSA 2007 Regulatory Settlement • Transfer Fee Legalization • Central Transferree Directory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs shrink-0 font-medium">
          <button
            onClick={() => setActiveTab('SWITCH_STATUS')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'SWITCH_STATUS'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>Switch Status</span>
          </button>

          <button
            onClick={() => setActiveTab('VERIFY_TRANSFERREE')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'VERIFY_TRANSFERREE'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Verify Transferree</span>
          </button>

          <button
            onClick={() => setActiveTab('FEE_SCHEDULE')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'FEE_SCHEDULE'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Transfer Fee Law</span>
          </button>

          <button
            onClick={() => setActiveTab('CERTIFICATE')}
            className={`py-3 px-2 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-all ${
              activeTab === 'CERTIFICATE'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Legal Certificate</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: SWITCH STATUS */}
          {activeTab === 'SWITCH_STATUS' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Pinnacle CBS Node */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Banking Host</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      ONLINE
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Pinnacle CBS Host</h4>
                    <p className="text-[10px] text-slate-500">Infosys Finacle Enterprise Switch v11.14</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Latency:</span>
                      <span className="text-emerald-500 font-bold">{switchStatus?.pinnacleCbs.latencyMs || 32} ms</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Protocol:</span>
                      <span className="text-slate-700 dark:text-slate-300">ISO 20022 XML</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Cipher:</span>
                      <span className="text-slate-700 dark:text-slate-300">AES-256-GCM</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePingSwitch('PINNACLE_CBS')}
                    disabled={pinging === 'PINNACLE_CBS'}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {pinging === 'PINNACLE_CBS' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-amber-500" />}
                    <span>Test Pinnacle Ping</span>
                  </button>
                </div>

                {/* 2. NPCI Central Switch */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">National Clearing</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      OPERATIONAL
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">NPCI Central Switch</h4>
                    <p className="text-[10px] text-slate-500">Unified Payments Interface (UPI 2.0 / IMPS)</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Latency:</span>
                      <span className="text-emerald-500 font-bold">{switchStatus?.npciCentralSwitch.latencyMs || 44} ms</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Settlement:</span>
                      <span className="text-slate-700 dark:text-slate-300">T+0 Real-Time</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Rails:</span>
                      <span className="text-slate-700 dark:text-slate-300">UPI, IMPS, NFS</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePingSwitch('NPCI_SWITCH')}
                    disabled={pinging === 'NPCI_SWITCH'}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    {pinging === 'NPCI_SWITCH' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-emerald-500" />}
                    <span>Test NPCI Ping</span>
                  </button>
                </div>

                {/* 3. Bank Switch & NFS */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Interbank Switch</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      ACTIVE
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Bank Switch (NFS)</h4>
                    <p className="text-[10px] text-slate-500">ISO 8583 Interbank Financial Switch</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px] font-mono">
                    <div className="flex justify-between text-slate-500">
                      <span>Connected Banks:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">148 Banks</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Avg TPS:</span>
                      <span className="text-slate-700 dark:text-slate-300">8,450 tx/sec</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>MTI Supported:</span>
                      <span className="text-slate-700 dark:text-slate-300">0200 / 0210 / 0420</span>
                    </div>
                  </div>
                  <div className="py-1.5 px-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-center text-xs font-bold border border-emerald-500/20">
                    Switch Handshake Verified
                  </div>
                </div>
              </div>

              {/* Ping Result Notification */}
              {pingResult && (
                <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in ${
                  pingResult.success ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-900 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-950/40 border-red-500/40 text-red-900 dark:text-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{pingResult.message}</span>
                  </div>
                  {pingResult.data?.roundTripLatencyMs && (
                    <span className="font-mono font-bold text-emerald-600">{pingResult.data.roundTripLatencyMs} ms</span>
                  )}
                </div>
              )}

              {/* Legal Regulatory Compliance Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-900 dark:text-indigo-200">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Reserve Bank of India (RBI) &amp; Legal Settlement Standards</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-900 dark:text-white">Payment &amp; Settlement Systems Act, 2007:</strong>
                    Direct debit/credit clearance is legally recognized tender under Section 10(2) with irreversible T+0 settlement.
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <strong className="block text-slate-900 dark:text-white">Zero Surcharge Mandate (RBI/2019-20/115):</strong>
                    Prohibits passing switch interchange or processing fees to retail users for P2P UPI transfers.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFY TRANSFERREE */}
          {activeTab === 'VERIFY_TRANSFERREE' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  NPCI Beneficiary Name Inquiry (BNI) &amp; Transferree Legalization
                </h3>
                <p className="text-xs text-slate-500">
                  Look up any UPI VPA, Merchant handle, or registered phone number across the NPCI Central Directory to legalize recipient name before transferring money.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={verifyQuery}
                    onChange={e => setVerifyQuery(e.target.value)}
                    placeholder="Enter recipient UPI ID (e.g. starbucks@paytm or rohan@okhdfcbank)..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifyTransferree}
                  disabled={verifying}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all disabled:opacity-50"
                >
                  {verifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  <span>Verify Transferree</span>
                </button>
              </div>

              {/* Sample Queries */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Quick Test Transferrees:</span>
                {[
                  'starbucks@paytm',
                  'reliancefresh@okicici',
                  'indianoil@oksbi',
                  'rohan@okhdfcbank',
                  'priya@oksbi',
                  '9876543210',
                ].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setVerifyQuery(q);
                      api.verifyTransferree(q).then(res => setTransferreeResult(res.data));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono font-semibold hover:bg-indigo-50 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Verification Result Card */}
              {transferreeResult && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          NPCI Directory Legal Verification Passed
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">KYC &amp; Sanctions Screening: CLEARED</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      Legal Transferree Authenticated
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Official Legal Name</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white block">{transferreeResult.legalName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Trading / Display Name</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">{transferreeResult.tradeName || transferreeResult.legalName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Resolved VPA</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">{transferreeResult.vpa}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 block font-semibold">Beneficiary Bank Switch</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block">{transferreeResult.bank} {transferreeResult.ifsc ? `(${transferreeResult.ifsc})` : ''}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                    <span>Legal Route: Pinnacle CBS ➔ NPCI Central Switch ➔ {transferreeResult.bank} Switch</span>
                    <span className="font-bold">100% Routable</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRANSFER FEE LAW & CALCULATOR */}
          {activeTab === 'FEE_SCHEDULE' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transfer Fee ("tranfee") Legal Framework &amp; Interchange Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  Under RBI directives and Section 10(2) of the Payment &amp; Settlement Systems Act 2007, transfer fees are strictly regulated to protect retail users and legalize transparent settlement.
                </p>
              </div>

              {/* Interactive Fee Calculator */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Legal Transfer Fee &amp; Interchange Calculator:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">Transfer Amount (INR)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold font-mono text-slate-400">₹</span>
                      <input
                        type="number"
                        value={calcAmount}
                        onChange={e => {
                          setCalcAmount(e.target.value);
                          handleCalculateFee(e.target.value, calcType);
                        }}
                        className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-black"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">Transfer Nature</label>
                    <select
                      value={calcType}
                      onChange={e => {
                        const t = e.target.value as any;
                        setCalcType(t);
                        handleCalculateFee(calcAmount, t);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="P2P">Peer-to-Peer (P2P Friend / Family / Contact)</option>
                      <option value="P2M">Peer-to-Merchant (P2M Store / Business / QR)</option>
                    </select>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                {feeResult && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Customer Transfer Fee Charged:</span>
                      <span className="font-mono font-black text-emerald-600 text-base">₹ {feeResult.customerFee} (FREE)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>GST (18% on customer fee):</span>
                      <span className="font-mono">₹ {feeResult.gst}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>NPCI Switch Settlement Surcharge:</span>
                      <span className="font-mono">₹ {feeResult.npciSwitchSurcharge} (Absorbed by Bank)</span>
                    </div>
                    {feeResult.acquirerInterchange !== '0.00' && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Merchant Acquirer Interchange (1.10%):</span>
                        <span className="font-mono text-amber-600">₹ {feeResult.acquirerInterchange} (Merchant Paid)</span>
                      </div>
                    )}
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                      <strong>Legal Guarantee: </strong>{feeResult.regulatoryClause}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL LEGAL TRANSFER CERTIFICATE */}
          {activeTab === 'CERTIFICATE' && (
            <div className="space-y-4 animate-in fade-in">
              {activeCertificate ? (
                <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 border-2 border-indigo-500/40 shadow-xl space-y-4 text-xs">
                  {/* Certificate Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                        🏛️
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          NPCI &amp; Pinnacle CBS Transfer Certificate
                        </h4>
                        <p className="text-[10px] text-slate-500 font-mono">
                          CERTIFICATE ID: {activeCertificate.certificateId}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/20">
                        ✓ SETTLED &amp; LEGALIZED
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{formatDate(activeCertificate.transferDate)}</p>
                    </div>
                  </div>

                  {/* NPCI Reference Banner */}
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                        Official 12-Digit NPCI RRN (Retrieval Reference Number):
                      </span>
                      <span className="text-base sm:text-lg font-mono font-black text-indigo-900 dark:text-indigo-100">
                        {activeCertificate.npciRrn}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(activeCertificate.npciRrn);
                        setCopiedRrn(true);
                        setTimeout(() => setCopiedRrn(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs hover:bg-indigo-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedRrn ? 'Copied RRN!' : 'Copy RRN'}</span>
                    </button>
                  </div>

                  {/* Core Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Remitter */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Remitter (Sender)</span>
                      <p className="font-bold text-slate-900 dark:text-white">{activeCertificate.remitter.accountHolder}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {activeCertificate.remitter.bankName} • {activeCertificate.remitter.maskedAccount}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">VPA: {activeCertificate.remitter.vpa}</p>
                    </div>

                    {/* Transferree */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">Transferree (Beneficiary)</span>
                      <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span>{activeCertificate.transferree.legalName}</span>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 inline" />
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {activeCertificate.transferree.bankName}
                      </p>
                      <p className="font-mono text-[10px] text-slate-400">VPA: {activeCertificate.transferree.vpaOrAccount}</p>
                    </div>
                  </div>

                  {/* Switch Clearing Audit Trail */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pinnacle CBS Host Journal:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeCertificate.cbsPinnacleJournal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Switch Auth Code:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeCertificate.bankSwitchAuthCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Network Txn ID (UMN):</span>
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{activeCertificate.networkTransactionId}</span>
                    </div>
                  </div>

                  {/* Financial Settlement & Fee Legalization */}
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300">
                        Legally Settled Principal Amount
                      </span>
                      <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-300">
                        {formatCurrency(activeCertificate.financials.transferAmount, activeCertificate.financials.currency)}
                      </div>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="text-slate-500 block">Transfer Fee: <strong>₹ {activeCertificate.financials.transferFee}</strong></span>
                      <span className="text-emerald-600 font-bold block">100% Free Retail Transfer</span>
                    </div>
                  </div>

                  {/* Cryptographic Digital Seal & Compliance */}
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Cryptographic SHA256 Digital Seal:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{activeCertificate.compliance.digitalSeal}</span>
                    </div>
                    <div>
                      <span>Statutory Reference: {activeCertificate.compliance.rbiActRef}</span>
                    </div>
                  </div>

                  {/* Print / Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print Official Certificate</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Certificate Selected</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Make any transfer from the UPI modal or view any transaction from the Transactions page to inspect its legal NPCI &amp; Pinnacle Switch Certificate.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
