import type { Account } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import styles from './money.module.css';

const sum = (list: Account[]) => list.reduce((n, a) => n + a.balance, 0);

export default function AccountList({ accounts, hidden }: { accounts: Account[]; hidden: boolean }) {
  const normal = accounts.filter(a => a.fundCode === null);
  const pockets = accounts.filter(a => a.fundCode !== null);
  const render = (a: Account) => <li key={a.code} className={styles.itemRow}>
    <span className={styles.itemText}>
      <span>{a.name}</span>
      {a.note && <small>{a.note}</small>}
      {a.diff !== null && a.diff !== 0 && <small className={styles.bad}>Lệch so với số thực: <MoneyAmount value={a.diff} hidden={hidden} size="small" sign={a.diff > 0 ? '+' : undefined} /></small>}
    </span>
    <MoneyAmount value={a.balance} hidden={hidden} direction={a.balance < 0 ? 'debt' : 'neutral'} />
  </li>;
  return <section className={styles.card}>
    <div className={styles.cardHead}><h2>Tài khoản</h2><span className={styles.cardMeta}>{accounts.length} tài khoản</span></div>
    {[...new Set(normal.map(a => a.group))].map(group => {
      const list = normal.filter(a => a.group === group);
      return <div key={group} className={styles.group}>
        <div className={styles.groupHead}><span>{group}</span><MoneyAmount value={sum(list)} hidden={hidden} size="small" /></div>
        <ul className={styles.list}>{list.map(render)}</ul>
      </div>;
    })}
    {pockets.length > 0 && <details className={styles.group}>
      <summary className={styles.groupHead}><span>Ngăn quỹ ({pockets.length})</span><MoneyAmount value={sum(pockets)} hidden={hidden} size="small" /></summary>
      <ul className={styles.list}>{pockets.map(render)}</ul>
    </details>}
    {!accounts.length && <p className={styles.muted}>Chưa có tài khoản để hiển thị.</p>}
  </section>;
}
