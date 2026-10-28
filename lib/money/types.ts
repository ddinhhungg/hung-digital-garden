export type TxType =
  | 'Thu' | 'Chi' | 'Chuyển' | 'Vay'
  | 'Cho vay' | 'Trả nợ' | 'Thu nợ' | 'Điều chỉnh';

export type AccountGroup =
  | 'Tiền mặt' | 'Ngân hàng' | 'Ví điện tử'
  | 'Tiết kiệm' | 'Đầu tư' | 'Thẻ tín dụng';

export interface Account {
  code: string;
  name: string;
  group: AccountGroup;
  liquid: boolean;
  balance: number;
  diff: number | null;
  reconciledAt: string | null;
  fundCode: string | null;
  /** Mô tả phụ (ví dụ ngày đáo hạn, lãi suất). Có từ Apps Script 1.3. */
  note?: string | null;
}

export interface Fund {
  code: string;
  name: string;
  kind: 'virtual' | 'real';
  target: number | null;
  deadline: string | null;
  saved: number;
  progress: number | null;
  monthlyNeeded: number | null;
  account: string | null;
  note?: string | null;
}

export interface Debt {
  code: string;
  kind: 'payable' | 'receivable';
  party: string;
  principal: number;
  paid: number;
  remaining: number;
  due: string | null;
  status: 'open' | 'closed' | 'risky';
  note: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: TxType;
  amount: number;
  from: string;
  to: string;
  category: string;
  subcategory: string;
  party: string;
  note: string;
  source: string;
  status: 'OK' | 'Dự kiến' | 'Void';
}

export interface CategorySpend {
  category: string;
  budget: number | null;
  spent: number;
}

// v1.2
export interface DailySpend { date: string; expense: number }
export interface NetWorthPoint { date: string; netWorth: number; available: number; liquid: number }
export interface MonthFlow {
  key: string; income: number; expense: number;
  /** Chi theo danh mục của tháng đó. Có từ Apps Script 1.4. */
  byCategory?: { category: string; spent: number }[];
}
export interface UpcomingItem {
  date: string;
  label: string;
  amount: number;
  kind: 'in' | 'out';
  account: string | null;
}
export interface Holding {
  code: string;
  type: string;
  qty: number;
  cost: number;
  price: number;
  value: number;
  pnl: number;
  pct: number | null;
}
export interface Portfolio {
  value: number;
  cash: number;
  cost: number;
  pnl: number;
  pnlPct: number | null;
  priceAsOf: string | null;
  holdings: Holding[];
}

export interface Summary {
  version: 1;
  asOf: string;
  totals: {
    netWorth: number;
    liquid: number;
    reservedFunds: number;
    dueDebts30d: number;
    creditCardDebt: number;
    available: number;
  };
  month: {
    key: string;
    income: number;
    expense: number;
    savingsRate: number | null;
    byCategory: CategorySpend[];
    daily: DailySpend[];
  };
  trend: {
    netWorth: NetWorthPoint[];
    months: MonthFlow[];
  };
  upcoming: UpcomingItem[];
  portfolio: Portfolio | null;
  accounts: Account[];
  funds: Fund[];
  debts: Debt[];
  recent: Transaction[];
  meta: {
    txTypes: TxType[];
    categories: {
      type: 'Thu' | 'Chi';
      name: string;
      hints: string[];
    }[];
    defaultAccount: string;
  };
}

export interface NewTransaction {
  date: string;
  type: 'Thu' | 'Chi' | 'Chuyển';
  amount: number;
  from: string;
  to: string;
  category?: string;
  subcategory?: string;
  party?: string;
  note?: string;
}

export interface AddResult {
  id: string;
  balances: Record<string, number>;
}

export type MoneyErrorCode =
  | 'UNAUTHORIZED' | 'VALIDATION' | 'BUSY' | 'NETWORK' | 'SERVER';

export class MoneyError extends Error {
  constructor(
    public code: MoneyErrorCode,
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'MoneyError';
  }
}

export interface MoneyClient {
  getSummary(): Promise<Summary>;
  addTransaction(t: NewTransaction): Promise<AddResult>;
  hasToken(): boolean;
  setToken(t: string): void;
  clearToken(): void;
  lastSummary(): { data: Summary; savedAt: string } | null;
}

export interface MoneyLock {
  isSet(): boolean;
  verify(pin: string): boolean;
  set(pin: string): void;
  clear(): void;
}
