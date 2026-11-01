import { useMemo, useState } from 'react';
import type { CalendarItem } from '../../lib/money/types';
import { WEEKDAYS, daysBetween, monthGrid, shiftMonth } from '../../lib/money/calendar';
import { itemEmoji } from '../../lib/money/emoji';
import MoneyAmount from './MoneyAmount';
import { MoneyIcon } from './MoneyShell';
import styles from './money.module.css';

export interface CalendarCardProps {
  items: CalendarItem[];
  hidden: boolean;
  today: string;
  onOpen: (focus: { month: string; date: string | null; form: boolean }) => void;
}

const monthLabel = (key: string) => `Tháng ${Number(key.slice(5))}`;

// Lịch giấy để bàn: lưới tháng, mỗi ngày có sticker + chấm xanh (thu) / đỏ (chi).
// Chấm viền nét đứt = khoản dự kiến chưa chắc.
export default function CalendarCard({ items, hidden, today, onOpen }: CalendarCardProps) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) map.set(item.date, [...(map.get(item.date) ?? []), item]);
    return map;
  }, [items]);
  const cells = useMemo(() => monthGrid(month), [month]);

  const upcoming = useMemo(
    () => items.filter(i => i.date >= today && i.status === 'Chờ').slice(0, 3),
    [items, today],
  );
  const monthItems = items.filter(i => i.date.startsWith(month) && i.status === 'Chờ' && i.certain && i.amount);
  const sum = (kind: CalendarItem['kind']) => monthItems.filter(i => i.kind === kind).reduce((n, i) => n + (i.amount ?? 0), 0);

  const dayItems = selected ? byDate.get(selected) ?? [] : [];
  const noteItems = selected ? dayItems : upcoming;
  const notePrefix = (item: CalendarItem) => {
    if (selected) return '';
    const left = daysBetween(today, item.date);
    return left === 0 ? 'hôm nay' : left === 1 ? 'mai' : `còn ${left} ngày`;
  };

  return <section className={`${styles.card} ${styles.calCard}`} aria-label="Lịch thu chi">
    <div className={styles.calRings} aria-hidden="true"><span /><span /><span /><span /></div>
    <div className={styles.calHead}>
      <button type="button" className={styles.calNav} onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Tháng trước">
        <MoneyIcon path="M15 6l-6 6 6 6" />
      </button>
      <div className={styles.calTitle}>
        <h2>{monthLabel(month)}</h2>
        <span>{month.slice(0, 4)}</span>
        {month !== today.slice(0, 7) && <button type="button" className={styles.calToday} onClick={() => { setMonth(today.slice(0, 7)); setSelected(null); }}>về hôm nay</button>}
      </div>
      <button type="button" className={styles.calNav} onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Tháng sau">
        <MoneyIcon path="M9 6l6 6-6 6" />
      </button>
    </div>

    <div className={styles.calWeek} aria-hidden="true">
      {WEEKDAYS.map((w, i) => <span key={w} className={i === 6 ? styles.calSun : ''}>{w}</span>)}
    </div>
    <div className={styles.calGrid} role="grid" aria-label={`${monthLabel(month)} ${month.slice(0, 4)}`}>
      {cells.map(cell => {
        const list = (byDate.get(cell.date) ?? []).filter(i => i.status !== 'Huỷ');
        const pending = list.filter(i => i.status !== 'Đã xong');
        const lead = pending[0] ?? list[0];
        const isToday = cell.date === today;
        const isSel = cell.date === selected;
        const cls = [
          styles.calCell,
          cell.inMonth ? '' : styles.calOut,
          isSel ? styles.calSelected : '',
          list.length && !pending.length ? styles.calDone : '',
        ].join(' ');
        const label = `${cell.day}/${Number(cell.date.slice(5, 7))}${list.length ? `, ${list.length} khoản` : ''}${isToday ? ', hôm nay' : ''}`;
        return <button
          key={cell.date} type="button" role="gridcell" className={cls} aria-label={label}
          aria-pressed={isSel} onClick={() => setSelected(isSel ? null : cell.date)}
        >
          <span className={`${styles.calNum} ${isToday ? styles.calNow : ''}`}>{cell.day}</span>
          {lead && <span className={styles.calSticker} aria-hidden="true">{itemEmoji(lead.label)}</span>}
          {list.length > 0 && <span className={styles.calDots} aria-hidden="true">
            {list.slice(0, 3).map((i, n) => <i key={n} className={`${i.kind === 'in' ? styles.dotIn : styles.dotOut} ${i.certain ? '' : styles.dotMaybe}`} />)}
          </span>}
        </button>;
      })}
    </div>

    <div className={styles.postit}>
      <div className={styles.postitHead}>
        <b>{selected ? `Ngày ${Number(selected.slice(8))}/${Number(selected.slice(5, 7))}` : 'Sắp tới nè'}</b>
        <span aria-hidden="true">✎</span>
      </div>
      {noteItems.length === 0
        ? <p className={styles.postitEmpty}>{selected ? 'Ngày này trống, thảnh thơi.' : 'Chưa có lịch nào. Bấm "Thêm kế hoạch" để ghi lại nhé.'}</p>
        : <ul>{noteItems.map((item, i) => <li key={`${item.date}-${item.label}-${i}`}>
          <span className={styles.postitDate}>{selected ? itemEmoji(item.label) : `${Number(item.date.slice(8))}/${Number(item.date.slice(5, 7))}`}</span>
          <span className={styles.postitText}>
            <span>{!selected && <span aria-hidden="true">{itemEmoji(item.label)} </span>}{item.label}</span>
            {!selected && <small>{notePrefix(item)}{item.certain ? '' : ' · dự kiến'}</small>}
            {selected && (!item.certain || item.status === 'Đã xong') && <small>{[!item.certain && 'dự kiến', item.status === 'Đã xong' && 'đã xong'].filter(Boolean).join(' · ')}</small>}
          </span>
          {item.amount !== null
            ? <MoneyAmount value={item.amount} hidden={hidden} sign={item.kind === 'in' ? '+' : '−'} direction={item.kind} size="small" />
            : <em className={styles.unknownAmount}>chưa rõ</em>}
        </li>)}</ul>}
      {selected && <button type="button" className={styles.postitAdd} onClick={() => onOpen({ month, date: selected, form: true })}>＋ ghi kế hoạch cho ngày này</button>}
    </div>

    <div className={styles.calFoot}>
      <span className={styles.calTotals}>
        <small>{monthLabel(month)} chắc chắn</small>
        <span>vào <MoneyAmount value={sum('in')} hidden={hidden} direction="in" size="small" /></span>
        <span>ra <MoneyAmount value={sum('out')} hidden={hidden} direction="out" size="small" /></span>
      </span>
    </div>
    <div className={styles.calActions}>
      <button type="button" className={styles.calGhost} onClick={() => onOpen({ month, date: selected, form: true })}>＋ Thêm kế hoạch</button>
      <button type="button" className={styles.calMain} onClick={() => onOpen({ month, date: selected, form: false })}>Xem chi tiết lịch →</button>
    </div>
  </section>;
}
