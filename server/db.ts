import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  currency: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface OtpRecord {
  id: string;
  email: string;
  otp_code: string;
  purpose: 'REGISTRATION' | 'PASSWORD_RESET' | 'LOGIN';
  attempts: number;
  resend_count: number;
  last_sent_at: string;
  expires_at: string;
  is_used: boolean;
  created_at: string;
}

export interface SessionRecord {
  token: string;
  user_id: string;
  client_type: 'WEB' | 'DESKTOP_JAVAFX';
  created_at: string;
  expires_at: string;
}

export interface AccountRecord {
  id: string;
  user_id: string;
  name: string;
  account_type: 'CHECKING' | 'SAVINGS' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT';
  opening_balance: string;
  current_balance: string;
  currency: string;
  account_number?: string;
  institution?: string;
  is_reconciled: boolean;
  last_reconciled_at?: string;
  is_linked?: boolean;
  linked_provider?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryRecord {
  id: string;
  user_id: string | null;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  classification: 'NEED' | 'WANT' | 'SAVINGS' | 'NONE';
  color: string;
  icon: string;
  monthly_limit: string;
  is_default: boolean;
}

export interface TransactionRecord {
  id: string;
  user_id: string;
  account_id: string;
  to_account_id?: string | null;
  category_id?: string | null;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'REFUND';
  amount: string;
  transaction_date: string;
  notes?: string;
  payee?: string;
  is_reconciled: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonthlyBudgetRecord {
  id: string;
  user_id: string;
  month_year: string;
  monthly_income_target: string;
  needs_percentage: number;
  wants_percentage: number;
  savings_percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoalRecord {
  id: string;
  user_id: string;
  name: string;
  target_amount: string;
  current_amount: string;
  target_date: string;
  category: string;
  notes?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalContributionRecord {
  id: string;
  goal_id: string;
  user_id: string;
  account_id?: string | null;
  amount: string;
  contribution_date: string;
  notes?: string;
  created_at: string;
}

export interface BillSubscriptionRecord {
  id: string;
  user_id: string;
  name: string;
  amount: string;
  billing_cycle: 'MONTHLY' | 'ANNUAL' | 'WEEKLY';
  due_day: number;
  category_id?: string | null;
  account_id?: string | null;
  is_autopay: boolean;
  is_active: boolean;
  next_due_date: string;
  created_at: string;
  updated_at: string;
}

export interface InvestmentRecord {
  id: string;
  user_id: string;
  investment_type: 'MUTUAL_FUND_SIP' | 'FIXED_DEPOSIT' | 'STOCK' | 'OTHER';
  name: string;
  invested_amount: string;
  current_value: string;
  annual_rate_percent: string;
  start_date: string;
  maturity_date?: string | null;
  sip_monthly_amount?: string | null;
  is_linked?: boolean;
  linked_provider?: string;
  auto_growth_enabled?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetLiabilityRecord {
  id: string;
  user_id: string;
  record_type: 'ASSET' | 'LIABILITY';
  category: string;
  name: string;
  valuation_amount: string;
  interest_rate?: string | null;
  monthly_emi?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LinkedProviderRecord {
  id: string;
  user_id: string;
  item_type: 'BANK' | 'UPI' | 'INVESTMENT';
  provider_name: string; // e.g. "HDFC Bank", "State Bank of India", "Google Pay UPI", "Zerodha (Mutual Funds)", "Groww (SIP)"
  identifier: string; // Account Number, UPI ID (e.g. user@okhdfcbank), Folio
  linked_account_id?: string | null;
  linked_investment_id?: string | null;
  status: 'ACTIVE' | 'SYNCING' | 'ERROR';
  auto_growth_enabled: boolean;
  growth_rate_percent?: string; // e.g. 7.5% for FD, 12% for SIP, 3.5% for Savings Interest
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncAuditLogRecord {
  id: string;
  user_id: string;
  client_type: 'WEB' | 'DESKTOP_JAVAFX' | 'BACKEND_API';
  action: string;
  details: string;
  timestamp: string;
}

export interface DatabaseState {
  users: UserRecord[];
  otp_verifications: OtpRecord[];
  sessions: SessionRecord[];
  accounts: AccountRecord[];
  categories: CategoryRecord[];
  transactions: TransactionRecord[];
  monthly_budgets: MonthlyBudgetRecord[];
  savings_goals: SavingsGoalRecord[];
  goal_contributions: GoalContributionRecord[];
  bills_subscriptions: BillSubscriptionRecord[];
  investments: InvestmentRecord[];
  assets_liabilities: AssetLiabilityRecord[];
  linked_providers: LinkedProviderRecord[];
  sync_audit_logs: SyncAuditLogRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'pocketpilot.db.json');

export const DEFAULT_SYSTEM_CATEGORIES: CategoryRecord[] = [
  { id: 'cat-inc-1', user_id: null, name: 'Salary', type: 'INCOME', classification: 'NONE', color: '#10b981', icon: 'wallet', monthly_limit: '0.00', is_default: true },
  { id: 'cat-inc-2', user_id: null, name: 'Freelance & Consulting', type: 'INCOME', classification: 'NONE', color: '#06b6d4', icon: 'briefcase', monthly_limit: '0.00', is_default: true },
  { id: 'cat-inc-3', user_id: null, name: 'Investment Returns', type: 'INCOME', classification: 'NONE', color: '#8b5cf6', icon: 'trending-up', monthly_limit: '0.00', is_default: true },
  { id: 'cat-inc-4', user_id: null, name: 'Gifts & Refunds', type: 'INCOME', classification: 'NONE', color: '#ec4899', icon: 'gift', monthly_limit: '0.00', is_default: true },

  { id: 'cat-exp-1', user_id: null, name: 'Housing & Rent', type: 'EXPENSE', classification: 'NEED', color: '#ef4444', icon: 'home', monthly_limit: '1200.00', is_default: true },
  { id: 'cat-exp-2', user_id: null, name: 'Groceries & Food', type: 'EXPENSE', classification: 'NEED', color: '#f97316', icon: 'shopping-cart', monthly_limit: '500.00', is_default: true },
  { id: 'cat-exp-3', user_id: null, name: 'Utilities & Internet', type: 'EXPENSE', classification: 'NEED', color: '#eab308', icon: 'zap', monthly_limit: '200.00', is_default: true },
  { id: 'cat-exp-4', user_id: null, name: 'Healthcare & Insurance', type: 'EXPENSE', classification: 'NEED', color: '#14b8a6', icon: 'activity', monthly_limit: '150.00', is_default: true },
  { id: 'cat-exp-5', user_id: null, name: 'Transportation & Fuel', type: 'EXPENSE', classification: 'NEED', color: '#6366f1', icon: 'truck', monthly_limit: '250.00', is_default: true },

  { id: 'cat-exp-6', user_id: null, name: 'Dining Out & Cafes', type: 'EXPENSE', classification: 'WANT', color: '#f43f5e', icon: 'coffee', monthly_limit: '200.00', is_default: true },
  { id: 'cat-exp-7', user_id: null, name: 'Entertainment & Movies', type: 'EXPENSE', classification: 'WANT', color: '#a855f7', icon: 'film', monthly_limit: '120.00', is_default: true },
  { id: 'cat-exp-8', user_id: null, name: 'Shopping & Apparel', type: 'EXPENSE', classification: 'WANT', color: '#3b82f6', icon: 'shopping-bag', monthly_limit: '180.00', is_default: true },
  { id: 'cat-exp-9', user_id: null, name: 'Travel & Vacations', type: 'EXPENSE', classification: 'WANT', color: '#0ea5e9', icon: 'compass', monthly_limit: '300.00', is_default: true },

  { id: 'cat-exp-10', user_id: null, name: 'Emergency Fund', type: 'EXPENSE', classification: 'SAVINGS', color: '#10b981', icon: 'shield', monthly_limit: '400.00', is_default: true },
  { id: 'cat-exp-11', user_id: null, name: 'Retirement & SIPs', type: 'EXPENSE', classification: 'SAVINGS', color: '#059669', icon: 'piggy-bank', monthly_limit: '500.00', is_default: true },
];

class DatabaseStore {
  private state: DatabaseState;

  constructor() {
    this.state = this.load();
  }

  private load(): DatabaseState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          otp_verifications: parsed.otp_verifications || [],
          sessions: parsed.sessions || [],
          accounts: parsed.accounts || [],
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_SYSTEM_CATEGORIES,
          transactions: parsed.transactions || [],
          monthly_budgets: parsed.monthly_budgets || [],
          savings_goals: parsed.savings_goals || [],
          goal_contributions: parsed.goal_contributions || [],
          bills_subscriptions: parsed.bills_subscriptions || [],
          investments: parsed.investments || [],
          assets_liabilities: parsed.assets_liabilities || [],
          linked_providers: parsed.linked_providers || [],
          sync_audit_logs: parsed.sync_audit_logs || [],
        };
      }
    } catch (err) {
      console.error('Failed reading database file, starting fresh', err);
    }

    const initial: DatabaseState = {
      users: [],
      otp_verifications: [],
      sessions: [],
      accounts: [],
      categories: DEFAULT_SYSTEM_CATEGORIES,
      transactions: [],
      monthly_budgets: [],
      savings_goals: [],
      goal_contributions: [],
      bills_subscriptions: [],
      investments: [],
      assets_liabilities: [],
      linked_providers: [],
      sync_audit_logs: [],
    };
    this.persist(initial);
    return initial;
  }

  private persist(data: DatabaseState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmp = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmp, DB_FILE);
    } catch (err) {
      console.error('Failed persisting database to disk', err);
    }
  }

