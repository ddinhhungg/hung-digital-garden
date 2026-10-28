import type { Debt } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { dayNumber, formatDay } from './ChartPrimitives';
import styles from './money.module.css';

export default function DebtsPanel({ debts, hidden, today, currentYear }: { debts: Debt[]; hidden: boolean; today: string; currentYear: number }) {
  const visible = debts.filter(d => d.status !== 'closed');
  if (!visible.length) return <MoneyState status="empty" title="Chưa có công nợ" description="Các khoản phải trả và phải thu sẽ nằm ở đây." />;
  return <>{(['payable', 'receivable'] as const).map(kind => <section className={styles.section} key={kind}>
    <h2 className={styles.debtHeading}>{kind === 'payable' ? '📤 Phải trả' : '📥 Phải thu'}</h2>
    {visible.filter(d => d.kind === kind).sort((a, b) => Number(a.status === 'risky') - Number(b.status === 'risky') || (a.due ?? '9999').localeCompare(b.due ?? '9999')).map(d => {
      const days = d.due === null ? null : dayNumber(d.due) - dayNumber(today);
      const urgent = d.status !== 'risky' && days !== null && days <= 7;
      return <article key={d.code} className={`${styles.debtCard} ${urgent ? styles.urgent : ''} ${d.status === 'risky' ? styles.risky : ''}`}>
        <h3>{d.status === 'risky' ? '⚠️ ' : '👤 '}{d.party}</h3><MoneyAmount value={d.remaining} hidden={hidden} direction={kind === 'payable' ? 'debt' : 'in'} />
        <p className={styles.muted}>Còn lại / gốc <MoneyAmount value={d.principal} hidden={hidden} size="small" /></p>
        <p className={urgent ? styles.bad : styles.muted}>{d.due ? `Hạn ${formatDay(d.due, currentYear)}` : 'Chưa có hạn'}{urgent ? days! < 0 ? ` · Quá hạn ${-days!} ngày` : days === 0 ? ' · Hôm nay' : ` · Còn ${days} ngày` : ''}</p>
        {d.status === 'risky' && <p>Rủi ro cao · không tính vào tài sản</p>}{d.note && <p className={styles.muted}>{d.note}</p>}
      </article>;
    })}
  </section>)}</>;
}
