import type { Summary } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { ChartCard, PointPicker, PrivateText, formatDay, line, shortMoney, useChartSelection } from './ChartPrimitives';
import styles from './money.module.css';

export default function PacingChart({ month, today, hidden, currentYear }: { month: Summary['month']; today: string; hidden: boolean; currentYear: number }) {
  const [year, m] = month.key.split('-').map(Number);
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const elapsed = month.key < today.slice(0, 7) ? count : month.key === today.slice(0, 7) ? Number(today.slice(8)) : 0;
  const budget = month.byCategory.reduce((n, c) => n + (c.budget ?? 0), 0);
  const days = new Map<string, number>(); month.daily.forEach(d => days.set(d.date, (days.get(d.date) ?? 0) + d.expense));
  let cumulative = 0;
  const points = Array.from({ length: elapsed }, (_, i) => { const date = `${month.key}-${String(i + 1).padStart(2, '0')}`; cumulative += days.get(date) ?? 0; return { date, value: cumulative }; });
  const { ref, selected, setSelected } = useChartSelection(points.length);
  const max = Math.max(1, budget, ...points.map(p => p.value));
  const x = (day: number) => 44 + day / count * 268, y = (n: number) => 165 - n / max * 140;
  const picked = selected === null ? null : points[selected];
  return <ChartCard title="Nhịp chi tiêu tháng này" description="Nét liền: chi cộng dồn. Nét đứt: tổng ngân sách phân bổ đều theo ngày." summary={hidden ? 'Đã ẩn toàn bộ số liệu.' : `Đã chi ${month.expense.toLocaleString('vi-VN')} đ trên ngân sách ${budget.toLocaleString('vi-VN')} đ.`} cardRef={ref}>
    {!month.daily.length && !month.byCategory.length ? <MoneyState status="empty" title="Chưa có nhịp chi tiêu" description="Biểu đồ sẽ xuất hiện khi có dữ liệu chi tiêu hoặc ngân sách." /> : <>
      <svg viewBox="0 0 320 195" className={styles.plot} aria-hidden="true" onPointerDown={e => { if (!points.length) return; const r = e.currentTarget.getBoundingClientRect(); setSelected(Math.max(0, Math.min(points.length - 1, Math.round(((e.clientX - r.left) / r.width * 320 - 44) / 268 * count) - 1))); }}>
        {[0, .5, 1].map(t => <g key={t}><line x1={44} x2={312} y1={y(max * t)} y2={y(max * t)} stroke="var(--cream-dkr)" /><text x={0} y={y(max * t) + 3}>{hidden ? '•••' : shortMoney(max * t)}</text></g>)}
        <path d={`M44,165 L312,${y(budget)}`} fill="none" stroke="var(--ink-muted)" strokeDasharray="5 3" />
        <path d={line([{ x: 44, y: 165 }, ...points.map((p, i) => ({ x: x(i + 1), y: y(p.value) }))])} fill="none" stroke="var(--tomato)" strokeWidth={2} />
        <text x={44} y={187}>{hidden ? '•••' : 'Ngày 1'}</text><text x={312} y={187} textAnchor="end">{hidden ? '•••' : `Ngày ${count}`}</text>
      </svg><PointPicker hidden={hidden} count={points.length} selected={selected} onChange={setSelected} />
      <p className={styles.pacingText}>Đã chi <MoneyAmount value={month.expense} hidden={hidden} size="small" /> trên ngân sách <MoneyAmount value={budget} hidden={hidden} size="small" /> · ngày <PrivateText text={`${elapsed}/${count}`} hidden={hidden} /></p>
      {picked && <div className={styles.tooltip} role="status"><PrivateText text={formatDay(picked.date, currentYear)} hidden={hidden} /> · Chi cộng dồn <MoneyAmount value={picked.value} hidden={hidden} /></div>}
    </>}
  </ChartCard>;
}
