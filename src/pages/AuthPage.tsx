import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DevOtpBanner } from '../components/DevOtpBanner';
import { api } from '../services/api';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  DollarSign
} from 'lucide-react';

type AuthMode = 'LOGIN' | 'REGISTER' | 'VERIFY_OTP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export const AuthPage: React.FC = () => {
  const { login, register, verifyOtp, pendingEmail, setPendingEmail, devOtp, setDevOtp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    try {
      const res = await register(email, password, fullName, currency);
      if (res.devOtp) setDevOtp(res.devOtp);
      setPendingEmail(email);
      setSuccessMessage(res.message);
      setMode('VERIFY_OTP');
    } catch (err: any) {
      if (err.devOtp) {
        setDevOtp(err.devOtp);
        setPendingEmail(email);
        setSuccessMessage(err.message || 'OTP dispatched to your email.');
        setMode('VERIFY_OTP');
      } else {
        setErrorMessage(err.message || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    try {
      const targetEmail = pendingEmail || email;
      const purpose = mode === 'RESET_PASSWORD' ? 'PASSWORD_RESET' : 'REGISTRATION';
      await verifyOtp(targetEmail, otpCode, purpose);
    } catch (err: any) {
      // If registration purpose failed, retry with LOGIN purpose
      try {
        const targetEmail = pendingEmail || email;
        await verifyOtp(targetEmail, otpCode, 'LOGIN');
      } catch {
        setErrorMessage(err.message || 'Verification failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    try {
      const res = await login(email, password, 'WEB');
      if (res.requiresVerification || res.canOtpLogin) {
        setPendingEmail(email);
        if (res.devOtp) setDevOtp(res.devOtp);
        setMode('VERIFY_OTP');
        setSuccessMessage(res.message);
      }
    } catch (err: any) {
      if (err.requiresVerification || err.devOtp) {
        setPendingEmail(email);
        if (err.devOtp) setDevOtp(err.devOtp);
        setMode('VERIFY_OTP');
        setSuccessMessage(err.message || 'Verification required');
      } else {
        setErrorMessage(err.message || 'Login failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDirectAccess = async (targetEmail: string = 'divyaam2008@gmail.com') => {
    clearMessages();
    setIsSubmitting(true);
    try {
      const clean = targetEmail.trim().toLowerCase();
      setEmail(clean);
      setPendingEmail(clean);
      const res = await api.sendOtp({ email: clean, purpose: 'LOGIN' });
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtpCode(res.devOtp);
        await verifyOtp(clean, res.devOtp, 'LOGIN');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Direct access error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword(email);
      if (res.devOtp) setDevOtp(res.devOtp);
      setPendingEmail(email);
      setSuccessMessage(res.message);
      setMode('RESET_PASSWORD');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsSubmitting(true);
    try {
      const res = await api.resetPassword({
        email: pendingEmail || email,
        otpCode,
        newPassword
      });
      setSuccessMessage(res.message);
      setMode('LOGIN');
      setPassword('');
      setOtpCode('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtpLogin = async () => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your valid Gmail address first');
      return;
    }
    clearMessages();
    setIsSubmitting(true);
    try {
      const clean = email.trim().toLowerCase();
      const res = await api.sendOtp({ email: clean, purpose: 'LOGIN' });
      if (res.devOtp) setDevOtp(res.devOtp);
      setPendingEmail(clean);
      setSuccessMessage(`Real-time OTP dispatched to ${clean}. Please check your Gmail inbox.`);
      setMode('VERIFY_OTP');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch OTP to Gmail');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    clearMessages();
    try {
      const targetEmail = pendingEmail || email;
      const purpose = mode === 'RESET_PASSWORD' ? 'PASSWORD_RESET' : 'REGISTRATION';
      const res = await api.sendOtp({ email: targetEmail, purpose });
      if (res.devOtp) setDevOtp(res.devOtp);
      setSuccessMessage(`A fresh real-time verification code has been dispatched to ${targetEmail}.`);
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 text-white font-black text-2xl shadow-xl shadow-sky-500/20 mb-3">
            PP
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            PocketPilot
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Free-first personal finance platform • Web &amp; Desktop Client
          </p>
        </div>

        {/* Global Dev OTP Banner */}
        <div className="mt-6">
          <DevOtpBanner onApplyOtp={code => setOtpCode(code)} />
        </div>

        {/* Auth Box */}
        <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          {/* Messages */}
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form switchers */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white">Sign In to Your Account</h2>
                <p className="text-xs text-slate-400">Manage finances, budgets and synchronized records</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setMode('FORGOT_PASSWORD'); }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white text-sm transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In with Password'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Or Instant Gmail OTP</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleSendOtpLogin}
                disabled={isSubmitting || !email.includes('@')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-400 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Mail className="h-4 w-4 text-sky-400" />
                Send Real-Time OTP to {email || 'Gmail Address'}
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleQuickDirectAccess('divyaam2008@gmail.com')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-emerald-200" />
                  1-Click Direct Access as divyaam2008@gmail.com
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('REGISTER'); }}
                  className="font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  Create Account with OTP
                </button>
              </div>
            </form>
          )}

          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white">Create PocketPilot Account</h2>
                <p className="text-xs text-slate-400">Free, private, secure personal finance platform</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="e.g. Alex Taylor"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address (for OTP Verification)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Base Currency
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="CAD">CAD ($) - Canadian Dollar</option>
                    <option value="AUD">AUD ($) - Australian Dollar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="Choose secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Generating OTP...' : 'Send Real-Time Verification OTP'}
                <KeyRound className="h-4 w-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('LOGIN'); }}
                  className="font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'VERIFY_OTP' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Enter Email Verification OTP</h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    Real-time
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Code sent to <span className="font-semibold text-sky-400">{pendingEmail || email}</span>
                </p>
                {(pendingEmail || email).toLowerCase().includes('@gmail.com') && (
                  <div className="mt-2.5">
                    <a
                      href="https://mail.google.com/mail/u/0/#search/PocketPilot"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/20 transition-all font-medium"
                    >
                      <span>Check Gmail Inbox</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Direct In-App OTP Code Display */}
              {devOtp && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/80 to-indigo-950/80 border border-sky-500/40 text-center shadow-lg animate-in fade-in">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center justify-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" />
                    Real-Time Verification Code
                  </div>
                  <div className="font-mono text-3xl font-black tracking-widest text-sky-300 my-1">
                    {devOtp}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(devOtp)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all shadow cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Click to Auto-Fill Code ({devOtp})
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-xl tracking-widest font-bold focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="••••••"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500">Expires in 10 minutes</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-sky-400 hover:text-sky-300 font-medium cursor-pointer disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCode.length !== 6}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white text-sm transition-all shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP & Enter'}
                <ShieldCheck className="h-4 w-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('REGISTER'); }}
                  className="font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {mode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white">Reset Account Password</h2>
                <p className="text-xs text-slate-400">We will send a 6-digit recovery OTP to your email</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Sending OTP...' : 'Send Password Reset OTP'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => { clearMessages(); setMode('LOGIN'); }}
                  className="font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'RESET_PASSWORD' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white">Enter OTP &amp; Set New Password</h2>
                <p className="text-xs text-slate-400">
                  Verification code sent to {pendingEmail || email}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-lg tracking-widest focus:outline-none focus:border-sky-500"
                  placeholder="••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                  placeholder="Enter new password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Set New Password & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
