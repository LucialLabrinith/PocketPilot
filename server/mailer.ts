import nodemailer from 'nodemailer';

export interface EmailDispatchRecord {
  id: string;
  recipient: string;
  subject: string;
  otpCode: string;
  purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN';
  htmlBody: string;
  textBody: string;
  sentAt: string;
  expiresAt: string;
  status: 'DELIVERED' | 'DISPATCHED_SIMULATOR' | 'FAILED';
  deliveryMode: 'GMAIL_SMTP' | 'CUSTOM_SMTP' | 'REALTIME_SIMULATOR';
  messageId?: string;
  smtpConfigured: boolean;
  error?: string;
  smtpNotice?: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

// In-memory store for active SMTP settings (loaded from process.env or configured dynamically)
let activeSmtpSettings: SmtpSettings = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_SECURE === 'true' || (process.env.SMTP_PORT ? process.env.SMTP_PORT === '465' : true),
  user: process.env.GMAIL_USER || process.env.SMTP_USER || '',
  pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '',
  fromEmail: process.env.SMTP_FROM || process.env.GMAIL_USER || 'security@pocketpilot.app',
  fromName: process.env.SMTP_FROM_NAME || 'PocketPilot Security',
};

let lastSmtpError: string | null = null;
let smtpAuthFailed = false;

// Memory queue of dispatched emails for instant audit and live preview
const emailDispatchQueue: EmailDispatchRecord[] = [];

export function getSmtpStatus() {
  const isGmail = activeSmtpSettings.host.includes('gmail');
  const cleanPass = (activeSmtpSettings.pass || '').replace(/\s+/g, '');
  // Google requires a 16-character App Password (not normal account password)
  const isLikelyValidAppPassword = !isGmail || cleanPass.length === 16;
  const isConfigured = Boolean(activeSmtpSettings.user && activeSmtpSettings.pass && !smtpAuthFailed && isLikelyValidAppPassword);

  return {
    isConfigured,
    smtpAuthFailed,
    host: activeSmtpSettings.host,
    port: activeSmtpSettings.port,
    secure: activeSmtpSettings.secure,
    user: activeSmtpSettings.user ? activeSmtpSettings.user.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '',
    fromEmail: activeSmtpSettings.fromEmail,
    fromName: activeSmtpSettings.fromName,
    lastError: lastSmtpError,
    queueCount: emailDispatchQueue.length,
    appPasswordHelp: isGmail && !isLikelyValidAppPassword
      ? 'Google SMTP requires a 16-character App Password (from myaccount.google.com/apppasswords), not your regular password.'
      : null,
  };
}

export function updateSmtpSettings(settings: Partial<SmtpSettings>) {
  activeSmtpSettings = {
    ...activeSmtpSettings,
    ...settings,
  };
  // Reset failure flag when settings are updated
  smtpAuthFailed = false;
  lastSmtpError = null;
  return getSmtpStatus();
}

export function getDispatchedEmails(emailFilter?: string): EmailDispatchRecord[] {
  if (emailFilter) {
    const clean = emailFilter.trim().toLowerCase();
    return emailDispatchQueue.filter(item => item.recipient.toLowerCase() === clean);
  }
  return [...emailDispatchQueue].reverse().slice(0, 30);
}

export function getLatestEmailFor(email: string): EmailDispatchRecord | undefined {
  const clean = email.trim().toLowerCase();
  return emailDispatchQueue.slice().reverse().find(item => item.recipient.toLowerCase() === clean);
}

