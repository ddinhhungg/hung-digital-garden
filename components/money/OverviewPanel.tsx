import type { NetWorthPoint, Summary } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { MoneyIcon } from './MoneyShell';
import { PrivateText, formatMonth, percent } from './ChartPrimitives';
import Sparkline from './Sparkline';
import styles from './money.module.css';

export default function OverviewPanel({ totals, month, trend, hidden, currentYear, onToggleHidden }: {
  totals: Summary['totals']; month: Summary['month']; trend: NetWorthPoint[];
  hidden: boolean; currentYear: number; onToggleHidden: () => void;
}) {
  return <>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>{formatMonth(month.key)}</p>
      <div className={styles.row}><span className={styles.eyebrow}>Tiền khả dụng</span>
        <button className={styles.iconButton} onClick={onToggleHidden} aria-label={hidden ? 'Hiện số liệu' : 'Ẩn số liệu'}>
          <MoneyIcon path={hidden ? 'M3 3l18 18 M4 8l-2 4s4 7 10 7l5-2 M10 5h2c6 0 10 7 10 7l-3 4' : 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0'} />
        </button>
      </div>
      <div className={styles.heroValue}><MoneyAmount value={totals.available} hidden={hidden} size="large" direction={totals.available < 0 ? 'debt' : 'in'} /></div>
      <div className={styles.row}><span>Tài sản ròng</span><MoneyAmount value={totals.netWorth} hidden={hidden} /></div>
      <Sparkline points={trend} hidden={hidden} currentYear={currentYear} />
      <details className={styles.formula}><summary>Tiền khả dụng được tính thế nào?</summary>
        {([['Tiền thanh khoản', totals.liquid], ['Trừ quỹ ảo', totals.reservedFunds], ['Trừ nợ đến hạn 30 ngày', totals.dueDebts30d], ['Trừ dư nợ thẻ', totals.creditCardDebt]] as const).map(([label, value]) =>
          <div className={styles.row} key={label}><span>{label}</span><MoneyAmount value={value} hidden={hidden} size="small" /></div>)}
      </details>
    </section>
    <section className={styles.section}>
      <div className={styles.sectionHeading}><h2>Tháng này</h2><span className={styles.eyebrow}>{formatMonth(month.key)}</span></div>
      <div className={styles.stats}><div><p className={styles.eyebrow}>Thu vào</p><MoneyAmount value={month.income} hidden={hidden} direction="in" /></div>
        <div><p className={styles.eyebrow}>Chi ra</p><MoneyAmount value={month.expense} hidden={hidden} direction="out" /></div></div>
      <p className={styles.saving}>Tiết kiệm <PrivateText text={percent(month.savingsRate)} hidden={hidden} /></p>
    </section>
  </>;
}
