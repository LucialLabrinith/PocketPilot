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
  account_number_masked?: string;
  country?: string;
  ifsc_code?: string;
  branch_name?: string;
  institution?: string;
  is_reconciled: boolean;
  last_reconciled_at?: string;
  is_linked?: boolean;
  linked_provider?: string;
  last_synced_at?: string;
  sync_status?: 'SYNCED' | 'PENDING' | 'ERROR';
  security_seal?: string;
  is_primary_receiving?: boolean;
  upi_vpa?: string;
  upi_pin?: string;
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
  classification?: 'NEED' | 'WANT' | 'SAVINGS' | 'NONE';
  payment_method?: 'UPI_QR' | 'UPI_CONTACT' | 'UPI_VPA' | 'BANK_TRANSFER' | 'SELF' | 'CARD' | 'CASH';
  payee_identifier?: string;
  amount: string;
  transaction_date: string;
  notes?: string;
  payee?: string;
  is_reconciled: boolean;
  npci_rrn?: string;
  cbs_pinnacle_ref?: string;
  bank_switch_auth?: string;
  transferree_legal_name?: string;
  transferree_vpa?: string;
  transfer_fee?: string;
  transfer_fee_gst?: string;
  switch_route?: string;
  legal_compliance_seal?: string;
  created_at: string;
  updated_at: string;
}

export interface LegalTransferCertificate {
  certificateId: string;
  transactionId: string;
  npciRrn: string;
  cbsPinnacleJournal: string;
  bankSwitchAuthCode: string;
  networkTransactionId: string;
  transferDate: string;
  remitter: {
    accountHolder: string;
    maskedAccount: string;
    bankName: string;
    vpa: string;
    ifsc: string;
  };
  transferree: {
    legalName: string;
    vpaOrAccount: string;
    bankName: string;
    ifsc?: string;
    verifiedOnNpciDirectory: boolean;
  };
  financials: {
    transferAmount: string;
    currency: string;
    transferFee: string;
    transferFeeGst: string;
    npciNetworkSurcharge: string;
    totalSettledAmount: string;
    feeWaiverClause: string;
  };
  compliance: {
    rbiActRef: string;
    npciRuleBook: string;
    switchClearanceAudit: string;
    digitalSeal: string;
    status: 'SETTLED_LEGAL_TENDER';
  };
}

export interface SwitchStatusInfo {
  pinnacleCbs: {
    name: string;
    version: string;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    latencyMs: number;
    protocol: string;
    encryption: string;
    cbsHostId: string;
    compliance: string;
  };
  npciCentralSwitch: {
    name: string;
    rails: string[];
    status: 'OPERATIONAL' | 'MAINTENANCE';
    latencyMs: number;
    activeBatchId: string;
    settlementCycle: string;
    rrnCounter: number;
    regulatoryApproval: string;
  };
  interbankBankSwitch: {
    name: string;
    isoStandard: string;
    status: 'ACTIVE';
    activeNodes: number;
    averageTps: number;
    mtiSupport: string[];
  };
  legalCompliance: {
    act: string;
    rbiDirective: string;
    zeroFeeP2PDirective: string;
    pmlaAmlStatus: string;
  };
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
  broker_app?: string;
  stock_symbol?: string;
  quantity?: number;
  buy_price?: string;
  current_price?: string;
  pnl?: string;
  fd_tenure_months?: number;
  fd_maturity_amount?: string;
  is_linked?: boolean;
  linked_provider?: string;
  auto_growth_enabled?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TradeHolding {
  id: string;
  brokerApp: 'Zerodha Kite' | 'Groww' | 'Upstox' | 'Angel One' | 'ICICI Direct' | 'Dhan' | 'Robinhood';
  symbol: string;
  name: string;
  holdingType: 'EQUITY' | 'MUTUAL_FUND' | 'FD' | 'SGB';
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  investedValue: number;
  currentValue: number;
  pnl: number;
  pnlPercentage: number;
  dayChangePercentage: number;
  lastUpdated: string;
}

export interface PocketMoneyState {
  dailyLimit: string;
  todaySpent: string;
  remainingToday: string;
  sourceAccountId: string | null;
  sourceAccountName?: string;
  autoResetDaily: boolean;
  recentSpends: Array<{ id: string; title: string; amount: string; time: string; category: string }>;
}

export interface UpiPayRequest {
  payingAccountId: string;
  toAccountId?: string;
  amount: string;
  payee: string;
  payeeType: 'QR' | 'CONTACT' | 'UPI_ID' | 'BANK_TRANSFER' | 'SELF';
  payeeIdentifier: string;
  classification: 'NEED' | 'WANT' | 'SAVINGS';
  purpose: string;
  upiPin?: string;
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