function buildHtmlTemplate(recipient: string, otpCode: string, purpose: string, expiresMinutes: number = 10): string {
  const purposeTitle =
    purpose === 'PASSWORD_RESET'
      ? 'Password Reset Request'
      : purpose === 'LOGIN'
      ? 'Secure Login Code'
      : 'Email Verification Code';

  const currentTime = new Date().toUTCString();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketPilot One-Time Passcode</title>
</head>
<body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #090d16; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 540px; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px 32px; background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%); text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; font-weight: 900; font-size: 20px; color: #ffffff; margin-bottom: 8px;">PP</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">PocketPilot</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #e0e7ff; font-weight: 500;">Free-First Personal Finance Platform</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #ffffff;">${purposeTitle}</h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 22px; color: #94a3b8;">
                We received a request to verify your Gmail address (<strong style="color: #38bdf8;">${recipient}</strong>) for access to PocketPilot. Use the real-time one-time password below to continue:
              </p>

              <!-- OTP Code Display -->
              <div style="background-color: #020617; border: 2px dashed #0284c7; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; margin-bottom: 8px;">Your 6-Digit Verification Code</div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #38bdf8; text-shadow: 0 0 20px rgba(56, 189, 248, 0.4);">${otpCode}</div>
                <div style="margin-top: 10px; font-size: 12px; color: #64748b;">Valid for <strong>${expiresMinutes} minutes</strong> from issuance</div>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #1e293b; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 12px; line-height: 18px; color: #cbd5e1;">
                  <strong style="color: #fbbf24;">Security Warning:</strong> Never share this code with anyone. PocketPilot administrators will never ask for your code or password.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; font-size: 13px; line-height: 20px; color: #64748b;">
                If you did not request this OTP, please ignore this email or review your account credentials.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; text-align: center; font-size: 11px; color: #64748b;">
              <p style="margin: 0 0 4px 0;">Dispatched in real-time at ${currentTime}</p>
              <p style="margin: 0;">PocketPilot Personal Finance &copy; ${new Date().getFullYear()} • Automated Security Service</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildTextTemplate(recipient: string, otpCode: string, purpose: string): string {
  return `
POCKETPILOT - ONE-TIME PASSCODE (OTP)
=====================================
Recipient: ${recipient}
Purpose: ${purpose}

Your 6-digit verification code is: ${otpCode}

This code will expire in 10 minutes.
If you did not initiate this request, you can safely ignore this email.

--
PocketPilot Automated Security Dispatcher
https://pocketpilot.app
`.trim();
}

export async function sendOtpEmail(
  recipient: string,
  otpCode: string,
  purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN' = 'REGISTRATION'
): Promise<EmailDispatchRecord> {
  const cleanEmail = recipient.trim().toLowerCase();
  const subject = `🔐 PocketPilot Verification Code: ${otpCode}`;
  const htmlBody = buildHtmlTemplate(cleanEmail, otpCode, purpose);
  const textBody = buildTextTemplate(cleanEmail, otpCode, purpose);
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const dispatchId = 'mail_' + Math.random().toString(36).substring(2, 10);

  const isGmail = activeSmtpSettings.host.includes('gmail');
  const cleanPass = (activeSmtpSettings.pass || '').replace(/\s+/g, '');
  // Google App Passwords must be 16 characters (standard account passwords are rejected with 535)
  const isLikelyValidAppPassword = !isGmail || cleanPass.length === 16;
  const isSmtpReady = Boolean(activeSmtpSettings.user && activeSmtpSettings.pass && !smtpAuthFailed && isLikelyValidAppPassword);

  let dispatchRecord: EmailDispatchRecord = {
    id: dispatchId,
    recipient: cleanEmail,
    subject,
    otpCode,
    purpose,
    htmlBody,
    textBody,
    sentAt: now,
    expiresAt,
    status: isSmtpReady ? 'DELIVERED' : 'DISPATCHED_SIMULATOR',
    deliveryMode: isSmtpReady
      ? (isGmail ? 'GMAIL_SMTP' : 'CUSTOM_SMTP')
      : 'REALTIME_SIMULATOR',
    smtpConfigured: isSmtpReady,
    smtpNotice: isGmail && !isLikelyValidAppPassword
      ? 'Google requires a 16-character App Password (myaccount.google.com/apppasswords). Code is ready in in-app dispatcher.'
      : undefined,
  };

  if (isSmtpReady) {
    try {
      const transporter = nodemailer.createTransport({
        host: activeSmtpSettings.host,
        port: activeSmtpSettings.port,
        secure: activeSmtpSettings.secure,
        auth: {
          user: activeSmtpSettings.user,
          pass: cleanPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${activeSmtpSettings.fromName}" <${activeSmtpSettings.fromEmail}>`,
        to: cleanEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });

      dispatchRecord.messageId = info.messageId;
      dispatchRecord.status = 'DELIVERED';
      console.log(`[SMTP SUCCESS] Real OTP email delivered to ${cleanEmail} via ${activeSmtpSettings.host}. Message ID: ${info.messageId}`);
    } catch (err: any) {
      const msg = err.message || '';
      console.warn(`[SMTP NOTICE] Could not deliver via SMTP to ${cleanEmail}: ${msg}. Falling back to in-app real-time dispatcher.`);
      if (msg.includes('535') || msg.includes('Username and Password not accepted') || msg.includes('BadCredentials')) {
        smtpAuthFailed = true;
        lastSmtpError = 'Google rejected login credentials. Please ensure 2-Step Verification is enabled and use a 16-character Google App Password.';
      } else {
        lastSmtpError = msg;
      }
      dispatchRecord.status = 'DISPATCHED_SIMULATOR';
      dispatchRecord.deliveryMode = 'REALTIME_SIMULATOR';
      dispatchRecord.smtpConfigured = false;
      dispatchRecord.error = lastSmtpError || undefined;
    }
  } else {
    console.log(`[REALTIME DISPATCH] Real-time OTP active for ${cleanEmail}: ${otpCode}. Delivered to in-app verifier.`);
  }

  // Push to circular in-memory store
  emailDispatchQueue.push(dispatchRecord);
  if (emailDispatchQueue.length > 50) {
    emailDispatchQueue.shift();
  }

  return dispatchRecord;
}
