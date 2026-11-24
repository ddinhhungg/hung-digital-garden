import type { Transaction } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { formatDay } from './ChartPrimitives';
import { categoryEmoji } from '../../lib/money/emoji';
import styles from './money.module.css';

// Một dòng giao dịch, dùng chung cho thẻ Giao dịch gần đây và trang chi tiết có bộ lọc.
export default function TransactionRow({ t, hidden, currentYear, showDate = true }: {
  t: Transaction; hidden: boolean; currentYear: number; showDate?: boolean;
}) {
  const incoming = t.from === 'Ngoài', outgoing = t.to === 'Ngoài';
  return <li className={`${styles.transaction} ${showDate ? '' : styles.transactionNoDate} ${t.status === 'Void' ? styles.void : ''}`}>
    {showDate && <span className={styles.txDate}>{formatDay(t.date, currentYear)}</span>}
    <div>
      <div className={styles.row}>
        <strong><span className={styles.emoji} aria-hidden="true">{incoming ? '💰' : outgoing ? categoryEmoji(t.category) : '🔁'}</span>{t.category || t.type}</strong>
        <MoneyAmount value={t.amount} hidden={hidden} sign={incoming ? '+' : outgoing ? '−' : '↔'} direction={incoming ? 'in' : outgoing ? 'out' : 'neutral'} size="small" />
      </div>
      <p>{[t.party, t.note].filter(Boolean).join(' · ')}</p>
      <p className={styles.txMeta}>{t.type} · {t.from} → {t.to} · {t.source}{t.status !== 'OK' ? ` · ${t.status}` : ''}</p>
    </div>
  </li>;
}
