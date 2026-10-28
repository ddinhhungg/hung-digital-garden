import type { Account, UpcomingItem } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { itemEmoji } from '../../lib/money/emoji';
import styles from './money.module.css';

export default function UpcomingList({ items, accounts, hidden, today }: {
  items: UpcomingItem[]; accounts: Account[]; hidden: boolean; today: string;
}) {
  if (!items.length) return null;
  const total = (kind: UpcomingItem['kind']) => items.filter(i => i.kind === kind).reduce((n, i) => n + i.amount, 0);
  const accountName = (code: string | null) => code ? accounts.find(a => a.code === code)?.name ?? code : null;
  return <section className={styles.card}>
    <div className={styles.cardHead}><h2>Sắp tới</h2><span className={styles.cardMeta}>30 ngày</span></div>
    <ul className={styles.list}>{items.slice(0, 6).map((item, i) => {
      const [, m, d] = item.date.split('-');
      const isToday = item.date === today;
      return <li key={`${item.date}-${i}`} className={styles.itemRow}>
        <span className={`${styles.dateBadge} ${isToday ? styles.dateToday : ''}`}><b>{d}</b><small>{isToday ? 'Hôm nay' : `Th${Number(m)}`}</small></span>
        <span className={styles.itemText}><span><span className={styles.emoji} aria-hidden="true">{itemEmoji(item.label)}</span>{item.label}</span>{accountName(item.account) && <small>{accountName(item.account)}</small>}</span>
        <MoneyAmount value={item.amount} hidden={hidden} sign={item.kind === 'in' ? '+' : '−'} direction={item.kind} size="small" />
      </li>;
    })}</ul>
    <div className={styles.cardFoot}>
      <span>Dự kiến vào <MoneyAmount value={total('in')} hidden={hidden} direction="in" size="small" /></span>
      <span>ra <MoneyAmount value={total('out')} hidden={hidden} direction="out" size="small" /></span>
    </div>
  </section>;
}
