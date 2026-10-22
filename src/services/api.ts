import {
  Account,
  Category,
  Transaction,
  MonthlyBudget,
  SavingsGoal,
  BillSubscription,
  Investment,
  AssetLiability,
  FinancialSummary,
  SyncAuditLog
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('pocketpilot_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (data.requiresVerification || data.canOtpLogin) {
    return data;
  }
  if (!res.ok || data.success === false) {
    const err: any = new Error(data.message || 'Request failed');
    err.devOtp = data.devOtp;
    err.requiresVerification = data.requiresVerification;
    err.canOtpLogin = data.canOtpLogin;
    throw err;
  }
  return data;
}

export const api = {
  // Auth & Real-Time Email OTP
  async sendOtp(payload: { email: string; purpose?: string; fullName?: string }) {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; devOtp?: string; emailDelivery?: any }>(res);
  },

  async register(payload: { email: string; password: string; fullName: string; currency: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: any; devOtp?: string; emailDelivery?: any }>(res);
  },

  async verifyOtp(payload: { email: string; otpCode: string; purpose?: string; clientType?: string }) {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async login(payload: { email: string; password: string; clientType?: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; data: any; devOtp?: string; requiresVerification?: boolean; emailDelivery?: any }>(res);
  },

  async getSmtpStatus() {
    const res = await fetch(`${API_BASE}/auth/smtp-status`);
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async updateSmtpConfig(config: any) {
    const res = await fetch(`${API_BASE}/auth/smtp-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async getLatestEmail(email: string) {
    const res = await fetch(`${API_BASE}/auth/latest-email?email=${encodeURIComponent(email)}`);
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  async getDispatchedEmails(email?: string) {
    const url = email ? `${API_BASE}/auth/dispatched-emails?email=${encodeURIComponent(email)}` : `${API_BASE}/auth/dispatched-emails`;
    const res = await fetch(url);
    return handleResponse<{ success: boolean; data: any[] }>(res);
  },

  async sendTestEmail(email: string) {
    const res = await fetch(`${API_BASE}/auth/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
    } finally {
      localStorage.removeItem('pocketpilot_token');
      localStorage.removeItem('pocketpilot_user');
    }
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ success: boolean; message: string; devOtp?: string }>(res);
  },

  async resetPassword(payload: { email: string; otpCode: string; newPassword: string }) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; data: any }>(res);
  },

  // Accounts
  async getAccounts(): Promise<Account[]> {
    const res = await fetch(`${API_BASE}/accounts`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: Account[] }>(res);
    return result.data;
  },

  async createAccount(data: { name: string; accountType: string; openingBalance: string; currency?: string; accountNumber?: string; institution?: string }) {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: Account }>(res);
  },

  async updateAccount(id: string, data: Partial<Account>) {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: Account }>(res);
  },

  async deleteAccount(id: string) {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async reconcileAccount(id: string) {
    const res = await fetch(`${API_BASE}/accounts/${id}/reconcile`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string; data: Account }>(res);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: Category[] }>(res);
    return result.data;
  },

  async createCategory(data: { name: string; type: string; classification?: string; color?: string; icon?: string; monthlyLimit?: string }) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: Category }>(res);
  },

  async deleteCategory(id: string) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Transactions
  async getTransactions(params?: { type?: string; accountId?: string; categoryId?: string; startDate?: string; endDate?: string; search?: string }): Promise<Transaction[]> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const res = await fetch(`${API_BASE}/transactions?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: Transaction[] }>(res);
    return result.data;
  },

  async createTransaction(data: { accountId: string; toAccountId?: string | null; categoryId?: string | null; type: string; amount: string; transactionDate: string; notes?: string; payee?: string }) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: Transaction }>(res);
  },

  async updateTransaction(id: string, data: Partial<Transaction> & { accountId?: string; toAccountId?: string | null; categoryId?: string | null; transactionDate?: string }) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: Transaction }>(res);
  },

  async deleteTransaction(id: string) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async importCsv(csvData: string, defaultAccountId?: string) {
    const res = await fetch(`${API_BASE}/transactions/import-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ csvData, defaultAccountId }),
    });
    return handleResponse<{ success: boolean; message: string; importedCount: number }>(res);
  },

  // Budgets
  async getCurrentBudget(): Promise<MonthlyBudget> {
    const res = await fetch(`${API_BASE}/budgets/current`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: MonthlyBudget }>(res);
    return result.data;
  },

  async saveBudget(data: { monthYear?: string; monthlyIncomeTarget: string; needsPercentage: number; wantsPercentage: number; savingsPercentage: number; notes?: string }) {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: MonthlyBudget }>(res);
  },

  // Goals
  async getGoals(): Promise<SavingsGoal[]> {
    const res = await fetch(`${API_BASE}/goals`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: SavingsGoal[] }>(res);
    return result.data;
  },

  async createGoal(data: { name: string; targetAmount: string; currentAmount?: string; targetDate: string; category?: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: SavingsGoal }>(res);
  },

  async contributeToGoal(id: string, data: { amount: string; accountId?: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/goals/${id}/contribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: SavingsGoal }>(res);
  },

  // Bills
  async getBills(): Promise<BillSubscription[]> {
    const res = await fetch(`${API_BASE}/bills`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: BillSubscription[] }>(res);
    return result.data;
  },

  async createBill(data: { name: string; amount: string; billingCycle: string; dueDay: number; categoryId?: string; accountId?: string; isAutopay?: boolean; nextDueDate?: string }) {
    const res = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: BillSubscription }>(res);
  },

  async deleteBill(id: string) {
    const res = await fetch(`${API_BASE}/bills/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Investments
  async getInvestments(): Promise<Investment[]> {
    const res = await fetch(`${API_BASE}/investments`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: Investment[] }>(res);
    return result.data;
  },

  async createInvestment(data: { investmentType: string; name: string; investedAmount: string; currentValue?: string; annualRatePercent?: string; startDate?: string; maturityDate?: string | null; sipMonthlyAmount?: string | null; notes?: string }) {
    const res = await fetch(`${API_BASE}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: Investment }>(res);
  },

  async deleteInvestment(id: string) {
    const res = await fetch(`${API_BASE}/investments/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Assets & Liabilities
  async getAssetsLiabilities(): Promise<AssetLiability[]> {
    const res = await fetch(`${API_BASE}/assets-liabilities`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: AssetLiability[] }>(res);
    return result.data;
  },

  async createAssetLiability(data: { recordType: string; category: string; name: string; valuationAmount: string; interestRate?: string | null; monthlyEmi?: string | null; notes?: string }) {
    const res = await fetch(`${API_BASE}/assets-liabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: AssetLiability }>(res);
  },

  async deleteAssetLiability(id: string) {
    const res = await fetch(`${API_BASE}/assets-liabilities/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Analytics
  async getSummary(): Promise<FinancialSummary> {
    const res = await fetch(`${API_BASE}/analytics/summary`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: FinancialSummary }>(res);
    return result.data;
  },

  // Desktop sync logs
  async getSyncLogs(): Promise<SyncAuditLog[]> {
    const res = await fetch(`${API_BASE}/sync/logs`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: SyncAuditLog[] }>(res);
    return result.data;
  },

  async triggerSync(clientType: string = 'DESKTOP_JAVAFX') {
    const res = await fetch(`${API_BASE}/sync/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ clientType }),
    });
    return handleResponse<{ success: boolean; message: string; log: SyncAuditLog }>(res);
  },

  // Linked Providers (Bank, UPI, Investments) & Auto-growth
  async getLinkedProviders(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/linked`, {
      headers: { ...getAuthHeader() },
    });
    const result = await handleResponse<{ success: boolean; data: any[] }>(res);
    return result.data;
  },

  async linkBank(data: { bankName: string; accountNumber: string; ifscOrRouting?: string; accountType?: string; openingBalance?: string }) {
    const res = await fetch(`${API_BASE}/linked/bank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any; account: Account }>(res);
  },

  async linkUpi(data: { upiId: string; upiApp?: string; linkedAccountId?: string }) {
    const res = await fetch(`${API_BASE}/linked/upi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async linkInvestments(data: { providerName: string; folioOrPan?: string; portfolioType?: string; initialInvested: string; expectedCagr?: string }) {
    const res = await fetch(`${API_BASE}/linked/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; data: any; investment: Investment }>(res);
  },

  async simulateUpiPayment(data: { upiId: string; type?: string; amount: string; merchantOrPayer?: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/linked/simulate-upi-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ success: boolean; message: string; transaction: Transaction }>(res);
  },

  async triggerAutoGrowth(simulateMonths: number = 1) {
    const res = await fetch(`${API_BASE}/linked/auto-growth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ simulateMonths }),
    });
    return handleResponse<{ success: boolean; message: string; data: any }>(res);
  },

  async unlinkProvider(id: string) {
    const res = await fetch(`${API_BASE}/linked/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  }
};
