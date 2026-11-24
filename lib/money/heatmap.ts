import type { DailySpend, DayFlow } from './types';
import { daysBetween } from './calendar';

export type Metric = 'expense' | 'income';
export type Level = 0 | 1 | 2 | 3 | 4;

const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const DAY = 86_400_000;
export const addDays = (date: string, n: number) => iso(Date.parse(`${date}T00:00:00Z`) + n * DAY);
/** 0 = thứ hai ... 6 = chủ nhật. */
export const weekdayIndex = (date: string) => (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7;
export const mondayOf = (date: string) => addDays(date, -weekdayIndex(date));
export const daysInMonth = (key: string) => new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)), 0)).getUTCDate();

/** Chuyển dữ liệu theo ngày thành bản đồ ngày → thu/chi. Nếu Apps Script cũ chưa có dữ liệu nhiều tháng thì dùng chi tiêu tháng hiện tại. */
export function dayMap(daily: DayFlow[] | undefined, monthDaily: DailySpend[]): { map: Map<string, DayFlow>; full: boolean } {
  const map = new Map<string, DayFlow>();
  if (daily) {
    for (const d of daily) map.set(d.date, d);
    return { map, full: true };
  }
  for (const d of monthDaily) map.set(d.date, { date: d.date, income: 0, expense: d.expense });
  return { map, full: false };
}

/** Mức tô màu: lấy ngưỡng là phân vị 90 của các ngày có phát sinh để một ngày chi rất lớn không làm nhạt cả bảng. */
export function capOf(map: Map<string, DayFlow>, metric: Metric): number {
  const values = [...map.values()].map(d => d[metric]).filter(v => v > 0).sort((a, b) => a - b);
  if (!values.length) return 1;
  return Math.max(1, values[Math.min(values.length - 1, Math.floor(values.length * 0.9))]);
}

export function levelOf(value: number, cap: number): Level {
  if (value <= 0) return 0;
  const r = value / cap;
  return r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4;
}

/** Số gọn để ghi trong ô nhỏ: 230k, 1,2tr. */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n / 1_000_000)}tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export interface MonthStats { total: number; perDay: number; best: { date: string; value: number } | null; activeDays: number }

/** Tổng, trung bình mỗi ngày (tính đến hôm nay nếu là tháng đang diễn ra), ngày cao nhất của một tháng. */
export function monthStats(map: Map<string, DayFlow>, key: string, metric: Metric, today: string): MonthStats {
  let total = 0, activeDays = 0;
  let best: MonthStats['best'] = null;
  for (const d of map.values()) {
    if (!d.date.startsWith(key)) continue;
    const v = d[metric];
    if (v <= 0) continue;
    total += v; activeDays += 1;
    if (!best || v > best.value) best = { date: d.date, value: v };
  }
  const dim = daysInMonth(key);
  const elapsed = today.startsWith(key) ? Number(today.slice(8)) : today < `${key}-01` ? 0 : dim;
  return { total, perDay: elapsed > 0 ? Math.round(total / elapsed) : 0, best, activeDays };
}

/** Lưới các tuần (cột) cho chế độ 6 tháng. Mỗi tuần là 7 ngày từ thứ hai. */
export function weekColumns(today: string, weeks: number): string[][] {
  const lastMonday = mondayOf(today);
  return Array.from({ length: weeks }, (_, w) => {
    const monday = addDays(lastMonday, -(weeks - 1 - w) * 7);
    return Array.from({ length: 7 }, (_, d) => addDays(monday, d));
  });
}

/** Trung bình theo thứ trong tuần (T2..CN) trong các tuần đã cho, tính cả ngày không phát sinh, bỏ ngày tương lai. */
export function weekdayAverages(map: Map<string, DayFlow>, columns: string[][], metric: Metric, today: string): number[] {
  const sums = Array(7).fill(0) as number[], counts = Array(7).fill(0) as number[];
  for (const col of columns) col.forEach((date, i) => {
    if (daysBetween(date, today) < 0) return;
    sums[i] += map.get(date)?.[metric] ?? 0; counts[i] += 1;
  });
  return sums.map((s, i) => counts[i] ? Math.round(s / counts[i]) : 0);
}
