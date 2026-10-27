import type { Account } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import styles from './money.module.css';

export default function AccountList({ accounts, hidden }: { accounts: Account[]; hidden: boolean }) {
  const normal = accounts.filter(a => a.fundCode === null);
  const pockets = accounts.filter(a => a.fundCode !== null);
  const render = (a: Account) => <li key={a.code} className={styles.account}>
    <div className={styles.row}><span>{a.name}</span><MoneyAmount value={a.balance} hidden={hidden} direction={a.group === 'Thẻ tín dụng' && a.balance < 0 ? 'debt' : 'neutral'} /></div>
    {a.diff !== null && a.diff !== 0 && <p className={styles.diff}>Lệch so với số thực: <MoneyAmount value={a.diff} hidden={hidden} size="small" sign={a.diff > 0 ? '+' : undefined} /></p>}
  </li>;
  return <section className={styles.section}><h2>Tài khoản</h2>
    {[...new Set(normal.map(a => a.group))].map(group => <div key={group}>
      <h3 className={styles.groupLabel}>{group}</h3><ul className={styles.list}>{normal.filter(a => a.group === group).map(render)}</ul>
    </div>)}
    {pockets.length > 0 && <details className={styles.pockets}><summary><span>Ngăn quỹ</span><MoneyAmount value={pockets.reduce((n, a) => n + a.balance, 0)} hidden={hidden} /></summary><ul className={styles.list}>{pockets.map(render)}</ul></details>}
    {!accounts.length && <p className={styles.muted}>Chưa có tài khoản để hiển thị.</p>}
  </section>;
}
