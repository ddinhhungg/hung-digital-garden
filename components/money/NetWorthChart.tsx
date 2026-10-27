import { useState } from 'react';
import type { NetWorthPoint } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { ChartCard, PointPicker, PrivateText, dayNumber, formatDay, line, shortMoney, useChartSelection } from './ChartPrimitives';
import styles from './money.module.css';

export default function NetWorthChart({ points, hidden, today, currentYear }: { points: NetWorthPoint[]; hidden: boolean; today: string; currentYear: number }) {
  const [range, setRange] = useState<30 | 90 | 'all'>(30), [available, setAvailable] = useState(false);
  const values = points.filter(p => range === 'all' || dayNumber(p.date) >= dayNumber(today) - range + 1);
  const { ref, selected, setSelected } = useChartSelection(values.length);
  const nums = values.flatMap(p => available ? [p.netWorth, p.available] : [p.netWorth]);
  const min = nums.length ? Math.min(...nums) : 0, max = nums.length ? Math.max(...nums) : 1;
  const x = (i: number) => 48 + i / Math.max(1, values.length - 1) * 262;
  const y = (n: number) => 165 - (n - min) / (max - min || 1) * 140;
  const picked = selected === null ? null : values[selected];
  return <ChartCard title="Tài sản ròng theo thời gian" description="Theo dõi tài sản ròng và tiền khả dụng qua các ngày." summary={hidden ? 'Đã ẩn toàn bộ số liệu.' : values.length > 1 ? `Tài sản ròng từ ${values[0].netWorth.toLocaleString('vi-VN')} đ đến ${values.at(-1)!.netWorth.toLocaleString('vi-VN')} đ.` : 'Đang thu thập dữ liệu.'} cardRef={ref}>
    <div className={styles.chartControls}>{([30, 90, 'all'] as const).map((r, i) => <button key={r} className={range === r ? styles.selectedControl : ''} onClick={() => { setRange(r); setSelected(null); }} aria-pressed={range === r} aria-label={hidden ? ['Khoảng ngắn', 'Khoảng vừa', 'Tất cả'][i] : undefined}><PrivateText hidden={hidden && r !== 'all'} text={r === 'all' ? 'Tất cả' : `${r} ngày`} /></button>)}</div>
    <label className={styles.checkLabel}><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} />Thêm đường Khả dụng (nét đứt)</label>
    {values.length < 2 ? <MoneyState status="empty" title="Đang thu thập" description="Đang thu thập, cần ít nhất 2 ngày dữ liệu" /> : <>
      <svg viewBox="0 0 320 192" className={styles.plot} aria-hidden="true" onPointerDown={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setSelected(Math.max(0, Math.min(values.length - 1, Math.round(((e.clientX - rect.left) / rect.width * 320 - 48) / 262 * (values.length - 1)))));
      }}>
        {[0, .5, 1].map(t => <g key={t}><line x1={48} x2={310} y1={y(min + (max - min) * t)} y2={y(min + (max - min) * t)} stroke="var(--cream-dkr)" /><text x={0} y={y(min + (max - min) * t) + 3}>{hidden ? '•••' : shortMoney(min + (max - min) * t)}</text></g>)}
        <path d={line(values.map((p, i) => ({ x: x(i), y: y(p.netWorth) })))} fill="none" stroke="var(--sage)" strokeWidth={2} />
        {available && <path d={line(values.map((p, i) => ({ x: x(i), y: y(p.available) })))} fill="none" stroke="var(--ink-muted)" strokeWidth={1.5} strokeDasharray="5 3" />}
        <text x={48} y={188}>{hidden ? '•••' : formatDay(values[0].date, currentYear)}</text><text x={310} y={188} textAnchor="end">{hidden ? '•••' : formatDay(values.at(-1)!.date, currentYear)}</text>
        {selected !== null && <circle cx={x(selected)} cy={y(values[selected].netWorth)} r={4} fill="var(--sage)" />}
      </svg>
      <PointPicker hidden={hidden} count={values.length} selected={selected} onChange={setSelected} />
      {picked && <div className={styles.tooltip} role="status"><PrivateText text={formatDay(picked.date, currentYear)} hidden={hidden} /><div className={styles.row}>Tài sản ròng <MoneyAmount value={picked.netWorth} hidden={hidden} /></div>{available && <div className={styles.row}>Khả dụng <MoneyAmount value={picked.available} hidden={hidden} /></div>}</div>}
    </>}
  </ChartCard>;
}
