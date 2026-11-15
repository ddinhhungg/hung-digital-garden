import type { Debt } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { dayNumber, formatDay } from './ChartPrimitives';
import type { DebtMode } from './DebtSheet';
import styles from './money.module.css';

const sameParty = (a: Debt, b: Debt) => a.party.trim().toLowerCase() === b.party.trim().toLowerCase();

export interface DebtsPanelProps {
  debts: Debt[]; hidden: boolean; today: string; currentYear: number;
  /** Apps Script 1.7 trở lên: có nút ghi nợ, thu nợ, trả nợ, bù trừ ngay trong app. */
  actions?: boolean;
  onAction?: (mode: DebtMode) => void;
}

export default function DebtsPanel({ debts, hidden, today, currentYear, actions = false, onAction }: DebtsPanelProps) {
  const visible = debts.filter(d => d.status !== 'closed');
  const open = visible.filter(d => d.remaining > 0);
  const add = actions && onAction
    ? <button type="button" className={styles.debtAdd} onClick={() => onAction({ type: 'new', direction: 'lend' })}>＋ Ghi nợ mới</button>
    : null;
  if (!visible.length) return <>
    <MoneyState status="empty" title="Chưa có công nợ" description="Các khoản phải trả và phải thu sẽ nằm ở đây." />
    {add}
  </>;
  return <>{add}{(['payable', 'receivable'] as const).map(kind => <section className={styles.section} key={kind}>
    <h2 className={styles.debtHeading}>{kind === 'payable' ? '📤 Phải trả' : '📥 Phải thu'}</h2>
    {visible.filter(d => d.kind === kind).sort((a, b) => Number(a.status === 'risky') - Number(b.status === 'risky') || (a.due ?? '9999').localeCompare(b.due ?? '9999')).map(d => {
      const days = d.due === null ? null : dayNumber(d.due) - dayNumber(today);
      const urgent = d.status !== 'risky' && days !== null && days <= 7;
      const other = open.find(o => o.kind !== d.kind && sameParty(o, d));
      return <article key={d.code} className={`${styles.debtCard} ${urgent ? styles.urgent : ''} ${d.status === 'risky' ? styles.risky : ''}`}>
        <h3>{d.status === 'risky' ? '⚠️ ' : '👤 '}{d.party}</h3><MoneyAmount value={d.remaining} hidden={hidden} direction={kind === 'payable' ? 'debt' : 'in'} />
        <p className={styles.muted}>Còn lại / gốc <MoneyAmount value={d.principal} hidden={hidden} size="small" /></p>
        <p className={urgent ? styles.bad : styles.muted}>{d.due ? `Hạn ${formatDay(d.due, currentYear)}` : 'Chưa có hạn'}{urgent ? days! < 0 ? ` · Quá hạn ${-days!} ngày` : days === 0 ? ' · Hôm nay' : ` · Còn ${days} ngày` : ''}</p>
        {d.status === 'risky' && <p>Rủi ro cao · không tính vào tài sản</p>}{d.note && <p className={styles.muted}>{d.note}</p>}
        {actions && onAction && d.remaining > 0 && <div className={styles.debtActions}>
          <button type="button" className={styles.debtMain} onClick={() => onAction({ type: 'settle', debt: d })}>{kind === 'receivable' ? 'Họ trả tôi' : 'Tôi trả họ'}</button>
          {other && <button type="button" onClick={() => onAction(kind === 'receivable' ? { type: 'offset', receivable: d, payable: other } : { type: 'offset', receivable: other, payable: d })}>⇄ Bù trừ</button>}
        </div>}
      </article>;
    })}
  </section>)}</>;
}
