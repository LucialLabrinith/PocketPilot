import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  KeyRound,
  Check,
  X,
  Mail,
  ExternalLink,
  Settings,
  Send,
  Eye,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Server
} from 'lucide-react';

interface DevOtpBannerProps {
  onApplyOtp?: (code: string) => void;
}

export const DevOtpBanner: React.FC<DevOtpBannerProps> = ({ onApplyOtp }) => {
  const { devOtp, setDevOtp, pendingEmail } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [latestEmail, setLatestEmail] = useState<any>(null);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // SMTP form state
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    if (pendingEmail) {
      loadLatestEmail(pendingEmail);
    }
    loadSmtpStatus();
  }, [pendingEmail, devOtp]);

  const loadSmtpStatus = async () => {
    try {
      const res = await api.getSmtpStatus();
      if (res.data) {
        setSmtpStatus(res.data);
      }
    } catch {
      // Ignored
    }
  };

  const loadLatestEmail = async (email: string) => {
    setLoadingEmail(true);
    try {
      const res = await api.getLatestEmail(email);
      if (res.data) {
        setLatestEmail(res.data);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleCopy = () => {
    if (!devOtp) return;
    navigator.clipboard.writeText(devOtp);
    setCopied(true);
    if (onApplyOtp) {
      onApplyOtp(devOtp);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    setTestEmailStatus(null);
    try {
      const res = await api.updateSmtpConfig({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpPort === '465',
        user: smtpUser,
        pass: smtpPass,
        fromEmail: smtpUser,
      });
      setSmtpStatus(res.data);
      setTestEmailStatus('SMTP credentials updated! You can now send real emails directly.');
    } catch (err: any) {
      setTestEmailStatus(`Failed to update SMTP: ${err.message}`);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestToGmail = async () => {
    const target = pendingEmail || smtpUser || 'divyaam2008@gmail.com';
    setTestEmailStatus(`Dispatching real-time test OTP to ${target}...`);
    try {
      const res = await api.sendTestEmail(target);
      setTestEmailStatus(res.message);
      if (res.data?.otpCode) {
        setDevOtp(res.data.otpCode);
        setLatestEmail(res.data);
      }
    } catch (err: any) {
      setTestEmailStatus(`Dispatch error: ${err.message}`);
    }
  };

  if (!devOtp && !pendingEmail) return null;

  const isGmail = (pendingEmail || '').toLowerCase().includes('@gmail.com');
  const gmailSearchUrl = `https://mail.google.com/mail/u/0/#search/PocketPilot`;

  return (
    <>
      <div className="mb-6 rounded-2xl border border-sky-500/40 bg-gradient-to-r from-sky-950/80 via-slate-900/90 to-indigo-950/80 p-4 text-slate-100 shadow-xl shadow-sky-950/50 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-sky-500/20 p-2.5 text-sky-400 shrink-0 border border-sky-500/30">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  Real-Time OTP Dispatched
                </span>

                {smtpStatus?.isConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="h-3 w-3" /> Gmail SMTP Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Server className="h-3 w-3" /> Live Dispatch Engine
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-xs text-slate-300">
                Dispatched to:{' '}
                <strong className="text-sky-300 font-semibold">{pendingEmail || 'entered email'}</strong>
              </p>

              {(smtpStatus?.appPasswordHelp || latestEmail?.smtpNotice) && (
                <p className="mt-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 max-w-md">
                  💡 Note: Google requires a 16-character App Password (myaccount.google.com/apppasswords). Your code is ready right here:
                </p>
              )}

              {devOtp && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Security Code:</span>
                  <span className="font-mono text-base font-extrabold tracking-widest text-sky-300 bg-sky-950/90 px-3 py-1 rounded-lg border border-sky-500/40 shadow-inner">
                    {devOtp}
                  </span>
                  <span className="text-[11px] text-slate-400">(Expires in 10m)</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isGmail && (
              <a
                href={gmailSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/30 transition-all cursor-pointer"
                title="Open Gmail inbox in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open Gmail
              </a>
            )}

            <button
              type="button"
              onClick={() => {
                if (pendingEmail) loadLatestEmail(pendingEmail);
                setShowEmailModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              title="Inspect rendered email body"
            >
              <Eye className="h-3.5 w-3.5" />
              View Email
            </button>

            {devOtp && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/30 transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
                {copied ? 'Filled!' : 'Auto-Fill'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowSmtpModal(true)}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Configure Gmail SMTP / App Password"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setDevOtp(null)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rendered Email Inspector Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-sky-400" />
                <h3 className="font-bold text-sm text-white">
                  Real-Time Dispatched Email Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Email Meta */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">To:</span>
                <span className="text-sky-300 font-semibold">{pendingEmail || latestEmail?.recipient || 'user'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="text-slate-200">{latestEmail?.subject || `🔐 PocketPilot Verification Code: ${devOtp}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Status:</span>
                <span className="text-emerald-400 font-semibold">{latestEmail?.status || 'DISPATCHED_IN_REALTIME'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dispatched At:</span>
                <span className="text-slate-400">{latestEmail?.sentAt ? new Date(latestEmail.sentAt).toLocaleString() : new Date().toLocaleString()}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 flex flex-col items-center">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-inner text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-black text-xl mb-3 shadow-lg">
                  PP
                </div>
                <h4 className="text-lg font-bold text-white">PocketPilot</h4>
                <p className="text-xs text-slate-400 mb-6">Automated Security Verification Service</p>

                <p className="text-xs text-slate-300 text-left mb-4">
                  A verification request was made for <strong className="text-sky-300">{pendingEmail || 'your email'}</strong>. Enter this 6-digit one-time code to proceed:
                </p>

                <div className="my-5 p-4 rounded-xl bg-slate-950 border-2 border-dashed border-sky-500/60 text-center">
                  <div className="text-[11px] uppercase tracking-wider text-sky-400 font-semibold mb-1">
                    Your One-Time Passcode (OTP)
                  </div>
                  <div className="font-mono text-3xl font-black tracking-widest text-sky-400">
                    {devOtp || latestEmail?.otpCode || '------'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Valid for 10 minutes</div>
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-left text-[11px] text-amber-200 mb-4">
                  <strong>Security Note:</strong> Never share this code with anyone. PocketPilot staff will never ask for your code.
                </div>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (devOtp || latestEmail?.otpCode) {
                        handleCopy();
                        setShowEmailModal(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-600/30 cursor-pointer"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Auto-Fill Code &amp; Continue
                  </button>
                  {isGmail && (
                    <a
                      href={gmailSearchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open in Gmail
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>MIME-compliant HTML &amp; text alternative</span>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMTP Configuration Modal */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-sky-400" />
                <h3 className="font-bold text-sm text-white">
                  Gmail &amp; Real SMTP Delivery Settings
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSmtpModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSmtp} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-slate-300 space-y-1">
                <p className="font-semibold text-sky-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Real Gmail Inbox Delivery Setup
                </p>
                <p className="text-[11px] leading-relaxed">
                  To have emails physically delivered to any Gmail address over Google's SMTP network, you can provide a Google 16-character <strong>App Password</strong> (Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App Passwords).
                </p>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Gmail or SMTP Email Address
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={e => setSmtpUser(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Google App Password (16 characters)
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={e => setSmtpPass(e.target.value)}
                  placeholder="•••• •••• •••• ••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={e => setSmtpHost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={e => setSmtpPort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              </div>

              {testEmailStatus && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 text-sky-300 text-xs">
                  {testEmailStatus}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleSendTestToGmail}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  Test Send to Entered Gmail
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSmtpModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSmtp}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-lg shadow-sky-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSmtp ? 'Saving...' : 'Save & Activate'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
