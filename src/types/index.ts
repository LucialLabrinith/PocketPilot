export interface User {
  userId: string;
  email: string;
  fullName: string;
  currency: string;
  verified: boolean;
  clientType?: string;
}

export interface Account {
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
  created_at: string;
  updated_at: string;
}

export interface Category {
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

export interface Transaction {
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

export interface MonthlyBudget {
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

export interface SavingsGoal {
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

export interface BillSubscription {
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

export interface Investment {
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
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssetLiability {
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

export interface FinancialSummary {
  currency: string;
  currentMonth: string;
  netWorth: string;
  totalAssets: string;
  totalLiabilities: string;
  cashAndBank: string;
  creditCardDebt: string;
  investmentsValue: string;
  investmentsPrincipal: string;
  physicalAssets: string;
  loansAndLiabilities: string;
  monthlyIncome: string;
  monthlyExpense: string;
  monthlySavings: string;
  monthlyTransfers: string;
  savingsRate: number;
  totalGoalTarget: string;
  totalGoalSaved: string;
  totalAccountsCount: number;
  totalTransactionsCount: number;
}

export interface LinkedProvider {
  id: string;
  user_id: string;
  item_type: 'BANK' | 'UPI' | 'INVESTMENT';
  provider_name: string;
  identifier: string;
  linked_account_id?: string | null;
  linked_investment_id?: string | null;
  status: 'ACTIVE' | 'SYNCING' | 'ERROR';
  auto_growth_enabled: boolean;
  growth_rate_percent?: string;
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface SyncAuditLog {
  id: string;
  user_id: string;
  client_type: 'WEB' | 'DESKTOP_JAVAFX' | 'BACKEND_API';
  action: string;
  details: string;
  timestamp: string;
}
