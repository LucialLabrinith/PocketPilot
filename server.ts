import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import { dbStore, hashPassword, AccountRecord, TransactionRecord, CategoryRecord, InvestmentRecord } from './server/db.ts';
import {
  sendOtpEmail,
  getSmtpStatus,
  updateSmtpSettings,
  getDispatchedEmails,
  getLatestEmailFor,
  EmailDispatchRecord
} from './server/mailer.ts';

const app = express();
app.use(express.json());

// Enable CORS for external desktop client connections
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Auth helper middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const session = dbStore.db.sessions.find(s => s.token === token);
  if (!session || new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
  const user = dbStore.db.users.find(u => u.id === session.user_id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found' });
  }
  (req as any).user = user;
  (req as any).session = session;
  next();
}

// ---------------------------------------------------------------------------
// 1. AUTHENTICATION & EMAIL OTP ROUTES
// ---------------------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'UP',
    name: 'PocketPilot Unified REST API',
    runtime: 'Node.js + Spring Boot 3 Java 21 Co-compatible',
    realtimeEmailOtp: true,
    smtp: getSmtpStatus(),
    usersCount: dbStore.db.users.length,
    accountsCount: dbStore.db.accounts.length,
    transactionsCount: dbStore.db.transactions.length,
    timestamp: new Date().toISOString()
  });
});

// SMTP Status and Configuration (allows user to connect Gmail App Password live)
app.get('/api/auth/smtp-status', (_req, res) => {
  res.json({ success: true, data: getSmtpStatus() });
});

