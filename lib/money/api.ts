import { MONEY_API_URL, MONEY_TIMEOUT_MS } from './config';
import { tokenStore } from './auth';
import { readStore, removeStore, writeStore } from './storage';
import {
  MoneyError,
  type AddResult,
  type MoneyClient,
  type MoneyErrorCode,
  type NewTransaction,
  type Summary,
} from './types';

const CACHE_KEY = 'money.summary.v1';
const CODES: MoneyErrorCode[] = ['UNAUTHORIZED', 'VALIDATION', 'BUSY', 'NETWORK', 'SERVER'];

type Envelope =
  | { ok: true; data: unknown }
  | { ok: false; code?: string; message?: string; field?: string | null };

async function call(action: 'summary' | 'add', payload?: unknown): Promise<unknown> {
  const token = tokenStore.get();
  if (!token) throw new MoneyError('UNAUTHORIZED', 'Chưa có token.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MONEY_TIMEOUT_MS);

  let response: Response;
  try {
    // text/plain để là "simple request", tránh preflight mà Apps Script không hỗ trợ.
    response = await fetch(MONEY_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ token, action, payload }),
      redirect: 'follow',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
  } catch {
    throw new MoneyError('NETWORK', 'Không kết nối được mạng.');
  } finally {
    clearTimeout(timer);
  }

  let body: Envelope;
  try {
    body = (await response.json()) as Envelope;
  } catch {
    throw new MoneyError('SERVER', 'Phản hồi không đọc được.');
  }

  if (!body || typeof body !== 'object') throw new MoneyError('SERVER', 'Phản hồi không hợp lệ.');
  if (body.ok === true) return body.data;

  const code = CODES.includes(body.code as MoneyErrorCode) ? (body.code as MoneyErrorCode) : 'SERVER';
  throw new MoneyError(code, body.message || 'Có lỗi xảy ra.', body.field ?? undefined);
}

// Tách "Tên (mô tả)" thành tên và mô tả khi Sheet chưa có cột Ghi chú.
function splitName<T extends { name: string; note?: string | null }>(item: T): T {
  const name = String(item.name ?? '');
  if (item.note) return { ...item, name };
  const m = name.match(/^(.*\S)\s*\(([^()]+)\)\s*$/);
  return m ? { ...item, name: m[1], note: m[2] } : { ...item, name, note: null };
}

// Chấp nhận bản Apps Script cũ (chưa có phần dashboard) bằng giá trị mặc định rỗng.
function normalize(raw: unknown): Summary {
  const s = raw as Partial<Summary> | null;
  if (!s || s.version !== 1 || !s.totals || !s.month || !Array.isArray(s.accounts)) {
    throw new MoneyError('SERVER', 'Dữ liệu không đúng định dạng.');
  }
  const month = { ...s.month, daily: s.month.daily ?? [] };
  return {
    ...(s as Summary),
    month,
    accounts: s.accounts.map(splitName),
    trend: s.trend ?? { netWorth: [], months: [] },
    upcoming: s.upcoming ?? [],
    portfolio: s.portfolio ?? null,
    funds: (s.funds ?? []).map(splitName),
    debts: s.debts ?? [],
    recent: s.recent ?? [],
  };
}

function saveCache(data: Summary): void {
  try {
    writeStore(CACHE_KEY, JSON.stringify({ data, savedAt: data.asOf }));
  } catch {
    /* bỏ qua */
  }
}

export function createMoneyClient(): MoneyClient {
  return {
    hasToken: () => tokenStore.has(),
    setToken: (t) => tokenStore.set(t),
    clearToken: () => {
      tokenStore.clear();
      removeStore(CACHE_KEY); // không giữ số liệu khi đã xoá token
    },
    lastSummary: () => {
      const raw = readStore(CACHE_KEY);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as { data: unknown; savedAt: string };
        return { data: normalize(parsed.data), savedAt: parsed.savedAt };
      } catch {
        return null;
      }
    },
    async getSummary() {
      const data = normalize(await call('summary'));
      saveCache(data);
      return data;
    },
    async addTransaction(t: NewTransaction): Promise<AddResult> {
      const result = (await call('add', t)) as AddResult;
      if (!result || typeof result.id !== 'string') throw new MoneyError('SERVER', 'Phản hồi không hợp lệ.');
      return result;
    },
  };
}
