import {
  MoneyError, type Account, type AddResult, type Debt, type Fund,
  type MoneyClient, type MoneyErrorCode, type MoneyLock,
  type NewTransaction, type Summary, type Transaction, type TxType,
} from './types';

const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const delay = () => new Promise<void>(resolve => setTimeout(resolve, 500));
const dayMs = 86_400_000;
const vnDay = (ms: number) => new Date(ms + 7 * 3_600_000).toISOString().slice(0, 10);

function seed(now: number): Summary {
  const day = (offset: number) => vnDay(now + offset * dayMs);
  const account = (
    code: string, name: string, group: Account['group'], balance: number,
    liquid: boolean, fundCode: string | null = null, diff: number | null = null,
  ): Account => ({
    code, name, group, balance, liquid, fundCode, diff,
    reconciledAt: diff === null ? null : new Date(now - dayMs).toISOString(),
  });
  const accounts: Account[] = [
    account('CASH', 'Tiền mặt', 'Tiền mặt', 2_000_000, true),
    account('CASH2', 'Tiền mặt dự phòng', 'Tiền mặt', 300_000, true),
    account('VCB', 'Vietcombank', 'Ngân hàng', 58_000_000, true, null, 50_000),
    account('TCB', 'Techcombank', 'Ngân hàng', 23_500_000, true, null, 0),
    account('BIDV', 'BIDV', 'Ngân hàng', 3_000_000, true),
    account('MOMO', 'Ví MoMo', 'Ví điện tử', 500_000, true),
    account('ZALO', 'Ví ZaloPay', 'Ví điện tử', 250_000, true),
    account('SAVE', 'Tiết kiệm an tâm', 'Tiết kiệm', 180_000_000, false),
    account('INV', 'Danh mục đầu tư dài hạn', 'Đầu tư', 1_250_000_000, false),
    account('GOLD', 'Vàng tích luỹ', 'Đầu tư', 80_000_000, false),
    account('VISA', 'Visa Platinum', 'Thẻ tín dụng', -4_550_000, false),
    account('POCKET1', 'Ngăn du lịch', 'Ngân hàng', 23_800_000, false, 'F03'),
    account('POCKET2', 'Ngăn học tập', 'Ngân hàng', 12_000_000, false, 'F04'),
    account('POCKET3', 'Ngăn sửa nhà', 'Tiết kiệm', 8_000_000, false, 'F05'),
  ];
  const funds: Fund[] = [
    { code: 'F01', name: 'Quỹ dự phòng', kind: 'virtual', target: 60_000_000, deadline: day(180), saved: 24_000_000, progress: 0.4, monthlyNeeded: 6_000_000, account: null },
    { code: 'F02', name: 'Học điều mới', kind: 'virtual', target: null, deadline: null, saved: 4_000_000, progress: null, monthlyNeeded: null, account: null },
    { code: 'F03', name: 'Một chuyến đi xa', kind: 'real', target: 20_000_000, deadline: day(90), saved: 23_800_000, progress: 1.19, monthlyNeeded: 0, account: 'POCKET1' },
    { code: 'F04', name: 'Khoá học tiếp theo', kind: 'real', target: 20_000_000, deadline: day(120), saved: 12_000_000, progress: 0.6, monthlyNeeded: 2_000_000, account: 'POCKET2' },
    { code: 'F05', name: 'Chăm chút tổ ấm', kind: 'real', target: null, deadline: null, saved: 8_000_000, progress: null, monthlyNeeded: null, account: 'POCKET3' },
  ];
  const debts: Debt[] = [
    { code: 'D01', kind: 'payable', party: 'Minh An', principal: 8_000_000, paid: 3_000_000, remaining: 5_000_000, due: day(-3), status: 'open', note: 'Khoản vay mẫu.' },
    { code: 'D02', kind: 'payable', party: 'Cửa hàng Nội thất Mộc', principal: 10_000_000, paid: 3_000_000, remaining: 7_000_000, due: day(4), status: 'open', note: '' },
    { code: 'D03', kind: 'receivable', party: 'Khánh Linh', principal: 10_000_000, paid: 1_600_000, remaining: 8_400_000, due: null, status: 'open', note: 'Chưa hẹn ngày hoàn lại.' },
    { code: 'D04', kind: 'receivable', party: 'Nhóm du lịch cuối tuần', principal: 3_000_000, paid: 0, remaining: 3_000_000, due: day(-60), status: 'risky', note: 'Dữ liệu mẫu để thử trạng thái rủi ro cao.' },
    { code: 'D05', kind: 'payable', party: 'Khoản đã tất toán', principal: 1_000_000, paid: 1_000_000, remaining: 0, due: day(-10), status: 'closed', note: '' },
  ];
  const categories: Summary['meta']['categories'] = [
    { type: 'Thu', name: 'Lương', hints: ['lương', 'salary'] },
    { type: 'Thu', name: 'Thu nhập khác', hints: ['thưởng', 'freelance'] },
    { type: 'Chi', name: 'Nhà ở', hints: ['tiền nhà', 'tiền điện'] },
    { type: 'Chi', name: 'Ăn uống', hints: ['cà phê', 'cafe', 'bữa trưa', 'cơm'] },
    { type: 'Chi', name: 'Mua sắm', hints: ['mua áo', 'mua sách'] },
    { type: 'Chi', name: 'Di chuyển', hints: ['grab', 'xăng', 'gửi xe'] },
    { type: 'Chi', name: 'Gia đình', hints: ['bố mẹ', 'gia đình'] },
    { type: 'Chi', name: 'Sức khoẻ', hints: ['thuốc', 'khám bệnh'] },
    { type: 'Chi', name: 'Học tập', hints: ['khoá học', 'học phí'] },
    { type: 'Chi', name: 'Giải trí', hints: ['xem phim', 'game'] },
    { type: 'Chi', name: 'Khác', hints: [] },
    { type: 'Chi', name: 'Quà tặng', hints: ['quà tặng'] },
  ];
  const seeds: [TxType, number, string, string, string][] = [
    ['Chi', 65_000, 'Ăn uống', 'Bữa trưa', 'Quán Cơm Nhà'],
    ['Chi', 45_000, 'Ăn uống', 'Cà phê sáng', 'Góc nhỏ'],
    ['Chuyển', 500_000, '', 'Chuyển sang ví MoMo', ''],
    ['Thu', 42_000_000, 'Lương', 'Lương tháng này', 'Công ty mẫu'],
    ['Chi', 5_800_000, 'Nhà ở', 'Tiền thuê nhà', 'Anh Duy'],
    ['Chi', 5_000, 'Khác', 'Phí gửi xe', ''],
    ['Chi', 350_000, 'Mua sắm', 'Một cuốn sách và bộ dụng cụ ghi chép dành cho những buổi học cuối tuần ở nhà', 'Nhà sách trên con phố rất dài'],
    ['Trả nợ', 3_000_000, '', 'Thanh toán một phần công nợ', 'Minh An'],
    ['Thu nợ', 1_600_000, '', 'Nhận lại khoản ứng trước', 'Khánh Linh'],
    ['Vay', 2_000_000, '', 'Khoản vay thử nghiệm', 'Minh An'],
    ['Cho vay', 3_000_000, '', 'Ứng trước chuyến đi', 'Nhóm du lịch cuối tuần'],
    ['Điều chỉnh', 50_000, '', 'Đối chiếu số dư', ''],
  ];
  const recent: Transaction[] = Array.from({ length: 30 }, (_, index) => {
    const [type, amount, category, note, party] = seeds[index % seeds.length];
    const incoming = ['Thu', 'Vay', 'Thu nợ'].includes(type);
    return {
      id: `MOCK-${index + 1}`, date: day(-Math.floor(index / 2)),
      type, amount, category, subcategory: '', note, party,
      from: incoming ? 'Ngoài' : 'VCB',
      to: incoming ? 'VCB' : type === 'Chuyển' ? 'MOMO' : 'Ngoài',
      source: ['Claude', 'App', 'Ảnh', 'Tay'][index % 4],
      status: index === 6 ? 'Void' : index === 12 ? 'Dự kiến' : 'OK',
    };
  });
  const summary: Summary = {
    version: 1, asOf: new Date(now - 300_000).toISOString(),
    totals: { netWorth: 0, liquid: 0, reservedFunds: 0, dueDebts30d: 0, creditCardDebt: 0, available: 0 },
    month: {
      key: day(0).slice(0, 7), income: 42_000_000, expense: 14_550_000,
      savingsRate: 1 - 14_550_000 / 42_000_000,
      daily: [],
      byCategory: [
        { category: 'Nhà ở', budget: 6_000_000, spent: 5_800_000 },
        { category: 'Ăn uống', budget: 3_000_000, spent: 3_200_000 },
        { category: 'Mua sắm', budget: 2_000_000, spent: 1_650_000 },
        { category: 'Di chuyển', budget: 1_500_000, spent: 1_300_000 },
        { category: 'Gia đình', budget: null, spent: 900_000 },
        { category: 'Sức khoẻ', budget: 1_000_000, spent: 700_000 },
        { category: 'Học tập', budget: 800_000, spent: 500_000 },
        { category: 'Giải trí', budget: 600_000, spent: 495_000 },
        { category: 'Khác', budget: null, spent: 5_000 },
        { category: 'Quà tặng', budget: 500_000, spent: 0 },
      ],
    },
    trend: { netWorth: [], months: [] }, upcoming: [], portfolio: null,
    accounts, funds, debts, recent,
    meta: { txTypes: ['Thu', 'Chi', 'Chuyển', 'Vay', 'Cho vay', 'Trả nợ', 'Thu nợ', 'Điều chỉnh'], categories, defaultAccount: 'MOMO' },
  };
  updateMockTotals(summary, day(0));
  addDashboard(summary, now);
  return summary;
}