app.post('/api/auth/smtp-config', (req, res) => {
  try {
    const { host, port, secure, user, pass, fromEmail, fromName } = req.body;
    const updated = updateSmtpSettings({
      ...(host ? { host: String(host).trim() } : {}),
      ...(port ? { port: Number(port) } : {}),
      ...(secure !== undefined ? { secure: Boolean(secure) } : {}),
      ...(user !== undefined ? { user: String(user).trim() } : {}),
      ...(pass !== undefined ? { pass: String(pass).trim() } : {}),
      ...(fromEmail ? { fromEmail: String(fromEmail).trim() } : {}),
      ...(fromName ? { fromName: String(fromName).trim() } : {}),
    });
    res.json({ success: true, message: 'SMTP settings updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dispatched Emails Inspection API (Live audit and preview)
app.get('/api/auth/dispatched-emails', (req, res) => {
  const email = req.query.email as string | undefined;
  const list = getDispatchedEmails(email);
  res.json({ success: true, data: list });
});

app.get('/api/auth/latest-email', (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email query parameter required' });
  }
  const latest = getLatestEmailFor(email);
  res.json({ success: true, data: latest || null });
});

// Universal Real-Time OTP Dispatch API
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'REGISTRATION', fullName = '' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();

    // Check rate limit: max 5 requests per 15 mins
    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const recent = dbStore.db.otp_verifications.filter(o => o.email === cleanEmail && o.created_at >= windowStart);
    if (recent.length >= 6) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP request limit reached. Please wait a few minutes before trying again.'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date().toISOString();
    const otpRecord = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      otp_code: otpCode,
      purpose: (['REGISTRATION', 'PASSWORD_RESET', 'LOGIN'].includes(purpose) ? purpose : 'REGISTRATION') as any,
      attempts: 0,
      resend_count: recent.length,
      last_sent_at: now,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      is_used: false,
      created_at: now,
    };
    dbStore.db.otp_verifications.push(otpRecord);
    dbStore.save();

    // Dispatch real email to entered Gmail ID
    const dispatch = await sendOtpEmail(cleanEmail, otpCode, otpRecord.purpose);

    console.log(`[REALTIME OTP] Dispatched code ${otpCode} to ${cleanEmail} (Purpose: ${purpose}, Mode: ${dispatch.deliveryMode})`);

    return res.json({
      success: true,
      message: `Real-time OTP has been dispatched to ${cleanEmail}.`,
      devOtp: otpCode,
      emailDelivery: {
        id: dispatch.id,
        recipient: dispatch.recipient,
        subject: dispatch.subject,
        status: dispatch.status,
        mode: dispatch.deliveryMode,
        smtpConfigured: dispatch.smtpConfigured,
        sentAt: dispatch.sentAt,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Test Email Dispatch API
app.post('/api/auth/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const dispatch = await sendOtpEmail(cleanEmail, testOtp, 'LOGIN');
    res.json({
      success: true,
      message: `Real-time test OTP dispatched to ${cleanEmail}`,
      data: dispatch
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, currency } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = dbStore.db.users.find(u => u.email === cleanEmail);
    const now = new Date().toISOString();

    if (user) {
      // User exists: update their password and name with what they just submitted so they can log in seamlessly
      user.password_hash = hashPassword(password);
      user.full_name = fullName.trim();
      if (currency) user.currency = currency;
      user.is_verified = false;
      user.updated_at = now;
    } else {
      user = {
        id: crypto.randomUUID(),
        email: cleanEmail,
        password_hash: hashPassword(password),
        full_name: fullName.trim(),
        currency: currency || 'USD',
        is_verified: false,
        created_at: now,
        updated_at: now,
      };
      dbStore.db.users.push(user);
    }

    // Rate limiting: check resend window (max 8 in 15 minutes)
    const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const recentOtps = dbStore.db.otp_verifications.filter(o => o.email === cleanEmail && o.created_at >= windowStart);
    if (recentOtps.length >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP request limit reached. Please wait before trying again.'
      });
    }

    // Generate 6-digit OTP (expires in 10 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpRecord = {
      id: crypto.randomUUID(),
      email: cleanEmail,
      otp_code: otpCode,
      purpose: 'REGISTRATION' as const,
      attempts: 0,
      resend_count: recentOtps.length,
      last_sent_at: now,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      is_used: false,
      created_at: now,
    };
    dbStore.db.otp_verifications.push(otpRecord);
    dbStore.save();

    // Dispatch real-time email
    const dispatch = await sendOtpEmail(cleanEmail, otpCode, 'REGISTRATION');
    console.log(`[REALTIME OTP] Registration OTP dispatched to ${cleanEmail}: ${otpCode}`);

    return res.json({
      success: true,
      message: `Account credentials saved. Real-time verification OTP dispatched to ${cleanEmail}.`,
      data: {
        userId: user.id,
        email: cleanEmail,
        fullName: user.full_name,
        currency: user.currency,
        verified: false,
      },
      devOtp: otpCode,
      emailDelivery: {
        id: dispatch.id,
        recipient: dispatch.recipient,
        status: dispatch.status,
        mode: dispatch.deliveryMode,
        smtpConfigured: dispatch.smtpConfigured,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { email, otpCode, purpose = 'REGISTRATION', clientType = 'WEB' } = req.body;
    if (!email || !otpCode) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = dbStore.db.otp_verifications
      .filter(o => o.email === cleanEmail && (purpose === 'PASSWORD_RESET' ? o.purpose === 'PASSWORD_RESET' : o.purpose !== 'PASSWORD_RESET') && !o.is_used)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!pending) {
      return res.status(400).json({ success: false, message: 'No pending OTP verification found. Please request a new code.' });
    }

    if (new Date(pending.expires_at) < new Date()) {
      pending.is_used = true;
      dbStore.save();
      return res.status(400).json({ success: false, message: 'The OTP code has expired. Please request a new one.' });
    }

    if (pending.attempts >= 3) {
      pending.is_used = true;
      dbStore.save();
      return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Code invalidated. Please request a new one.' });
    }

    if (pending.otp_code !== otpCode.trim()) {
      pending.attempts += 1;
      dbStore.save();
      const remaining = 3 - pending.attempts;
      return res.status(400).json({ success: false, message: `Invalid OTP code. ${remaining} attempt(s) remaining.` });
    }

    // OTP is valid!
    pending.is_used = true;

    let user = dbStore.db.users.find(u => u.email === cleanEmail);
    if (!user) {
      // Auto-create verified user profile for smooth OTP sign-in / verification
      user = {
        id: crypto.randomUUID(),
        email: cleanEmail,
        password_hash: hashPassword('otp-auth-' + crypto.randomUUID().slice(0, 8)),
        full_name: cleanEmail.split('@')[0],
        currency: 'USD',
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dbStore.db.users.push(user);
    } else {
      user.is_verified = true;
      user.updated_at = new Date().toISOString();
    }

    // Generate session token (valid for 7 days)
    const token = 'pp_' + crypto.randomUUID().replace(/-/g, '');
    const session = {
      token,
      user_id: user.id,
      client_type: clientType as 'WEB' | 'DESKTOP_JAVAFX',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    dbStore.db.sessions.push(session);

    // Audit log
    dbStore.db.sync_audit_logs.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      client_type: clientType,
      action: 'OTP_VERIFIED',
      details: `User verified OTP for ${purpose}`,
      timestamp: new Date().toISOString(),
    });

    dbStore.save();

    return res.json({
      success: true,
      message: 'Verification successful. Welcome to PocketPilot!',
      data: {
        token,
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        currency: user.currency,
        verified: user.is_verified,
        clientType,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, clientType = 'WEB' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = dbStore.db.users.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const hash = hashPassword(password);
    if (user.password_hash !== hash) {
      // Dispatched OTP so user can sign in with OTP without getting stuck!
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      dbStore.db.otp_verifications.push({
        id: crypto.randomUUID(),
        email: cleanEmail,
        otp_code: otpCode,
        purpose: 'LOGIN',
        attempts: 0,
        resend_count: 0,
        last_sent_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        is_used: false,
        created_at: new Date().toISOString(),
      });
      dbStore.save();
      const dispatch = await sendOtpEmail(cleanEmail, otpCode, 'LOGIN');
      console.log(`[REALTIME OTP] Login OTP dispatched on password mismatch for ${cleanEmail}: ${otpCode}`);

      return res.status(200).json({
        success: false,
        requiresVerification: true,
        canOtpLogin: true,
        message: `Password mismatch for ${cleanEmail}. Real-time OTP sent to your Gmail so you can sign in directly!`,
        devOtp: otpCode,
        emailDelivery: {
          id: dispatch.id,
          recipient: dispatch.recipient,
          status: dispatch.status,
          mode: dispatch.deliveryMode,
        }
      });
    }

    if (!user.is_verified) {
      // Send a new registration OTP in real time
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      dbStore.db.otp_verifications.push({
        id: crypto.randomUUID(),
        email: cleanEmail,
        otp_code: otpCode,
        purpose: 'REGISTRATION',
        attempts: 0,
        resend_count: 0,
        last_sent_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        is_used: false,
        created_at: new Date().toISOString(),
      });
      dbStore.save();

      const dispatch = await sendOtpEmail(cleanEmail, otpCode, 'REGISTRATION');
      console.log(`[REALTIME OTP] Verification OTP dispatched for unverified login ${cleanEmail}: ${otpCode}`);

      return res.status(200).json({
        success: false,
        requiresVerification: true,
        message: `Your email address has not been verified yet. Real-time OTP sent to ${cleanEmail}.`,
        devOtp: otpCode,
        emailDelivery: {
          id: dispatch.id,
          recipient: dispatch.recipient,
          status: dispatch.status,
          mode: dispatch.deliveryMode,
          smtpConfigured: dispatch.smtpConfigured,
        }
      });
    }

    // Generate session token
    const token = 'pp_' + crypto.randomUUID().replace(/-/g, '');
    dbStore.db.sessions.push({
      token,
      user_id: user.id,
      client_type: clientType,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    dbStore.db.sync_audit_logs.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      client_type: clientType,
      action: 'LOGIN',
      details: `Client logged in successfully`,
      timestamp: new Date().toISOString(),
    });

    dbStore.save();

    return res.json({
      success: true,
      message: `Signed in successfully via ${clientType}`,
      data: {
        token,
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        currency: user.currency,
        verified: user.is_verified,
        clientType,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  const session = (req as any).session;
  dbStore.db.sessions = dbStore.db.sessions.filter(s => s.token !== session.token);
  dbStore.save();
  res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = dbStore.db.users.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: `No registered account found with email ${cleanEmail}.` });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    dbStore.db.otp_verifications.push({
      id: crypto.randomUUID(),
      email: cleanEmail,
      otp_code: otpCode,
      purpose: 'PASSWORD_RESET',
      attempts: 0,
      resend_count: 0,
      last_sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      is_used: false,
      created_at: new Date().toISOString(),
    });
    dbStore.save();

    const dispatch = await sendOtpEmail(cleanEmail, otpCode, 'PASSWORD_RESET');
    console.log(`[REALTIME OTP] Password Reset OTP dispatched to ${cleanEmail}: ${otpCode}`);

    return res.json({
      success: true,
      message: `Password reset OTP has been sent in real-time to ${cleanEmail}.`,
      devOtp: otpCode,
      emailDelivery: {
        id: dispatch.id,
        recipient: dispatch.recipient,
        status: dispatch.status,
        mode: dispatch.deliveryMode,
        smtpConfigured: dispatch.smtpConfigured,
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = dbStore.db.otp_verifications
      .filter(o => o.email === cleanEmail && o.purpose === 'PASSWORD_RESET' && !o.is_used)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!pending) {
      return res.status(400).json({ success: false, message: 'No active password reset request found.' });
    }

    if (new Date(pending.expires_at) < new Date()) {
      pending.is_used = true;
      dbStore.save();
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new password reset.' });
    }

    if (pending.otp_code !== otpCode.trim()) {
      pending.attempts += 1;
      dbStore.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    pending.is_used = true;
    const user = dbStore.db.users.find(u => u.email === cleanEmail);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password_hash = hashPassword(newPassword);
    user.updated_at = new Date().toISOString();
    // Invalidate existing sessions
    dbStore.db.sessions = dbStore.db.sessions.filter(s => s.user_id !== user.id);
    dbStore.save();

    return res.json({
      success: true,
      message: 'Password reset successful. Please sign in with your new password.'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = (req as any).user;
  const session = (req as any).session;
  res.json({
    success: true,
    data: {
      userId: user.id,
      email: user.email,
      fullName: user.full_name,
      currency: user.currency,
      verified: user.is_verified,
      clientType: session.client_type,
    }
  });
});

// ---------------------------------------------------------------------------
// 2. ACCOUNTS API (PHASE 2)
// ---------------------------------------------------------------------------

app.get('/api/accounts', authenticate, (req, res) => {
  const user = (req as any).user;
  const accounts = dbStore.db.accounts.filter(a => a.user_id === user.id);
  res.json({ success: true, data: accounts });
});

app.post('/api/accounts', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { name, accountType, openingBalance = '0.00', currency = user.currency, accountNumber, institution } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Account name is required.' });
    }

    const validTypes = ['CHECKING', 'SAVINGS', 'CASH', 'CREDIT_CARD', 'INVESTMENT'];
    if (!validTypes.includes(accountType)) {
      return res.status(400).json({ success: false, message: 'Invalid account type.' });
    }

    const cleanOpening = (Math.round((parseFloat(openingBalance || '0') + Number.EPSILON) * 100) / 100).toFixed(2);
    const newAccount: AccountRecord = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: name.trim(),
      account_type: accountType,
      opening_balance: cleanOpening,
      current_balance: cleanOpening,
      currency: currency || user.currency || 'USD',
      account_number: accountNumber?.trim() || undefined,
      institution: institution?.trim() || undefined,
      is_reconciled: true,
      last_reconciled_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.db.accounts.push(newAccount);
    dbStore.save();

    res.json({ success: true, message: 'Account created successfully', data: newAccount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/accounts/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const account = dbStore.db.accounts.find(a => a.id === req.params.id && a.user_id === user.id);
  if (!account) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }

  const { name, accountType, currency, accountNumber, institution } = req.body;
  if (name) account.name = name.trim();
  if (accountType) account.account_type = accountType;
  if (currency) account.currency = currency;
  if (accountNumber !== undefined) account.account_number = accountNumber;
  if (institution !== undefined) account.institution = institution;
  account.updated_at = new Date().toISOString();

  dbStore.save();
  res.json({ success: true, message: 'Account updated successfully', data: account });
});

app.delete('/api/accounts/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const accountIndex = dbStore.db.accounts.findIndex(a => a.id === req.params.id && a.user_id === user.id);
  if (accountIndex === -1) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }

  // Check if account has transactions
  const hasTx = dbStore.db.transactions.some(t => t.user_id === user.id && (t.account_id === req.params.id || t.to_account_id === req.params.id));
  if (hasTx) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete account with existing transactions. Delete or reassign its transactions first.'
    });
  }

  dbStore.db.accounts.splice(accountIndex, 1);
  dbStore.save();
  res.json({ success: true, message: 'Account deleted successfully' });
});

app.post('/api/accounts/:id/reconcile', authenticate, (req, res) => {
  const user = (req as any).user;
  const account = dbStore.db.accounts.find(a => a.id === req.params.id && a.user_id === user.id);
  if (!account) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }

  account.is_reconciled = true;
  account.last_reconciled_at = new Date().toISOString();

  // Mark all transactions for this account as reconciled
  dbStore.db.transactions.forEach(t => {
    if (t.user_id === user.id && (t.account_id === account.id || t.to_account_id === account.id)) {
      t.is_reconciled = true;
    }
  });

  dbStore.save();
  res.json({ success: true, message: 'Account and associated transactions marked as reconciled.', data: account });
});

// ---------------------------------------------------------------------------
// 3. CATEGORIES API
// ---------------------------------------------------------------------------

app.get('/api/categories', authenticate, (req, res) => {
  const user = (req as any).user;
  // Return system categories plus user's custom categories
  const categories = dbStore.db.categories.filter(c => c.user_id === null || c.user_id === user.id);
  res.json({ success: true, data: categories });
});

app.post('/api/categories', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { name, type, classification = 'NONE', color = '#6366f1', icon = 'tag', monthlyLimit = '0.00' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }
    if (type !== 'INCOME' && type !== 'EXPENSE') {
      return res.status(400).json({ success: false, message: 'Type must be INCOME or EXPENSE.' });
    }

    const limitStr = (Math.round((parseFloat(monthlyLimit || '0') + Number.EPSILON) * 100) / 100).toFixed(2);
    const newCat: CategoryRecord = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: name.trim(),
      type,
      classification: ['NEED', 'WANT', 'SAVINGS', 'NONE'].includes(classification) ? classification : 'NONE',
      color,
      icon,
      monthly_limit: limitStr,
      is_default: false,
    };

    dbStore.db.categories.push(newCat);
    dbStore.save();
    res.json({ success: true, message: 'Category created', data: newCat });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/categories/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const cat = dbStore.db.categories.find(c => c.id === req.params.id && (c.user_id === user.id || c.user_id === null));
  if (!cat) {
    return res.status(404).json({ success: false, message: 'Category not found' });
  }

  const { name, classification, color, icon, monthlyLimit } = req.body;
  if (name) cat.name = name.trim();
  if (classification) cat.classification = classification;
  if (color) cat.color = color;
  if (icon) cat.icon = icon;
  if (monthlyLimit !== undefined) {
    cat.monthly_limit = (Math.round((parseFloat(monthlyLimit || '0') + Number.EPSILON) * 100) / 100).toFixed(2);
  }

  dbStore.save();
  res.json({ success: true, message: 'Category updated', data: cat });
});

app.delete('/api/categories/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const index = dbStore.db.categories.findIndex(c => c.id === req.params.id && c.user_id === user.id);
  if (index === -1) {
    return res.status(400).json({ success: false, message: 'Cannot delete default category or category does not exist.' });
  }

  dbStore.db.categories.splice(index, 1);
  dbStore.save();
  res.json({ success: true, message: 'Category deleted' });
});

// ---------------------------------------------------------------------------
// 4. TRANSACTIONS API (PHASE 2)
// ---------------------------------------------------------------------------

app.get('/api/transactions', authenticate, (req, res) => {
  const user = (req as any).user;
  const { type, accountId, categoryId, startDate, endDate, search } = req.query;

  let list = dbStore.db.transactions.filter(t => t.user_id === user.id);

  if (type) {
    list = list.filter(t => t.type === type);
  }
  if (accountId) {
    list = list.filter(t => t.account_id === accountId || t.to_account_id === accountId);
  }
  if (categoryId) {
    list = list.filter(t => t.category_id === categoryId);
  }
  if (startDate) {
    list = list.filter(t => t.transaction_date >= String(startDate));
  }
  if (endDate) {
    list = list.filter(t => t.transaction_date <= String(endDate));
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(t => (t.notes && t.notes.toLowerCase().includes(q)) || (t.payee && t.payee.toLowerCase().includes(q)));
  }

  // Sort by date desc
  list.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  res.json({ success: true, data: list });
});

app.post('/api/transactions', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { accountId, toAccountId, categoryId, type, amount, transactionDate, notes, payee } = req.body;

    if (!accountId) {
      return res.status(400).json({ success: false, message: 'Source account is required.' });
    }
    const validTypes = ['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction type.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero.' });
    }

    if (type === 'TRANSFER') {
      if (!toAccountId) {
        return res.status(400).json({ success: false, message: 'Destination account is required for transfers.' });
      }
      if (accountId === toAccountId) {
        return res.status(400).json({ success: false, message: 'Cannot transfer money to the same account.' });
      }
    }

    const dateVal = transactionDate || new Date().toISOString().split('T')[0];
    const cleanAmount = (Math.round((numAmount + Number.EPSILON) * 100) / 100).toFixed(2);

    const tx: TransactionRecord = {
      id: crypto.randomUUID(),
      user_id: user.id,
      account_id: accountId,
      to_account_id: type === 'TRANSFER' ? toAccountId : null,
      category_id: type === 'TRANSFER' ? null : (categoryId || null),
      type,
      amount: cleanAmount,
      transaction_date: dateVal,
      notes: notes?.trim() || '',
      payee: payee?.trim() || '',
      is_reconciled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.db.transactions.push(tx);

    // Recalculate affected account balances
    dbStore.recalculateAccountBalance(accountId, user.id);
    if (type === 'TRANSFER' && toAccountId) {
      dbStore.recalculateAccountBalance(toAccountId, user.id);
    }

    dbStore.save();
    res.json({ success: true, message: 'Transaction created successfully', data: tx });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/transactions/:id', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const tx = dbStore.db.transactions.find(t => t.id === req.params.id && t.user_id === user.id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const prevAccount = tx.account_id;
    const prevToAccount = tx.to_account_id;

    const { accountId, toAccountId, categoryId, type, amount, transactionDate, notes, payee, isReconciled } = req.body;

    if (type) tx.type = type;
    if (amount !== undefined) {
      const num = parseFloat(amount);
      if (isNaN(num) || num <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });
      tx.amount = (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
    }
    if (accountId) tx.account_id = accountId;
    if (toAccountId !== undefined) tx.to_account_id = tx.type === 'TRANSFER' ? toAccountId : null;
    if (categoryId !== undefined) tx.category_id = tx.type === 'TRANSFER' ? null : categoryId;
    if (transactionDate) tx.transaction_date = transactionDate;
    if (notes !== undefined) tx.notes = notes;
    if (payee !== undefined) tx.payee = payee;
    if (isReconciled !== undefined) tx.is_reconciled = Boolean(isReconciled);
    tx.updated_at = new Date().toISOString();

    // Recalculate all affected accounts
    dbStore.recalculateAccountBalance(prevAccount, user.id);
    if (prevToAccount) dbStore.recalculateAccountBalance(prevToAccount, user.id);
    if (tx.account_id !== prevAccount) dbStore.recalculateAccountBalance(tx.account_id, user.id);
    if (tx.to_account_id && tx.to_account_id !== prevToAccount) dbStore.recalculateAccountBalance(tx.to_account_id, user.id);

    dbStore.save();
    res.json({ success: true, message: 'Transaction updated successfully', data: tx });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/transactions/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const index = dbStore.db.transactions.findIndex(t => t.id === req.params.id && t.user_id === user.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Transaction not found' });
  }

  const tx = dbStore.db.transactions[index];
  const accId = tx.account_id;
  const toAccId = tx.to_account_id;

  dbStore.db.transactions.splice(index, 1);
  dbStore.recalculateAccountBalance(accId, user.id);
  if (toAccId) dbStore.recalculateAccountBalance(toAccId, user.id);

  dbStore.save();
  res.json({ success: true, message: 'Transaction deleted' });
});

// CSV Export
app.get('/api/transactions/export-csv', authenticate, (req, res) => {
  const user = (req as any).user;
  const txs = dbStore.db.transactions.filter(t => t.user_id === user.id);
  const accounts = new Map(dbStore.db.accounts.map(a => [a.id, a.name]));
  const categories = new Map(dbStore.db.categories.map(c => [c.id, c.name]));

  let csv = 'ID,Date,Type,Amount,Currency,Account,To Account,Category,Payee,Notes,Reconciled\n';
  for (const t of txs) {
    const accName = accounts.get(t.account_id) || t.account_id;
    const toAccName = t.to_account_id ? (accounts.get(t.to_account_id) || t.to_account_id) : '';
    const catName = t.category_id ? (categories.get(t.category_id) || t.category_id) : '';
    const cleanNotes = (t.notes || '').replace(/"/g, '""');
    const cleanPayee = (t.payee || '').replace(/"/g, '""');
    csv += `"${t.id}","${t.transaction_date}","${t.type}","${t.amount}","${user.currency}","${accName}","${toAccName}","${catName}","${cleanPayee}","${cleanNotes}","${t.is_reconciled}"\n`;
  }

  res.header('Content-Type', 'text/csv');
  res.attachment(`pocketpilot_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

// CSV Import
app.post('/api/transactions/import-csv', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { csvData, defaultAccountId } = req.body;
    if (!csvData) {
      return res.status(400).json({ success: false, message: 'CSV data is required.' });
    }

    const targetAccount = dbStore.db.accounts.find(a => a.id === defaultAccountId && a.user_id === user.id) ||
      dbStore.db.accounts.find(a => a.user_id === user.id);

    if (!targetAccount) {
      return res.status(400).json({ success: false, message: 'Please create at least one account before importing transactions.' });
    }

    const lines = csvData.trim().split('\n');
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Simple parse handling quotes
      const parts = line.split(',').map((s: string) => s.replace(/^"|"$/g, '').trim());
      if (parts.length >= 3) {
        const dateVal = parts[1] || parts[0];
        const typeCandidate = parts[2] ? parts[2].toUpperCase() : 'EXPENSE';
        const type = ['INCOME', 'EXPENSE', 'TRANSFER', 'REFUND'].includes(typeCandidate) ? typeCandidate : 'EXPENSE';
        const amt = parseFloat(parts[3] || parts[1] || '0');
        if (isNaN(amt) || amt <= 0) continue;

        const newTx: TransactionRecord = {
          id: crypto.randomUUID(),
          user_id: user.id,
          account_id: targetAccount.id,
          type: type as any,
          amount: (Math.round((amt + Number.EPSILON) * 100) / 100).toFixed(2),
          transaction_date: dateVal.match(/^\d{4}-\d{2}-\d{2}$/) ? dateVal : new Date().toISOString().split('T')[0],
          payee: parts[8] || parts[4] || '',
          notes: parts[9] || 'Imported via CSV',
          is_reconciled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        dbStore.db.transactions.push(newTx);
        importedCount++;
      }
    }

    dbStore.recalculateAccountBalance(targetAccount.id, user.id);
    dbStore.save();

    res.json({ success: true, message: `Successfully imported ${importedCount} transactions.`, importedCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------------------------------------
// 5. BUDGETS & SAVINGS GOALS (PHASE 3)
// ---------------------------------------------------------------------------

app.get('/api/budgets/current', authenticate, (req, res) => {
  const user = (req as any).user;
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  let budget = dbStore.db.monthly_budgets.find(b => b.user_id === user.id && b.month_year === currentMonth);
  if (!budget) {
    budget = {
      id: crypto.randomUUID(),
      user_id: user.id,
      month_year: currentMonth,
      monthly_income_target: '3000.00',
      needs_percentage: 50,
      wants_percentage: 30,
      savings_percentage: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.db.monthly_budgets.push(budget);
    dbStore.save();
  }
  res.json({ success: true, data: budget });
});

app.post('/api/budgets', authenticate, (req, res) => {
  const user = (req as any).user;
  const { monthYear, monthlyIncomeTarget, needsPercentage, wantsPercentage, savingsPercentage, notes } = req.body;
  const month = monthYear || new Date().toISOString().slice(0, 7);

  let budget = dbStore.db.monthly_budgets.find(b => b.user_id === user.id && b.month_year === month);
  if (!budget) {
    budget = {
      id: crypto.randomUUID(),
      user_id: user.id,
      month_year: month,
      monthly_income_target: '0.00',
      needs_percentage: 50,
      wants_percentage: 30,
      savings_percentage: 20,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.db.monthly_budgets.push(budget);
  }

  if (monthlyIncomeTarget !== undefined) {
    budget.monthly_income_target = (Math.round((parseFloat(monthlyIncomeTarget || '0') + Number.EPSILON) * 100) / 100).toFixed(2);
  }
  if (needsPercentage !== undefined) budget.needs_percentage = Number(needsPercentage);
  if (wantsPercentage !== undefined) budget.wants_percentage = Number(wantsPercentage);
  if (savingsPercentage !== undefined) budget.savings_percentage = Number(savingsPercentage);
  if (notes !== undefined) budget.notes = notes;
  budget.updated_at = new Date().toISOString();

  dbStore.save();
  res.json({ success: true, message: 'Budget updated successfully', data: budget });
});

// Savings Goals
app.get('/api/goals', authenticate, (req, res) => {
  const user = (req as any).user;
  const goals = dbStore.db.savings_goals.filter(g => g.user_id === user.id);
  res.json({ success: true, data: goals });
});

app.post('/api/goals', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { name, targetAmount, currentAmount = '0.00', targetDate, category = 'GENERAL', notes } = req.body;
    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ success: false, message: 'Name, target amount and target date are required.' });
    }

    const goal = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: name.trim(),
      target_amount: (Math.round((parseFloat(targetAmount) + Number.EPSILON) * 100) / 100).toFixed(2),
      current_amount: (Math.round((parseFloat(currentAmount || '0') + Number.EPSILON) * 100) / 100).toFixed(2),
      target_date: targetDate,
      category,
      notes: notes || '',
      is_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.db.savings_goals.push(goal);
    dbStore.save();
    res.json({ success: true, message: 'Savings goal created', data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/goals/:id/contribute', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const goal = dbStore.db.savings_goals.find(g => g.id === req.params.id && g.user_id === user.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const { amount, accountId, notes } = req.body;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return res.status(400).json({ success: false, message: 'Valid contribution amount required' });

    const cleanAmt = (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
    const curr = parseFloat(goal.current_amount || '0');
    goal.current_amount = (Math.round((curr + num + Number.EPSILON) * 100) / 100).toFixed(2);
    if (parseFloat(goal.current_amount) >= parseFloat(goal.target_amount)) {
      goal.is_completed = true;
    }
    goal.updated_at = new Date().toISOString();

    dbStore.db.goal_contributions.push({
      id: crypto.randomUUID(),
      goal_id: goal.id,
      user_id: user.id,
      account_id: accountId || null,
      amount: cleanAmt,
      contribution_date: new Date().toISOString().split('T')[0],
      notes: notes || 'Contribution to ' + goal.name,
      created_at: new Date().toISOString(),
    });

    dbStore.save();
    res.json({ success: true, message: 'Contribution recorded successfully', data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------------------------------------
// 6. FINANCIAL MANAGEMENT: BILLS, INVESTMENTS, ASSETS, LIABILITIES (PHASE 4)
// ---------------------------------------------------------------------------

// Bills & Subscriptions
app.get('/api/bills', authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, data: dbStore.db.bills_subscriptions.filter(b => b.user_id === user.id) });
});

app.post('/api/bills', authenticate, (req, res) => {
  const user = (req as any).user;
  const { name, amount, billingCycle = 'MONTHLY', dueDay = 1, categoryId, accountId, isAutopay = false, nextDueDate } = req.body;
  if (!name || !amount) return res.status(400).json({ success: false, message: 'Name and amount required' });

  const bill = {
    id: crypto.randomUUID(),
    user_id: user.id,
    name: name.trim(),
    amount: (Math.round((parseFloat(amount) + Number.EPSILON) * 100) / 100).toFixed(2),
    billing_cycle: billingCycle,
    due_day: Number(dueDay),
    category_id: categoryId || null,
    account_id: accountId || null,
    is_autopay: Boolean(isAutopay),
    is_active: true,
    next_due_date: nextDueDate || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.db.bills_subscriptions.push(bill);
  dbStore.save();
  res.json({ success: true, message: 'Bill added', data: bill });
});

app.delete('/api/bills/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const idx = dbStore.db.bills_subscriptions.findIndex(b => b.id === req.params.id && b.user_id === user.id);
  if (idx !== -1) {
    dbStore.db.bills_subscriptions.splice(idx, 1);
    dbStore.save();
  }
  res.json({ success: true, message: 'Bill removed' });
});

// Investments (SIPs, FDs, etc.)
app.get('/api/investments', authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, data: dbStore.db.investments.filter(i => i.user_id === user.id) });
});

app.post('/api/investments', authenticate, (req, res) => {
  const user = (req as any).user;
  const { investmentType, name, investedAmount, currentValue, annualRatePercent, startDate, maturityDate, sipMonthlyAmount, notes } = req.body;
  if (!name || !investedAmount) return res.status(400).json({ success: false, message: 'Name and invested amount required' });

  const inv = {
    id: crypto.randomUUID(),
    user_id: user.id,
    investment_type: investmentType || 'MUTUAL_FUND_SIP',
    name: name.trim(),
    invested_amount: (Math.round((parseFloat(investedAmount) + Number.EPSILON) * 100) / 100).toFixed(2),
    current_value: (Math.round((parseFloat(currentValue || investedAmount) + Number.EPSILON) * 100) / 100).toFixed(2),
    annual_rate_percent: annualRatePercent ? String(annualRatePercent) : '12.00',
    start_date: startDate || new Date().toISOString().split('T')[0],
    maturity_date: maturityDate || null,
    sip_monthly_amount: sipMonthlyAmount ? (Math.round((parseFloat(sipMonthlyAmount) + Number.EPSILON) * 100) / 100).toFixed(2) : null,
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.db.investments.push(inv);
  dbStore.save();
  res.json({ success: true, message: 'Investment added', data: inv });
});

app.delete('/api/investments/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const idx = dbStore.db.investments.findIndex(i => i.id === req.params.id && i.user_id === user.id);
  if (idx !== -1) {
    dbStore.db.investments.splice(idx, 1);
    dbStore.save();
  }
  res.json({ success: true, message: 'Investment removed' });
});

// Assets & Liabilities
app.get('/api/assets-liabilities', authenticate, (req, res) => {
  const user = (req as any).user;
  res.json({ success: true, data: dbStore.db.assets_liabilities.filter(a => a.user_id === user.id) });
});

app.post('/api/assets-liabilities', authenticate, (req, res) => {
  const user = (req as any).user;
  const { recordType, category, name, valuationAmount, interestRate, monthlyEmi, notes } = req.body;
  if (!name || !valuationAmount || !recordType) return res.status(400).json({ success: false, message: 'Record type, name and amount required' });

  const record = {
    id: crypto.randomUUID(),
    user_id: user.id,
    record_type: recordType,
    category: category || 'OTHER',
    name: name.trim(),
    valuation_amount: (Math.round((parseFloat(valuationAmount) + Number.EPSILON) * 100) / 100).toFixed(2),
    interest_rate: interestRate ? String(interestRate) : null,
    monthly_emi: monthlyEmi ? (Math.round((parseFloat(monthlyEmi) + Number.EPSILON) * 100) / 100).toFixed(2) : null,
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.db.assets_liabilities.push(record);
  dbStore.save();
  res.json({ success: true, message: `${recordType === 'ASSET' ? 'Asset' : 'Liability'} saved`, data: record });
});

app.delete('/api/assets-liabilities/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const idx = dbStore.db.assets_liabilities.findIndex(a => a.id === req.params.id && a.user_id === user.id);
  if (idx !== -1) {
    dbStore.db.assets_liabilities.splice(idx, 1);
    dbStore.save();
  }
  res.json({ success: true, message: 'Record removed' });
});

// ---------------------------------------------------------------------------
// 7. SUMMARY & FINANCIAL INSIGHTS API
// ---------------------------------------------------------------------------

app.get('/api/analytics/summary', authenticate, (req, res) => {
  const user = (req as any).user;
  const accounts = dbStore.db.accounts.filter(a => a.user_id === user.id);
  const txs = dbStore.db.transactions.filter(t => t.user_id === user.id);
  const investments = dbStore.db.investments.filter(i => i.user_id === user.id);
  const assetsLiabilities = dbStore.db.assets_liabilities.filter(a => a.user_id === user.id);
  const goals = dbStore.db.savings_goals.filter(g => g.user_id === user.id);

  // Accounts total (Assets: Checking, Savings, Cash; Liabilities: Credit Card debt)
  let totalCashBank = 0;
  let creditCardDebt = 0;
  for (const acc of accounts) {
    const bal = parseFloat(acc.current_balance || '0');
    if (acc.account_type === 'CREDIT_CARD') {
      if (bal < 0) creditCardDebt += Math.abs(bal);
      else creditCardDebt += bal; // Outstanding balance
    } else {
      totalCashBank += bal;
    }
  }

  // Total Income, Expense, Refunds this month
  const currentMonth = new Date().toISOString().slice(0, 7);
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let monthlyTransfers = 0;
  let totalIncomeAllTime = 0;
  let totalExpenseAllTime = 0;

  for (const t of txs) {
    const amt = parseFloat(t.amount || '0');
    const isThisMonth = t.transaction_date.startsWith(currentMonth);

    if (t.type === 'INCOME') {
      totalIncomeAllTime += amt;
      if (isThisMonth) monthlyIncome += amt;
    } else if (t.type === 'EXPENSE') {
      totalExpenseAllTime += amt;
      if (isThisMonth) monthlyExpense += amt;
    } else if (t.type === 'REFUND') {
      totalExpenseAllTime -= amt; // Refund offsets expenses
      if (isThisMonth) monthlyExpense -= amt;
    } else if (t.type === 'TRANSFER') {
      if (isThisMonth) monthlyTransfers += amt;
    }
  }

  // Investments total
  let totalInvested = 0;
  let totalCurrentInvestmentValue = 0;
  for (const inv of investments) {
    totalInvested += parseFloat(inv.invested_amount || '0');
    totalCurrentInvestmentValue += parseFloat(inv.current_value || '0');
  }

  // Assets & Liabilities
  let totalPhysicalAssets = 0;
  let totalLoansLiabilities = 0;
  for (const item of assetsLiabilities) {
    const val = parseFloat(item.valuation_amount || '0');
    if (item.record_type === 'ASSET') {
      totalPhysicalAssets += val;
    } else {
      totalLoansLiabilities += val;
    }
  }

  // Net Worth Formula:
  // (Cash/Bank + Investment Current Value + Physical Assets) - (Credit Card Debts + Loans)
  const totalAssets = totalCashBank + totalCurrentInvestmentValue + totalPhysicalAssets;
  const totalLiabilities = creditCardDebt + totalLoansLiabilities;
  const netWorth = totalAssets - totalLiabilities;

  // Goals progress
  let totalGoalTarget = 0;
  let totalGoalSaved = 0;
  for (const g of goals) {
    totalGoalTarget += parseFloat(g.target_amount || '0');
    totalGoalSaved += parseFloat(g.current_amount || '0');
  }

  res.json({
    success: true,
    data: {
      currency: user.currency || 'USD',
      currentMonth,
      netWorth: (Math.round((netWorth + Number.EPSILON) * 100) / 100).toFixed(2),
      totalAssets: (Math.round((totalAssets + Number.EPSILON) * 100) / 100).toFixed(2),
      totalLiabilities: (Math.round((totalLiabilities + Number.EPSILON) * 100) / 100).toFixed(2),
      cashAndBank: (Math.round((totalCashBank + Number.EPSILON) * 100) / 100).toFixed(2),
      creditCardDebt: (Math.round((creditCardDebt + Number.EPSILON) * 100) / 100).toFixed(2),
      investmentsValue: (Math.round((totalCurrentInvestmentValue + Number.EPSILON) * 100) / 100).toFixed(2),
      investmentsPrincipal: (Math.round((totalInvested + Number.EPSILON) * 100) / 100).toFixed(2),
      physicalAssets: (Math.round((totalPhysicalAssets + Number.EPSILON) * 100) / 100).toFixed(2),
      loansAndLiabilities: (Math.round((totalLoansLiabilities + Number.EPSILON) * 100) / 100).toFixed(2),
      monthlyIncome: (Math.round((monthlyIncome + Number.EPSILON) * 100) / 100).toFixed(2),
      monthlyExpense: (Math.round((monthlyExpense + Number.EPSILON) * 100) / 100).toFixed(2),
      monthlySavings: (Math.round((monthlyIncome - monthlyExpense + Number.EPSILON) * 100) / 100).toFixed(2),
      monthlyTransfers: (Math.round((monthlyTransfers + Number.EPSILON) * 100) / 100).toFixed(2),
      savingsRate: monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100)) : 0,
      totalGoalTarget: (Math.round((totalGoalTarget + Number.EPSILON) * 100) / 100).toFixed(2),
      totalGoalSaved: (Math.round((totalGoalSaved + Number.EPSILON) * 100) / 100).toFixed(2),
      totalAccountsCount: accounts.length,
      totalTransactionsCount: txs.length,
    }
  });
});

// ---------------------------------------------------------------------------
// 8. LINKED BANK ACCOUNTS, UPI & AUTO-GROWTH INVESTMENTS
// ---------------------------------------------------------------------------

app.get('/api/linked', authenticate, (req, res) => {
  const user = (req as any).user;
  const linked = dbStore.db.linked_providers.filter(l => l.user_id === user.id);
  res.json({ success: true, data: linked });
});

// Link Bank Account
app.post('/api/linked/bank', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { bankName, accountNumber, ifscOrRouting, accountType = 'SAVINGS', openingBalance = '10000.00' } = req.body;
    if (!bankName || !accountNumber) {
      return res.status(400).json({ success: false, message: 'Bank name and account number are required' });
    }

    // Create or link Account in accounts collection
    const cleanBalance = (Math.round((parseFloat(openingBalance || '0') + Number.EPSILON) * 100) / 100).toFixed(2);
    const newAccount: AccountRecord = {
      id: crypto.randomUUID(),
      user_id: user.id,
      name: `${bankName} (${accountNumber.slice(-4)})`,
      account_type: accountType as any,
      opening_balance: cleanBalance,
      current_balance: cleanBalance,
      currency: user.currency || 'INR',
      account_number: `•••• ${accountNumber.slice(-4)}`,
      institution: bankName,
      is_reconciled: true,
      last_reconciled_at: new Date().toISOString(),
      is_linked: true,
      linked_provider: bankName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.db.accounts.push(newAccount);

    const linkedProvider = {
      id: crypto.randomUUID(),
      user_id: user.id,
      item_type: 'BANK' as const,
      provider_name: bankName,
      identifier: `A/C •••• ${accountNumber.slice(-4)} (IFSC: ${ifscOrRouting || 'HDFC0001234'})`,
      linked_account_id: newAccount.id,
      status: 'ACTIVE' as const,
      auto_growth_enabled: true,
      growth_rate_percent: '3.5', // 3.5% p.a. savings interest
      last_synced_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.db.linked_providers.push(linkedProvider);

    dbStore.db.sync_audit_logs.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      client_type: 'WEB',
      action: 'BANK_ACCOUNT_LINKED',
      details: `Successfully linked ${bankName} account ending in ${accountNumber.slice(-4)} with auto-interest accrual enabled`,
      timestamp: new Date().toISOString(),
    });

    dbStore.save();
    res.json({ success: true, message: `Linked ${bankName} account successfully!`, data: linkedProvider, account: newAccount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Link UPI ID
app.post('/api/linked/upi', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { upiId, upiApp = 'Google Pay', linkedAccountId } = req.body;
    if (!upiId || !upiId.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid UPI ID (e.g. user@okhdfcbank, user@ybl) required' });
    }

    const linkedProvider = {
      id: crypto.randomUUID(),
      user_id: user.id,
      item_type: 'UPI' as const,
      provider_name: `${upiApp} (${upiId})`,
      identifier: upiId.trim(),
      linked_account_id: linkedAccountId || null,
      status: 'ACTIVE' as const,
      auto_growth_enabled: false,
      last_synced_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.db.linked_providers.push(linkedProvider);

    dbStore.db.sync_audit_logs.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      client_type: 'WEB',
      action: 'UPI_LINKED',
      details: `Linked UPI VPA ${upiId} via ${upiApp}`,
      timestamp: new Date().toISOString(),
    });

    dbStore.save();
    res.json({ success: true, message: `UPI ID ${upiId} linked successfully!`, data: linkedProvider });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Link Investment Portfolio
app.post('/api/linked/investments', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { providerName = 'Zerodha Coin / Groww', folioOrPan, portfolioType = 'MUTUAL_FUND_SIP', initialInvested = '25000.00', expectedCagr = '12.5' } = req.body;

    const investedStr = (Math.round((parseFloat(initialInvested || '0') + Number.EPSILON) * 100) / 100).toFixed(2);
    // Create Investment record
    const newInv: InvestmentRecord = {
      id: crypto.randomUUID(),
      user_id: user.id,
      investment_type: portfolioType,
      name: `${providerName} Portfolio (${folioOrPan ? folioOrPan.slice(-4) : 'Direct'})`,
      invested_amount: investedStr,
      current_value: investedStr,
      annual_rate_percent: expectedCagr,
      start_date: new Date().toISOString().split('T')[0],
      is_linked: true,
      linked_provider: providerName,
      auto_growth_enabled: true,
      notes: `Auto-updating investment portfolio linked via ${providerName}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.db.investments.push(newInv);

    const linkedProvider = {
      id: crypto.randomUUID(),
      user_id: user.id,
      item_type: 'INVESTMENT' as const,
      provider_name: providerName,
      identifier: `Folio / Demat: ${folioOrPan || 'ZERODHA-IN-4892'}`,
      linked_investment_id: newInv.id,
      status: 'ACTIVE' as const,
      auto_growth_enabled: true,
      growth_rate_percent: expectedCagr,
      last_synced_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dbStore.db.linked_providers.push(linkedProvider);

    dbStore.db.sync_audit_logs.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      client_type: 'WEB',
      action: 'INVESTMENT_LINKED',
      details: `Linked investment portfolio with ${providerName} (CAGR: ${expectedCagr}% p.a.)`,
      timestamp: new Date().toISOString(),
    });

    dbStore.save();
    res.json({ success: true, message: `Investment portfolio linked successfully!`, data: linkedProvider, investment: newInv });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Simulate Live UPI Transaction
app.post('/api/linked/simulate-upi-payment', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { upiId, type = 'EXPENSE', amount, merchantOrPayer = 'Local Store / Merchant', notes } = req.body;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount required' });
    }

    const linkedUpi = dbStore.db.linked_providers.find(l => l.user_id === user.id && l.item_type === 'UPI' && (l.identifier === upiId || l.id === upiId));
    const targetAccountId = linkedUpi?.linked_account_id || dbStore.db.accounts.find(a => a.user_id === user.id)?.id;

    if (!targetAccountId) {
      return res.status(400).json({ success: false, message: 'No linked bank account found for this UPI ID.' });
    }

    const cleanAmount = (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
    const newTx: TransactionRecord = {
      id: crypto.randomUUID(),
      user_id: user.id,
      account_id: targetAccountId,
      type: type as any,
      amount: cleanAmount,
      transaction_date: new Date().toISOString().split('T')[0],
      notes: notes || `UPI Payment via ${linkedUpi?.identifier || 'UPI'} - ${merchantOrPayer}`,
      payee: merchantOrPayer,
      is_reconciled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.db.transactions.push(newTx);
    dbStore.recalculateAccountBalance(targetAccountId, user.id);

    dbStore.db.sync_audit_logs.push({
      id: crypto.randomUUID(),
      user_id: user.id,
      client_type: 'WEB',
      action: 'UPI_TRANSACTION_AUTO_PROCESSED',
      details: `UPI ${type}: ${cleanAmount} ${user.currency} with ${merchantOrPayer} via ${linkedUpi?.identifier || 'UPI'}`,
      timestamp: new Date().toISOString(),
    });

    dbStore.save();
    res.json({ success: true, message: `UPI ${type.toLowerCase()} of ${cleanAmount} processed and account balance updated!`, transaction: newTx });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Trigger Auto-Growth Engine
app.post('/api/linked/auto-growth', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const { simulateMonths = 1 } = req.body;
    const result = dbStore.runAutoGrowth(user.id, Number(simulateMonths) || 1);
    res.json({
      success: true,
      message: `Auto-growth executed for ${simulateMonths} month(s). Accrued: +${result.totalYieldAccrued} ${user.currency}`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/linked/:id', authenticate, (req, res) => {
  const user = (req as any).user;
  const idx = dbStore.db.linked_providers.findIndex(l => l.id === req.params.id && l.user_id === user.id);
  if (idx !== -1) {
    dbStore.db.linked_providers.splice(idx, 1);
    dbStore.save();
  }
  res.json({ success: true, message: 'Provider unlinked' });
});

// ---------------------------------------------------------------------------
// 9. DESKTOP CLIENT LIVE SYNC API & LOGS
// ---------------------------------------------------------------------------

app.get('/api/sync/logs', authenticate, (req, res) => {
  const user = (req as any).user;
  const logs = dbStore.db.sync_audit_logs
    .filter(l => l.user_id === user.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30);
  res.json({ success: true, data: logs });
});

app.post('/api/sync/trigger', authenticate, (req, res) => {
  const user = (req as any).user;
  const { clientType = 'DESKTOP_JAVAFX', action = 'MANUAL_SYNC' } = req.body;

  const logEntry = {
    id: crypto.randomUUID(),
    user_id: user.id,
    client_type: clientType,
    action,
    details: `Synchronized ${dbStore.db.accounts.filter(a => a.user_id === user.id).length} accounts & ${dbStore.db.transactions.filter(t => t.user_id === user.id).length} transactions from shared database`,
    timestamp: new Date().toISOString(),
  };

  dbStore.db.sync_audit_logs.push(logEntry);
  dbStore.save();

  res.json({ success: true, message: 'Database synchronization completed', log: logEntry });
});

// ---------------------------------------------------------------------------
// DEV & PRODUCTION SERVER SETUP
// ---------------------------------------------------------------------------

async function startServer() {
  const port = parseInt(process.env.PORT || '3000', 10);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PocketPilot Full-Stack server running at http://0.0.0.0:${port}`);
  });
}

startServer();
