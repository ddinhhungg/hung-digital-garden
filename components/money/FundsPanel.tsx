import type { Account, Fund } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { formatDay, percent, PrivateText } from './ChartPrimitives';
import styles from './money.module.css';

export default function FundsPanel({ funds, accounts, hidden, currentYear }: { funds: Fund[]; accounts: Account[]; hidden: boolean; currentYear: number }) {
  if (!funds.length) return <MoneyState status="empty" title="Chưa có quỹ nào" description="Các quỹ sẽ xuất hiện ở đây khi được thiết lập." />;
  return <div>{funds.map(f => <details className={styles.fundCard} key={f.code}><summary>
    <div className={styles.row}><h2>{f.name}</h2><span className={styles.pill}>{f.kind === 'real' ? 'Thật' : 'Ảo'}</span></div>
    {f.note && <p className={styles.fundNote}>{f.note}</p>}
    <div className={styles.row}><MoneyAmount value={f.saved} hidden={hidden} direction="in" />{f.target !== null && <span>/ <MoneyAmount value={f.target} hidden={hidden} size="small" /></span>}</div>
    {f.progress !== null && <><div className={styles.track} aria-hidden="true"><div className={styles.fill} style={{ width: `${Math.max(0, Math.min(1, f.progress)) * 100}%` }} /></div>
      <div className={styles.row}><span>{f.progress >= 1 ? 'Đã đạt' : 'Tiến độ'}</span><PrivateText text={percent(f.progress)} hidden={hidden} /></div></>}
    {f.target !== null && <><p className={styles.muted}>Hạn: {f.deadline ? formatDay(f.deadline, currentYear) : 'Chưa đặt'}</p><p className={styles.muted}>Cần góp mỗi tháng: {f.monthlyNeeded === null ? '—' : <MoneyAmount value={f.monthlyNeeded} hidden={hidden} size="small" />}</p></>}
  </summary><div className={styles.fundDetail}>
    {f.target === null ? <p>Chưa đặt mục tiêu.</p> : <p>Mục tiêu: <MoneyAmount value={f.target} hidden={hidden} /></p>}
    {f.account && <p>Tài khoản: {accounts.find(a => a.code === f.account)?.name ?? f.account}</p>}
  </div></details>)}</div>;
}
