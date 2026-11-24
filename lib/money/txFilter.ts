import type { Transaction } from './types';
import { stripMarks } from './categories';
import { daysBetween, shiftMonth } from './calendar';

export type RangeKey = 'all' | 'today' | '7d' | 'month' | 'lastMonth' | 'custom';
export type TypeKey = 'all' | 'Chi' | 'Thu' | 'Chuyển' | 'Nợ' | 'Điều chỉnh' | 'Void';

export interface TxFilter { range: RangeKey; from: string; to: string; type: TypeKey; query: string }

export const rangeChips: { key: RangeKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' }, { key: 'today', label: 'Hôm nay' }, { key: '7d', label: '7 ngày' },
  { key: 'month', label: 'Tháng này' }, { key: 'lastMonth', label: 'Tháng trước' }, { key: 'custom', label: 'Chọn ngày' },
];
export const typeChips: { key: TypeKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' }, { key: 'Chi', label: 'Chi' }, { key: 'Thu', label: 'Thu' },
  { key: 'Chuyển', label: 'Chuyển' }, { key: 'Nợ', label: 'Vay, nợ' }, { key: 'Điều chỉnh', label: 'Điều chỉnh' },
  { key: 'Void', label: 'Đã huỷ' },
];
const debtTypes = ['Vay', 'Cho vay', 'Trả nợ', 'Thu nợ'];

export function matchesType(t: Transaction, type: TypeKey): boolean {
  if (type === 'Void') return t.status === 'Void';
  if (t.status === 'Void') return false;
  if (type === 'all') return true;
  if (type === 'Nợ') return debtTypes.includes(t.type);
  return t.type === type;
}

function matchesRange(date: string, f: TxFilter, today: string): boolean {
  switch (f.range) {
    case 'all': return true;
    case 'today': return date === today;
    case '7d': { const d = daysBetween(date, today); return d >= 0 && d <= 6; }
    case 'month': return date.startsWith(today.slice(0, 7));
    case 'lastMonth': return date.startsWith(shiftMonth(today.slice(0, 7), -1));
    case 'custom': return (!f.from || date >= f.from) && (!f.to || date <= f.to);
  }
}

export function filterTransactions(list: Transaction[], f: TxFilter, today: string): Transaction[] {
  const q = stripMarks(f.query.trim());
  return list.filter(t => {
    if (!matchesType(t, f.type) || !matchesRange(t.date, f, today)) return false;
    if (!q) return true;
    return stripMarks([t.category, t.subcategory, t.party, t.note, t.type, t.from, t.to].join(' ')).includes(q);
  });
}

/** Tổng thu và chi của danh sách (chỉ loại Thu, Chi; chuyển, nợ và điều chỉnh không tính vào thu chi). */
export function totalsOf(list: Transaction[]): { income: number; expense: number } {
  let income = 0, expense = 0;
  for (const t of list) {
    if (t.status !== 'OK') continue;
    if (t.type === 'Thu') income += t.amount; else if (t.type === 'Chi') expense += t.amount;
  }
  return { income, expense };
}
