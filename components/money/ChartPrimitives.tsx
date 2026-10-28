import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './money.module.css';

export function PrivateText({ text, hidden, label = 'Đã ẩn số liệu' }: { text: string; hidden: boolean; label?: string }) {
  return <span className={styles.amount} aria-label={hidden ? label : undefined}>
    <span className={hidden ? styles.amountHidden : ''} aria-hidden={hidden}>{text}</span>
    {hidden && <span className={styles.amountDots} aria-hidden="true">••••••</span>}
  </span>;
}
export const formatDay = (day: string | null | undefined, year: number) => {
  if (!day) return '—';
  const [y, m, d] = day.slice(0, 10).split('-');
  return `${d}/${m}${Number(y) === year ? '' : '/' + y}`;
};
export const formatMonth = (key: string) => `Tháng ${Number(key.slice(5, 7))}/${key.slice(0, 4)}`;
export const dayNumber = (day: string) => Date.parse(`${day}T00:00:00Z`) / 86400000;
export const percent = (n: number | null) => n === null ? '—' : `${Math.round(n * 100)}%`;
export const shortMoney = (n: number) => {
  const a = Math.abs(n), unit = a >= 1e9 ? 1e9 : a >= 1e6 ? 1e6 : a >= 1e3 ? 1e3 : 1;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n / unit) + (unit === 1e9 ? ' tỷ' : unit === 1e6 ? ' tr' : unit === 1e3 ? ' nghìn' : ' đ');
};
export const line = (points: { x: number; y: number }[]) => points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
export function useChartSelection(count: number) {
  const [selected, setSelected] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { setSelected(null); }, [count]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !ref.current?.contains(event.target)) setSelected(null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  return { ref, selected: selected !== null && selected < count ? selected : null, setSelected };
}
export function ChartCard({ title, description, summary, children, cardRef }: {
  title: string; description: string; summary: string; children: ReactNode;
  cardRef?: React.RefObject<HTMLElement | null>;
}) {
  return <section className={styles.chartCard} ref={cardRef} aria-label={title}>
    <h2>{title}</h2><p className={styles.chartDescription}>{description}</p>
    <p className={styles.srOnly}>{summary}</p>{children}
  </section>;
}
export function PointPicker({ count, selected, onChange, hidden = false, label = 'Chọn mốc dữ liệu' }: {
  count: number; selected: number | null; onChange: (i: number) => void; label?: string; hidden?: boolean;
}) {
  if (hidden && count > 0) return <div className={styles.chartControls} aria-label={label}>
    <button onClick={() => onChange(Math.max(0, (selected ?? count - 1) - 1))}>Mốc trước</button>
    <button onClick={() => onChange(Math.min(count - 1, (selected ?? -1) + 1))}>Mốc sau</button>
  </div>;
  return count > 0 ? <input className={styles.pointPicker} type="range" min={0} max={Math.max(0, count - 1)} step={1}
    value={selected ?? count - 1} onChange={e => onChange(Number(e.target.value))}
    aria-label={label} aria-valuetext="Dùng phím mũi tên hoặc chạm để chọn mốc" /> : null;
}
