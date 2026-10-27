import type { Summary } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { formatMonth } from './ChartPrimitives';
import styles from './money.module.css';

export default function MonthPanel({ month, hidden }: { month: Summary['month']; hidden: boolean }) {
  return <><div className={styles.hero}><p className={styles.eyebrow}>Đã chi · {formatMonth(month.key)}</p><div className={styles.heroValue}><MoneyAmount value={month.expense} hidden={hidden} size="large" /></div></div>
    {!month.byCategory.length && <MoneyState status="empty" title="Chưa có chi tiêu tháng này" description="Các khoản chi sẽ được tổng hợp tại đây." />}
    {[...month.byCategory].sort((a, b) => b.spent - a.spent).map(c => {
      const over = c.budget !== null && c.spent > c.budget;
      return <article className={styles.spend} key={c.category}><div className={styles.row}><span>{c.category}</span><MoneyAmount value={c.spent} hidden={hidden} direction={over ? 'out' : 'neutral'} /></div>
        {c.budget !== null ? <><div className={styles.track} aria-hidden="true"><div className={`${styles.fill} ${over ? styles.over : ''}`} style={{ width: `${Math.min(100, c.budget > 0 ? c.spent / c.budget * 100 : c.spent > 0 ? 100 : 0)}%` }} /></div><div className={styles.row}><small>Ngân sách <MoneyAmount value={c.budget} hidden={hidden} size="small" /></small>{over && <small className={styles.bad}>Vượt <MoneyAmount value={c.spent - c.budget} hidden={hidden} size="small" /></small>}</div></> : <small className={styles.muted}>Chưa đặt ngân sách</small>}
      </article>;
    })}</>;
}
