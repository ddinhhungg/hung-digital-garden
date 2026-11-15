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
export type PlanStatus = 'Chờ' | 'Đã xong' | 'Hoãn' | 'Huỷ';
/** Một mục trên lịch: khoản cố định (source 'fixed') hoặc ghi chú kế hoạch (source 'plan'). Có từ Apps Script 1.6. */
export interface CalendarItem {
  id: string | null;
  source: 'fixed' | 'plan';
  date: string;
  label: string;
  amount: number | null;
  /** 'move' là chuyển giữa các tài khoản của mình (ví dụ trích vào quỹ), không phải thu hay chi. Có từ Apps Script 1.7. */
  kind: 'in' | 'out' | 'move';
  /** Tài khoản chính: nguồn với chi và chuyển, đích với thu. */
  account: string | null;
  /** Tài khoản đến của khoản chuyển. */
  to?: string | null;
  /** Danh mục gợi ý (khoản cố định). */
  category?: string | null;
  /** Mã giao dịch đã tự ghi khi bấm Xong. null nghĩa là chưa ghi sổ. */
  txId?: string | null;
  certain: boolean;
  status: PlanStatus;
  note: string;
}
export interface NewPlan {
  date: string;
  label: string;
  kind: 'Thu' | 'Chi' | 'Chuyển';
  amount: number | null;
  account: string | null;
  to?: string | null;
  certain: boolean;
  note?: string;
}
// v1.7: bấm Xong thì tự ghi sổ
export interface CompletePlanInput {
  id: string;
  /** false = chỉ đánh dấu xong, không tạo giao dịch. */
  record: boolean;
  date?: string;
  amount?: number;
  account?: string;
  to?: string;
  category?: string;
  note?: string;
}
export interface CompleteFixedInput {
  label: string;
  /** Ngày theo lịch của khoản cố định (khoá để không ghi trùng). */
  date: string;
  record: boolean;
  /** Ngày ghi giao dịch, mặc định hôm nay. */
  txDate?: string;
  amount?: number;
  account?: string;
  category?: string;
  note?: string;
}
export interface CompleteResult { txId: string | null; balances: Record<string, number> }
export interface NewDebt {
  direction: 'lend' | 'borrow';
  party: string;
  amount: number;
  account: string;
  date?: string;
  due?: string;
  note?: string;
}
export interface SettleDebtInput { code: string; amount: number; account: string; date?: string; note?: string }
export interface DebtResult { balances: Record<string, number>; code?: string; remaining?: number; closed?: boolean }
export interface OffsetResult { amount: number; closed: string[] }
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
  calendar?: CalendarItem[];
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
    /** Mức của Apps Script: 2 trở lên có bấm Xong tự ghi sổ, công nợ trong app, chia tiền. */
    api?: number;
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
  /** Chỉ với khoản Chi: phần người khác nợ mình. App ghi chi phần của mình và một khoản cho vay phần của họ. */
  split?: { party: string; amount: number; due?: string };
}

export interface AddResult {
  id: string;
  balances: Record<string, number>;
  /** Có khi chia tiền: mã khoản nợ vừa tạo. */
  debtCode?: string;
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
  addPlan(p: NewPlan): Promise<{ id: string }>;
  setPlanStatus(id: string, status: PlanStatus, date?: string): Promise<{ id: string; status: PlanStatus }>;
  completePlan(input: CompletePlanInput): Promise<CompleteResult>;
  completeFixed(input: CompleteFixedInput): Promise<CompleteResult>;
  addDebt(input: NewDebt): Promise<DebtResult>;
  settleDebt(input: SettleDebtInput): Promise<DebtResult>;
  offsetDebts(receivable: string, payable: string): Promise<OffsetResult>;
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
