import type { Transaction } from '../../lib/money/types';
import MoneyState from './MoneyState';
import TransactionRow from './TransactionRow';
import styles from './money.module.css';

const SHOWN = 6;

// Thẻ ngoài trang chính: vài giao dịch mới nhất. Bấm "Xem chi tiết" mở trang đầy đủ có bộ lọc.
export default function RecentTransactions({ transactions, hidden, currentYear, onAdd, onOpen }: {
  transactions: Transaction[]; hidden: boolean; currentYear: number; onAdd: () => void; onOpen: () => void;
}) {
  const shown = transactions.filter(t => t.status !== 'Void').slice(0, SHOWN);
  return <section className={styles.card}><div className={styles.cardHead}><h2>Giao dịch gần đây</h2></div>
    {!shown.length ? <><MoneyState status="empty" title="Chưa có giao dịch" description="Ghi khoản thu hoặc chi đầu tiên khi anh sẵn sàng." /><button className={styles.textButton} onClick={onAdd}>Thêm giao dịch</button></> :
      <ul className={styles.list}>{shown.map(t => <TransactionRow key={t.id} t={t} hidden={hidden} currentYear={currentYear} />)}</ul>}
    {shown.length > 0 && <button type="button" className={styles.seeAll} onClick={onOpen}>Xem chi tiết, lọc theo ngày và loại →</button>}
  </section>;
}
