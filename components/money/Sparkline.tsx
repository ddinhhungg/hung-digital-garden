import type { NetWorthPoint } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { PrivateText, PointPicker, formatDay, line, useChartSelection } from './ChartPrimitives';
import styles from './money.module.css';

export default function Sparkline({ points, hidden, currentYear }: { points: NetWorthPoint[]; hidden: boolean; currentYear: number }) {
  const values = points.slice(-30);
  const { ref, selected, setSelected } = useChartSelection(values.length);
  if (values.length < 2) return null;
  const min = Math.min(...values.map(p => p.netWorth)), max = Math.max(...values.map(p => p.netWorth));
  const path = line(values.map((p, i) => ({ x: 3 + i / (values.length - 1) * 314, y: 45 - (p.netWorth - min) / (max - min || 1) * 36 })));
  return <section ref={ref} className={styles.sparkline} aria-label="Xu hướng tài sản ròng gần đây">
    <svg viewBox="0 0 320 50" aria-hidden="true" onPointerDown={e => { const r = e.currentTarget.getBoundingClientRect(); setSelected(Math.max(0, Math.min(values.length - 1, Math.round((e.clientX - r.left) / r.width * (values.length - 1))))); }}><path d={path} fill="none" stroke="var(--sage)" strokeWidth="1.6" /></svg>
    <p className={styles.srOnly}>{hidden ? 'Đã ẩn số liệu.' : 'Xu hướng tài sản ròng. Dùng thanh chọn để xem từng mốc, hoặc xem chi tiết trong tab Biểu đồ.'}</p>
    <PointPicker hidden={hidden} count={values.length} selected={selected} onChange={setSelected} label="Chọn mốc trên đường xu hướng" />
    {selected !== null && <div className={styles.tooltip} role="status"><PrivateText text={formatDay(values[selected].date, currentYear)} hidden={hidden} /> · <MoneyAmount value={values[selected].netWorth} hidden={hidden} /></div>}
  </section>;
}