// Financial calculation lives only in the mock service, never in the panels.
function updateMockTotals(data: Summary, today: string) {
  const end = vnDay(Date.parse(`${today}T00:00:00+07:00`) + 30 * dayMs);
  data.funds.forEach(f => {
    if (f.kind === 'real' && f.account) {
      f.saved = data.accounts.find(a => a.code === f.account)?.balance ?? f.saved;
      f.progress = f.target === null || f.target <= 0 ? null : f.saved / f.target;
    }
  });
  const open = data.debts.filter(d => d.status === 'open');
  const totals = data.totals;
  totals.liquid = data.accounts.filter(a => a.liquid).reduce((n, a) => n + a.balance, 0);
  totals.reservedFunds = data.funds.filter(f => f.kind === 'virtual').reduce((n, f) => n + f.saved, 0);
  totals.dueDebts30d = open.filter(d => d.kind === 'payable' && d.due !== null && d.due <= end).reduce((n, d) => n + d.remaining, 0);
  totals.creditCardDebt = data.accounts.filter(a => a.group === 'Thẻ tín dụng').reduce((n, a) => n + Math.max(0, -a.balance), 0);
  totals.available = totals.liquid - totals.reservedFunds - totals.dueDebts30d - totals.creditCardDebt;
  totals.netWorth = data.accounts.reduce((n, a) => n + a.balance, 0)
    + open.filter(d => d.kind === 'receivable').reduce((n, d) => n + d.remaining, 0)
    - open.filter(d => d.kind === 'payable').reduce((n, d) => n + d.remaining, 0);
}

