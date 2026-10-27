import type { MonthFlow } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { ChartCard, PointPicker, PrivateText, formatMonth, shortMoney, useChartSelection } from './ChartPrimitives';
import styles from './money.module.css';

export default function FlowBars({ months, hidden, today }: { months: MonthFlow[]; hidden: boolean; today: string }) {
  const values = months.slice(-6), max = Math.max(1, ...values.flatMap(m => [m.income, m.expense]));
  const { ref, selected, setSelected } = useChartSelection(values.length);
  const step = 268 / Math.max(1, values.length), picked = selected === null ? null : values[selected];
  return <ChartCard title="Thu chi các tháng" description="Cột trái: thu vào. Cột phải, nét viền: chi ra." summary={hidden ? 'Đã ẩn toàn bộ số liệu.' : values.map(m => `${formatMonth(m.key)}: thu ${m.income.toLocaleString('vi-VN')} đ, chi ${m.expense.toLocaleString('vi-VN')} đ`).join('. ')} cardRef={ref}>
    {!values.length ? <MoneyState status="empty" title="Chưa có lịch sử thu chi" description="Các tháng có dữ liệu sẽ xuất hiện ở đây." /> : <>
      <svg className={styles.plot} viewBox="0 0 320 202" aria-hidden="true" onPointerDown={e => { const r = e.currentTarget.getBoundingClientRect(); setSelected(Math.max(0, Math.min(values.length - 1, Math.floor(((e.clientX - r.left) / r.width * 320 - 44) / step)))); }}>
        {[0, .5, 1].map(t => <g key={t}><text x={0} y={169 - 140 * t}>{hidden ? '•••' : shortMoney(max * t)}</text><line x1={44} x2={312} y1={166 - 140 * t} y2={166 - 140 * t} stroke="var(--cream-dkr)" /></g>)}
        {values.map((m, i) => <g key={m.key}><rect x={44 + i * step + step * .16} y={166 - m.income / max * 140} width={step * .27} height={m.income / max * 140} fill="var(--sage)" /><rect x={44 + i * step + step * .5} y={166 - m.expense / max * 140} width={step * .27} height={m.expense / max * 140} fill="var(--tomato-lt)" stroke="var(--tomato)" strokeDasharray="3 2" /><text x={44 + (i + .5) * step} y={183} textAnchor="middle">{hidden ? '•••' : `${m.key.slice(5)}/${m.key.slice(2, 4)}`}</text>{m.key === today.slice(0, 7) && <text x={44 + (i + .5) * step} y={198} textAnchor="middle">hiện tại</text>}</g>)}
      </svg><PointPicker hidden={hidden} count={values.length} selected={selected} onChange={setSelected} />
      {values.some(m => m.key === today.slice(0, 7)) && <p className={styles.chartDescription}><PrivateText text={formatMonth(today.slice(0, 7))} hidden={hidden} /> · đang diễn ra</p>}
      {picked && <div className={styles.tooltip} role="status"><PrivateText text={formatMonth(picked.key)} hidden={hidden} /><div className={styles.row}>Thu <MoneyAmount value={picked.income} hidden={hidden} direction="in" /></div><div className={styles.row}>Chi <MoneyAmount value={picked.expense} hidden={hidden} direction="out" /></div></div>}
    </>}
  </ChartCard>;
}
