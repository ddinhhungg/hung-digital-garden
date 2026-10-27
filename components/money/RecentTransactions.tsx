import { useState } from 'react';
import type { Transaction } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { formatDay } from './ChartPrimitives';
import styles from './money.module.css';

export default function RecentTransactions({ transactions, hidden, currentYear, onAdd }: {
  transactions: Transaction[]; hidden: boolean; currentYear: number; onAdd: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return <section className={styles.section}><h2>Giao dịch gần đây</h2>
    {!transactions.length ? <><MoneyState status="empty" title="Chưa có giao dịch" description="Ghi khoản thu hoặc chi đầu tiên khi anh sẵn sàng." /><button className={styles.textButton} onClick={onAdd}>Thêm giao dịch</button></> :
      <ul className={styles.list}>{transactions.slice(0, expanded ? 30 : 10).map(t => {
        const incoming = t.from === 'Ngoài', outgoing = t.to === 'Ngoài';
        return <li key={t.id} className={`${styles.transaction} ${t.status === 'Void' ? styles.void : ''}`}>
          <span className={styles.txDate}>{formatDay(t.date, currentYear)}</span><div>
            <div className={styles.row}><strong>{t.category || t.type}</strong><MoneyAmount value={t.amount} hidden={hidden} sign={incoming ? '+' : outgoing ? '−' : '↔'} direction={incoming ? 'in' : outgoing ? 'out' : 'neutral'} size="small" /></div>
            <p>{[t.party, t.note].filter(Boolean).join(' · ')}</p><p className={styles.txMeta}>{t.from} → {t.to} · {t.source}{t.status !== 'OK' ? ` · ${t.status}` : ''}</p>
          </div>
        </li>;
      })}</ul>}
    {transactions.length > 10 && <button className={styles.textButton} onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>{expanded ? 'Thu gọn' : 'Xem thêm'}</button>}
  </section>;
}