export type MockScenario = 'full' | 'new' | 'empty';

function addDashboard(data: Summary, now: number) {
  const today = vnDay(now);
  const codes = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZ1', 'ETF-MAU-DAI-HAN', 'ETF02', 'ETF03'];
  const holdings = codes.map((code, i) => {
    const qty = (i + 2) * 1000, cost = 12000 + i * 1500;
    const price = Math.round(cost * (i % 3 === 0 ? .87 : 1.06 + i * .01));
    return { code, type: i > 8 ? 'ETF' : 'Cổ phiếu', qty, cost, price,
      value: qty * price, pnl: qty * (price - cost), pct: price / cost - 1 };
  });
  const cash = 5000000;
  const value = cash + holdings.reduce((n, h) => n + h.value, 0);
  const cost = cash + holdings.reduce((n, h) => n + h.qty * h.cost, 0);
  data.portfolio = { value, cash, cost, pnl: value - cost, pnlPct: cost ? value / cost - 1 : null,
    priceAsOf: vnDay(now - 3 * dayMs), holdings };
  data.accounts.find(a => a.code === 'INV')!.balance = value;
  updateMockTotals(data, today);
  data.trend.netWorth = Array.from({ length: 45 }, (_, i) => {
    const wave = Math.round(Math.sin(i * .7) * 1800000);
    return { date: vnDay(now - (44 - i) * dayMs),
      netWorth: data.totals.netWorth - (44 - i) * 450000 + wave,
      available: data.totals.available - (44 - i) * 65000 + wave,
      liquid: data.totals.liquid - (44 - i) * 100000 + wave };
  });
  syncLatest(data, today);
  const [year, month] = data.month.key.split('-').map(Number);
  data.trend.months = Array.from({ length: 6 }, (_, i) => ({
    key: new Date(Date.UTC(year, month - 6 + i, 1)).toISOString().slice(0, 7),
    income: 35000000 + i * 1400000, expense: i === 2 ? 42000000 : 17000000 + i * 400000,
  }));
  syncMonth(data);
  const count = Math.min(15, Number(today.slice(8)));
  const weights = Array.from({ length: count }, (_, i) => i === Math.floor(count / 2) ? 10 : 1);
  const sum = weights.reduce((a, b) => a + b, 0);
  let allocated = 0;
  data.month.daily = weights.map((weight, i) => {
    const expense = i === count - 1 ? data.month.expense - allocated : Math.floor(data.month.expense * weight / sum);
    allocated += expense;
    return { date: data.month.key + '-' + String(i + 1).padStart(2, '0'), expense };
  });
  data.upcoming = [
    { date: vnDay(now + dayMs), label: 'Tiền thuê nhà', amount: 5800000, kind: 'out', account: 'VCB' },
    { date: vnDay(now + 3 * dayMs), label: 'Lương dự kiến', amount: 42000000, kind: 'in', account: 'VCB' },
    { date: vnDay(now + 5 * dayMs), label: 'Thuê bao học tập', amount: 199000, kind: 'out', account: 'MOMO' },
    { date: vnDay(now + 8 * dayMs), label: 'Tiền mạng', amount: 250000, kind: 'out', account: 'VCB' },
    { date: vnDay(now + 12 * dayMs), label: 'Thu nhập dự kiến', amount: 2000000, kind: 'in', account: null },
    { date: vnDay(now + 20 * dayMs), label: 'Thuê bao âm nhạc', amount: 59000, kind: 'out', account: 'MOMO' },
  ];
}
function syncMonth(data: Summary) {
  const current = data.trend.months.find(m => m.key === data.month.key);
  if (current) { current.income = data.month.income; current.expense = data.month.expense; }
}
function syncLatest(data: Summary, today: string) {
  const point = data.trend.netWorth.find(p => p.date === today);
  if (point) Object.assign(point, { netWorth: data.totals.netWorth, available: data.totals.available, liquid: data.totals.liquid });
}
function applyScenario(data: Summary, scenario: MockScenario) {
  if (scenario === 'new') {
    data.trend.netWorth = data.trend.netWorth.slice(-1);
    data.trend.months = data.trend.months.slice(-1);
    data.month.daily = data.month.daily.length ? [{ date: data.month.daily.at(-1)!.date, expense: data.month.expense }] : [];
  }
  if (scenario === 'empty') {
    data.accounts = []; data.funds = []; data.debts = []; data.recent = [];
    data.upcoming = []; data.portfolio = null;
    data.trend = { netWorth: [], months: [] };
    data.month = { key: data.month.key, income: 0, expense: 0, savingsRate: null, byCategory: [], daily: [] };
    data.meta.defaultAccount = '';
    updateMockTotals(data, data.month.key + '-01');
  }
}

