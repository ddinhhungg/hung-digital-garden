import type { UpcomingItem } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { formatDay } from './ChartPrimitives';
import styles from './money.module.css';

export default function UpcomingList({ items, hidden, currentYear }: { items: UpcomingItem[]; hidden: boolean; currentYear: number }) {
  if (!items.length) return null;
  const total = (kind: UpcomingItem['kind']) => items.filter(i => i.kind === kind).reduce((n, i) => n + i.amount, 0);
  return <section className={styles.section}><h2>Sắp tới</h2><p className={styles.chartDescription}>Dự kiến, chưa trừ khoản đã ghi.</p>
    <ul className={styles.list}>{items.slice(0, 5).map((item, i) => <li key={`${item.date}-${i}`} className={styles.upcomingRow}><span className={styles.txDate}>{formatDay(item.date, currentYear)}</span><span>{item.label}</span><MoneyAmount value={item.amount} hidden={hidden} sign={item.kind === 'in' ? '+' : '−'} direction={item.kind} size="small" /></li>)}</ul>
    <p className={styles.upcomingTotal}>30 ngày tới: vào <MoneyAmount value={total('in')} hidden={hidden} direction="in" size="small" />, ra <MoneyAmount value={total('out')} hidden={hidden} direction="out" size="small" /></p>
  </section>;
}