  public save() {
    this.persist(this.state);
  }

  public get db(): DatabaseState {
    return this.state;
  }

  public recalculateAccountBalance(accountId: string, userId: string) {
    const account = this.state.accounts.find(a => a.id === accountId && a.user_id === userId);
    if (!account) return;

    let balance = parseFloat(account.opening_balance || '0');
    const txs = this.state.transactions.filter(t => t.user_id === userId);
    for (const tx of txs) {
      const amt = parseFloat(tx.amount || '0');
      if (tx.type === 'INCOME' && tx.account_id === accountId) {
        balance += amt;
      } else if (tx.type === 'EXPENSE' && tx.account_id === accountId) {
        balance -= amt;
      } else if (tx.type === 'REFUND' && tx.account_id === accountId) {
        balance += amt;
      } else if (tx.type === 'TRANSFER') {
        if (tx.account_id === accountId) {
          balance -= amt;
        }
        if (tx.to_account_id === accountId) {
          balance += amt;
        }
      }
    }

    account.current_balance = (Math.round((balance + Number.EPSILON) * 100) / 100).toFixed(2);
    account.updated_at = new Date().toISOString();
    this.save();
  }

  /**
   * Auto-Growth Engine:
   * 1. Calculates interest accrual on Linked Bank Accounts (e.g. 3.5% p.a.)
   * 2. Accrues Fixed Deposit compounded growth based on interest rate
   * 3. Calculates Mutual Fund NAV growth for linked investments based on annual CAGR
   * 4. Updates balances transparently and records audit logs
   */
  public runAutoGrowth(userId: string, simulateMonths: number = 1): {
    growthAppliedCount: number;
    totalYieldAccrued: string;
    details: string[];
  } {
    let growthCount = 0;
    let totalAccrued = 0;
    const details: string[] = [];
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // 1. Grow Linked Investments (Mutual Funds, SIPs, Fixed Deposits)
    const userInvestments = this.state.investments.filter(i => i.user_id === userId);
    for (const inv of userInvestments) {
      const rate = parseFloat(inv.annual_rate_percent || '12.0');
      const currentVal = parseFloat(inv.current_value || inv.invested_amount || '0');
      if (currentVal > 0 && rate > 0) {
        // Growth for simulated period (monthly rate = annual_rate / 12)
        const monthlyMultiplier = Math.pow(1 + rate / 100, simulateMonths / 12);
        const newVal = currentVal * monthlyMultiplier;
        const gain = newVal - currentVal;

        inv.current_value = (Math.round((newVal + Number.EPSILON) * 100) / 100).toFixed(2);
        inv.updated_at = now;
        totalAccrued += gain;
        growthCount++;
        details.push(`${inv.name}: Grew by +${gain.toFixed(2)} (${rate}% p.a. yield) -> New Value: ${inv.current_value}`);
      }
    }

    // 2. Accrue Savings Interest on Linked Bank Accounts
    const userAccounts = this.state.accounts.filter(a => a.user_id === userId);
    for (const acc of userAccounts) {
      if (acc.account_type === 'SAVINGS') {
        const bal = parseFloat(acc.current_balance || '0');
        if (bal > 0) {
          const savingsInterestRate = 3.5; // 3.5% p.a. standard savings bank interest
          const interestEarned = (bal * (savingsInterestRate / 100) * (simulateMonths / 12));
          if (interestEarned >= 0.01) {
            const cleanInterest = (Math.round((interestEarned + Number.EPSILON) * 100) / 100).toFixed(2);

            // Record interest credit transaction
            this.state.transactions.push({
              id: crypto.randomUUID(),
              user_id: userId,
              account_id: acc.id,
              type: 'INCOME',
              amount: cleanInterest,
              transaction_date: today,
              notes: `Auto-credited Savings Interest (${savingsInterestRate}% p.a. for ${simulateMonths} month)`,
              payee: `${acc.institution || acc.name} Interest Credit`,
              is_reconciled: true,
              created_at: now,
              updated_at: now,
            });

            this.recalculateAccountBalance(acc.id, userId);
            totalAccrued += interestEarned;
            growthCount++;
            details.push(`${acc.name}: +${cleanInterest} interest credited at 3.5% p.a.`);
          }
        }
      }
    }

    // 3. Update linked provider timestamps
    const userLinked = this.state.linked_providers.filter(l => l.user_id === userId);
    for (const lp of userLinked) {
      lp.last_synced_at = now;
      lp.updated_at = now;
    }

    // 4. Log audit record
    this.state.sync_audit_logs.push({
      id: crypto.randomUUID(),
      user_id: userId,
      client_type: 'BACKEND_API',
      action: 'AUTO_GROWTH_EXECUTED',
      details: `Executed auto-growth for ${simulateMonths} month(s). Total accrued: +${totalAccrued.toFixed(2)} across ${growthCount} assets.`,
      timestamp: now,
    });

    this.save();

    return {
      growthAppliedCount: growthCount,
      totalYieldAccrued: totalAccrued.toFixed(2),
      details,
    };
  }
}

export const dbStore = new DatabaseStore();

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update('pocketpilot_salt_' + password).digest('hex');
}