export function createMoneyMock({ now }: { now: () => number }): {
  client: MoneyClient;
  lock: MoneyLock;
  controls: {
    failNextRead: (code: MoneyErrorCode) => void;
    failNextSubmit: (code: MoneyErrorCode, field?: string) => void;
    setEmpty: () => void;
    setScenario: (scenario: MockScenario) => void;
  };
} {
  let data = seed(now());
  let cached = { data: copy(data), savedAt: data.asOf };
  let token = '';
  let pin: string | null = null;
  let sequence = 30;
  let readError: MoneyErrorCode | null = null;
  let submitError: { code: MoneyErrorCode; field?: string } | null = null;

  const client: MoneyClient = {
    hasToken: () => token.length > 0,
    setToken: value => { token = value; },
    clearToken: () => { token = ''; },
    lastSummary: () => copy(cached),
    async getSummary() {
      await delay();
      if (!token) throw new MoneyError('UNAUTHORIZED', 'Chưa có token mẫu.');
      if (readError) {
        const code = readError; readError = null;
        throw new MoneyError(code, 'Lỗi đọc dữ liệu giả lập.');
      }
      data.asOf = new Date(now()).toISOString();
      updateMockTotals(data, vnDay(now()));
      syncLatest(data, vnDay(now()));
      cached = { data: copy(data), savedAt: data.asOf };
      return copy(data);
    },
    async addTransaction(t: NewTransaction): Promise<AddResult> {
      await delay();
      if (!token) throw new MoneyError('UNAUTHORIZED', 'Chưa có token mẫu.');
      if (submitError) {
        const error = submitError; submitError = null;
        throw new MoneyError(error.code, 'Lỗi gửi dữ liệu giả lập.', error.field);
      }
      if (!['Thu', 'Chi', 'Chuyển'].includes(t.type)) throw new MoneyError('VALIDATION', 'Loại giao dịch chưa hỗ trợ.', 'type');
      if (!Number.isSafeInteger(t.amount) || t.amount <= 0) throw new MoneyError('VALIDATION', 'Nhập số tiền nguyên dương bằng VND.', 'amount');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date) || !Number.isFinite(Date.parse(`${t.date}T00:00:00Z`)) || new Date(`${t.date}T00:00:00Z`).toISOString().slice(0, 10) !== t.date) throw new MoneyError('VALIDATION', 'Chọn ngày hợp lệ.', 'date');
      const exists = (code: string) => data.accounts.some(a => a.code === code);
      if (t.type === 'Thu' ? t.from !== 'Ngoài' : !exists(t.from)) throw new MoneyError('VALIDATION', 'Tài khoản nguồn chưa hợp lệ.', 'from');
      if (t.type === 'Chi' ? t.to !== 'Ngoài' : !exists(t.to)) throw new MoneyError('VALIDATION', 'Tài khoản nhận chưa hợp lệ.', 'to');
      if (t.type === 'Chuyển' && t.from === t.to) throw new MoneyError('VALIDATION', 'Hai tài khoản phải khác nhau.', 'to');
      if (t.type !== 'Chuyển' && !data.meta.categories.some(c => c.type === t.type && c.name === t.category)) throw new MoneyError('VALIDATION', 'Chọn danh mục phù hợp.', 'category');
      const affected = data.accounts.filter(a => a.code === t.from || a.code === t.to);
      if (affected.some(a => !Number.isSafeInteger(a.balance + (a.code === t.to ? t.amount : -t.amount)))) throw new MoneyError('VALIDATION', 'Số tiền quá lớn.', 'amount');
      const balances: Record<string, number> = {};
      affected.forEach(a => { a.balance += a.code === t.to ? t.amount : -t.amount; balances[a.code] = a.balance; });
      const id = `MOCK-${++sequence}`;
      data.recent.push({
        id, date: t.date, type: t.type, amount: t.amount, from: t.from, to: t.to,
        category: t.category ?? '', subcategory: t.subcategory ?? '',
        party: t.party ?? '', note: t.note ?? '', source: 'App', status: 'OK',
      });
      data.recent.sort((a, b) => b.date.localeCompare(a.date) || Number(b.id.slice(5)) - Number(a.id.slice(5)));
      data.recent = data.recent.slice(0, 30);
      if (t.date.slice(0, 7) === data.month.key && t.type !== 'Chuyển') {
        data.month[t.type === 'Thu' ? 'income' : 'expense'] += t.amount;
        if (t.type === 'Chi') {
          const category = data.month.byCategory.find(c => c.category === t.category);
          if (category) category.spent += t.amount;
          else data.month.byCategory.push({ category: t.category!, budget: null, spent: t.amount });
        }
        if (t.type === 'Chi') {
          const daily = data.month.daily.find(d => d.date === t.date);
          if (daily) daily.expense += t.amount;
          else data.month.daily.push({ date: t.date, expense: t.amount });
          data.month.daily.sort((a, b) => a.date.localeCompare(b.date));
        }
        data.month.savingsRate = data.month.income === 0 ? null
          : 1 - data.month.expense / data.month.income;
      }
      updateMockTotals(data, vnDay(now()));
      syncMonth(data); syncLatest(data, vnDay(now()));
      data.asOf = new Date(now()).toISOString();
      return { id, balances };
    },
  };
  const lock: MoneyLock = {
    isSet: () => pin !== null,
    verify: value => pin !== null && value === pin,
    set: value => { pin = value; },
    clear: () => { pin = null; },
  };
  return {
    client, lock,
    controls: {
      failNextRead: code => { readError = code; },
      failNextSubmit: (code, field) => { submitError = { code, field }; },
      setEmpty: () => { applyScenario(data, 'empty'); },
      setScenario: scenario => {
        data = seed(now()); applyScenario(data, scenario);
        cached = { data: copy(data), savedAt: data.asOf };
      },
    },
  };
}
