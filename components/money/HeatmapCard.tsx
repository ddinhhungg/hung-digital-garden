import { useMemo, useState } from 'react';
import type { DailySpend, DayFlow } from '../../lib/money/types';
import { WEEKDAYS, dayTitle, monthGrid, shiftMonth } from '../../lib/money/calendar';
import {
  capOf, compact, dayMap, levelOf, monthStats, weekColumns, weekdayAverages, type Level, type Metric,
} from '../../lib/money/heatmap';
import MoneyAmount from './MoneyAmount';
import { ChartCard, PrivateText, formatDay } from './ChartPrimitives';
import styles from './money.module.css';

const WEEKS = 27; // khoảng 6 tháng
const LEVEL_CLASS = [styles.heatL0, styles.heatL1, styles.heatL2, styles.heatL3, styles.heatL4];
const money = new Intl.NumberFormat('vi-VN');

export interface HeatmapCardProps {
  daily: DayFlow[] | undefined;
  monthDaily: DailySpend[];
  today: string; currentYear: number; hidden: boolean;
  onOpenDay: (date: string, metric: Metric) => void;
}

// Heatmap theo lịch: màu càng đậm càng chi (hoặc thu) nhiều. Xem theo tháng (có tổng từng tuần) hoặc 6 tháng.
export default function HeatmapCard({ daily, monthDaily, today, currentYear, hidden, onOpenDay }: HeatmapCardProps) {
  const [metric, setMetric] = useState<Metric>('expense');
  const [view, setView] = useState<'month' | '6m'>('month');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState<string | null>(null);

  const { map, full } = useMemo(() => dayMap(daily, monthDaily), [daily, monthDaily]);
  const m: Metric = full ? metric : 'expense';
  const cap = useMemo(() => capOf(map, m), [map, m]);
  const stats = useMemo(() => monthStats(map, month, m, today), [map, month, m, today]);
  const columns = useMemo(() => weekColumns(today, WEEKS), [today]);
  const averages = useMemo(() => weekdayAverages(map, columns, m, today), [map, columns, m, today]);
  const cells = useMemo(() => monthGrid(month), [month]);

  const noun = m === 'expense' ? 'chi' : 'thu';
  const valueOf = (date: string) => map.get(date)?.[m] ?? 0;
  const level = (date: string): Level => hidden || date > today ? 0 : levelOf(valueOf(date), cap);
  const cellLabel = (date: string) => {
    const v = valueOf(date);
    return `${formatDay(date, currentYear)}: ${hidden ? 'đã ẩn số liệu' : v > 0 ? `${noun} ${money.format(v)} đ` : `không ${noun}`}`;
  };
  const pick = (date: string) => setSelected(old => old === date ? null : date);
  const atCurrent = month === today.slice(0, 7);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  const weekTotal = (row: typeof cells) => row.reduce((n, c) => n + (c.inMonth ? valueOf(c.date) : 0), 0);
  const maxAvg = Math.max(1, ...averages);
  const topWeekday = averages.some(v => v > 0) ? averages.indexOf(Math.max(...averages)) : -1;
  const sel = selected ? map.get(selected) : undefined;

  const monthStarts = columns.map((col, i) => {
    const first = col.find(d => d.endsWith('-01'));
    return first && (i > 0 || col[0].slice(8) <= '07') ? { i, text: `T${Number(first.slice(5, 7))}` } : null;
  }).filter((x): x is { i: number; text: string } => x !== null);

  const heatCell = (date: string, size: 'big' | 'small') => {
    const lv = level(date);
    const future = date > today;
    return <button
      key={date} type="button" aria-label={cellLabel(date)} aria-pressed={selected === date} disabled={future}
      className={`${size === 'big' ? styles.heatCell : styles.heatDot} ${LEVEL_CLASS[lv]} ${date === today ? styles.heatToday : ''} ${selected === date ? styles.heatSel : ''}`}
      onClick={() => pick(date)}
    >
      {size === 'big' && <>
        <span className={styles.heatNum}>{Number(date.slice(8))}</span>
        {!hidden && !future && valueOf(date) > 0 && <span className={styles.heatAmt}>{compact(valueOf(date))}</span>}
      </>}
    </button>;
  };

  return <ChartCard
    title={`${m === 'expense' ? 'Chi tiêu' : 'Thu nhập'} theo ngày`}
    description="Màu càng đậm càng nhiều. Bấm vào một ngày để xem chi tiết."
    summary={hidden ? 'Đã ẩn toàn bộ số liệu.' : `Tháng ${Number(month.slice(5))}: tổng ${noun} ${money.format(stats.total)} đ, trung bình ${money.format(stats.perDay)} đ mỗi ngày.`}
  >
    <div className={`${styles.heat} ${m === 'expense' ? styles.heatExpense : styles.heatIncome}`}>
      <div className={styles.heatTools}>
        {full && <div className={styles.segmentsSmall} role="group" aria-label="Loại số liệu">
          <button type="button" aria-pressed={metric === 'expense'} onClick={() => { setMetric('expense'); setSelected(null); }}>Chi</button>
          <button type="button" aria-pressed={metric === 'income'} onClick={() => { setMetric('income'); setSelected(null); }}>Thu</button>
        </div>}
        <div className={styles.segmentsSmall} role="group" aria-label="Cách xem">
          <button type="button" aria-pressed={view === 'month'} onClick={() => setView('month')}>Theo tháng</button>
          <button type="button" aria-pressed={view === '6m'} onClick={() => setView('6m')}>6 tháng</button>
        </div>
      </div>

      {!full && <p className={styles.heatNote}>Mới có chi tiêu của tháng này. Cập nhật Apps Script lên bản 1.8 để xem nhiều tháng và cả khoản thu.</p>}

      {view === 'month' && <>
        <div className={styles.heatNav}>
          <button type="button" className={styles.calNav} disabled={!full} onClick={() => { setMonth(shiftMonth(month, -1)); setSelected(null); }} aria-label="Tháng trước">‹</button>
          <b>Tháng {Number(month.slice(5))}, {month.slice(0, 4)}</b>
          <button type="button" className={styles.calNav} disabled={!full || atCurrent} onClick={() => { setMonth(shiftMonth(month, 1)); setSelected(null); }} aria-label="Tháng sau">›</button>
        </div>
        <div className={styles.heatGrid} role="group" aria-label={`Lịch ${noun} tháng ${Number(month.slice(5))}`}>
          {WEEKDAYS.map((w, i) => <span key={w} className={`${styles.heatHead} ${i === 6 ? styles.calSun : ''}`} aria-hidden="true">{w}</span>)}
          <span className={styles.heatHead} aria-hidden="true">Tuần</span>
          {weeks.map(row => <WeekRow key={row[0].date} row={row} heatCell={heatCell}
            total={hidden ? null : weekTotal(row)} />)}
        </div>
        <div className={styles.heatStats}>
          <div><span>Cả tháng</span><b><MoneyAmount value={stats.total} hidden={hidden} direction={m === 'expense' ? 'out' : 'in'} size="small" /></b></div>
          <div><span>Mỗi ngày</span><b><MoneyAmount value={stats.perDay} hidden={hidden} size="small" /></b></div>
          <div><span>Cao nhất</span><b>{stats.best ? <><PrivateText text={formatDay(stats.best.date, currentYear)} hidden={hidden} /> · <MoneyAmount value={stats.best.value} hidden={hidden} size="small" /></> : '—'}</b></div>
        </div>
      </>}

      {view === '6m' && <>
        <div className={styles.heatYear}>
          <div className={styles.heatYearMonths} style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }} aria-hidden="true">
            {monthStarts.map(s => <span key={s.i} style={{ gridColumn: s.i + 1 }}>{s.text}</span>)}
          </div>
          <div className={styles.heatYearBody}>
            <div className={styles.heatYearDays} aria-hidden="true"><span>T2</span><span /><span>T4</span><span /><span>T6</span><span /><span>CN</span></div>
            <div className={styles.heatYearGrid} style={{ gridTemplateColumns: `repeat(${WEEKS}, 1fr)` }} role="group" aria-label={`Lịch ${noun} 6 tháng`}>
              {columns.map(col => <div key={col[0]} className={styles.heatYearCol}>{col.map(date => heatCell(date, 'small'))}</div>)}
            </div>
          </div>
        </div>
        <p className={styles.heatSub}>Trung bình theo thứ trong tuần</p>
        <div className={styles.heatWeekdays}>
          {averages.map((v, i) => <div key={WEEKDAYS[i]} className={i === topWeekday ? styles.heatTop : ''}>
            <span className={styles.heatBar}><i style={{ height: `${hidden ? 8 : Math.max(4, v / maxAvg * 100)}%` }} /></span>
            <span>{WEEKDAYS[i]}</span>
            <small>{hidden ? '•••' : compact(v)}</small>
          </div>)}
        </div>
        {topWeekday >= 0 && !hidden && <p className={styles.heatNote}>{m === 'expense' ? 'Chi' : 'Thu'} nhiều nhất vào {WEEKDAYS[topWeekday] === 'CN' ? 'chủ nhật' : `thứ ${topWeekday + 2}`}, trung bình {money.format(averages[topWeekday])} đ mỗi ngày.</p>}
      </>}

      <div className={styles.heatLegend} aria-hidden="true">
        <span>Ít</span>{LEVEL_CLASS.map((c, i) => <i key={i} className={c} />)}<span>Nhiều</span>
      </div>

      {selected && <div className={styles.tooltip} role="status">
        <div className={styles.row}><b>{dayTitle(selected)}</b>{selected === today && <span className={styles.dayNow}>hôm nay</span>}</div>
        <div className={styles.row}><span>Chi</span><MoneyAmount value={sel?.expense ?? 0} hidden={hidden} direction="out" size="small" /></div>
        <div className={styles.row}><span>Thu</span><MoneyAmount value={sel?.income ?? 0} hidden={hidden} direction="in" size="small" /></div>
        <button type="button" className={styles.heatOpen} onClick={() => onOpenDay(selected, m)}>Xem giao dịch ngày này →</button>
      </div>}
    </div>
  </ChartCard>;
}

function WeekRow({ row, heatCell, total }: {
  row: { date: string; day: number; inMonth: boolean }[];
  heatCell: (date: string, size: 'big' | 'small') => React.ReactNode;
  total: number | null;
}) {
  return <>
    {row.map(c => c.inMonth ? heatCell(c.date, 'big') : <span key={c.date} className={styles.heatBlank} aria-hidden="true" />)}
    <span className={styles.heatWeek}>{total === null ? '•••' : total > 0 ? compact(total) : '—'}</span>
  </>;
}
