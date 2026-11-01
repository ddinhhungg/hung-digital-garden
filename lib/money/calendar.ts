// Tính lưới tháng cho lịch. Tuần bắt đầu từ thứ hai, giờ Việt Nam không ảnh hưởng vì chỉ tính theo chuỗi ngày.
export const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
export const WEEKDAYS_LONG = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

export interface GridCell { date: string; day: number; inMonth: boolean }

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function monthGrid(key: string): GridCell[] {
  const [y, m] = key.split('-').map(Number);
  const first = Date.UTC(y, m - 1, 1);
  const lead = (new Date(first).getUTCDay() + 6) % 7;
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const total = Math.ceil((lead + dim) / 7) * 7;
  return Array.from({ length: total }, (_, i) => {
    const ms = first + (i - lead) * 86_400_000;
    const date = iso(ms);
    return { date, day: Number(date.slice(8)), inMonth: date.startsWith(key) };
  });
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

export function dayTitle(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${WEEKDAYS_LONG[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]}, ${d}/${m}`;
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}
