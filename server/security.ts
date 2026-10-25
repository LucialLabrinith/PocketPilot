import crypto from 'crypto';

// Master key derived from environment or stable high-entropy salt
const MASTER_SECRET = process.env.POCKETPILOT_ENCRYPTION_KEY || 'pocketpilot-aes256-gcm-master-vault-key-2026';
const KEY = crypto.createHash('sha256').update(MASTER_SECRET).digest();
const HMAC_KEY = crypto.createHash('sha256').update(MASTER_SECRET + '-hmac-integrity').digest();

/**
 * Encrypt sensitive financial fields (account numbers, routing, IFSC) using AES-256-GCM
 */
export function encryptFinancialData(plaintext: string): string {
  if (!plaintext) return '';
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: v1:iv_hex:tag_hex:ciphertext_hex
  return `v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt sensitive financial fields using AES-256-GCM
 */
export function decryptFinancialData(encryptedPayload: string): string {
  if (!encryptedPayload || !encryptedPayload.startsWith('v1:')) return encryptedPayload;
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 4) return encryptedPayload;
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const ciphertext = Buffer.from(parts[3], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.error('[SECURITY ERROR] Failed to decrypt financial field:', err);
    return '••••••••';
  }
}

/**
 * Mask account number for secure UI display (e.g., •••• •••• 7812)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  const clean = accountNumber.replace(/\s+/g, '');
  if (clean.length <= 4) return `•••• ${clean}`;
  const last4 = clean.slice(-4);
  const maskPrefix = clean.length > 8 ? '•••• •••• ' : '•••• ';
  return `${maskPrefix}${last4}`;
}

/**
 * Cryptographic HMAC-SHA256 seal to verify record integrity and prevent database tampering
 */
export function generateSecuritySeal(record: Record<string, any>): string {
  const canonicalString = [
    record.id || '',
    record.user_id || '',
    record.name || '',
    record.institution || '',
    record.account_number_encrypted || record.account_number || '',
    record.current_balance || '',
    record.currency || '',
  ].join('|');
  return crypto.createHmac('sha256', HMAC_KEY).update(canonicalString).digest('hex').substring(0, 16);
}

/**
 * Verify HMAC security seal
 */
export function verifySecuritySeal(record: Record<string, any>, seal: string): boolean {
  if (!seal) return false;
  const expected = generateSecuritySeal(record);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(seal));
}
