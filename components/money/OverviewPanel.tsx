import type { NetWorthPoint, Summary } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { MoneyIcon } from './MoneyShell';
import { PrivateText, formatMonth, percent } from './ChartPrimitives';
import Sparkline from './Sparkline';
import styles from './money.module.css';

const EYE = 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0';
const EYE_OFF = 'M3 3l18 18 M4 8l-2 4s4 7 10 7l5-2 M10 5h2c6 0 10 7 10 7l-3 4';

export default function OverviewPanel({ totals, month, trend, hidden, currentYear, onToggleHidden }: {
  totals: Summary['totals']; month: Summary['month']; trend: NetWorthPoint[];
  hidden: boolean; currentYear: number; onToggleHidden: () => void;
}) {
  const spentRatio = month.income > 0 ? Math.min(1, month.expense / month.income) : month.expense > 0 ? 1 : 0;
  return <>
    <section className={styles.heroCard}>
      <div className={styles.heroTop}>
        <span className={styles.heroLabel}>Tiền khả dụng</span>
        <button className={styles.heroIcon} onClick={onToggleHidden} aria-label={hidden ? 'Hiện số liệu' : 'Ẩn số liệu'}>
          <MoneyIcon path={hidden ? EYE_OFF : EYE} />
        </button>
      </div>
      <div className={styles.heroValue}>
        <MoneyAmount value={totals.available} hidden={hidden} size="large" direction={totals.available < 0 ? 'debt' : 'neutral'} />
      </div>
      <p className={styles.heroHint}>Tiêu được mà không đụng quỹ và nợ sắp đến hạn</p>
      <div className={styles.heroSplit}>
        <div><span>Tài sản ròng</span><MoneyAmount value={totals.netWorth} hidden={hidden} /></div>
        <div><span>Tiền thanh khoản</span><MoneyAmount value={totals.liquid} hidden={hidden} /></div>
      </div>
      <div className={styles.heroSpark}><Sparkline points={trend} hidden={hidden} currentYear={currentYear} /></div>
      <details className={styles.heroFormula}><summary>Cách tính tiền khả dụng</summary>
        {([['Tiền thanh khoản', totals.liquid, ''], ['Quỹ ảo đã giữ', totals.reservedFunds, '−'], ['Nợ đến hạn 30 ngày', totals.dueDebts30d, '−'], ['Dư nợ thẻ', totals.creditCardDebt, '−']] as const).map(([label, value, sign]) =>
          <div className={styles.row} key={label}><span>{label}</span><MoneyAmount value={value} hidden={hidden} size="small" sign={sign || undefined} /></div>)}
      </details>
    </section>

    <section className={styles.card}>
      <div className={styles.cardHead}><h2>Tháng này</h2><span className={styles.cardMeta}>{formatMonth(month.key)}</span></div>
      <div className={styles.statGrid}>
        <div className={`${styles.statTile} ${styles.statIn}`}>
          <span className={styles.statIcon}><MoneyIcon path="M12 19V5 M6 11l6-6 6 6" /></span>
          <span className={styles.statLabel}>Thu vào</span>
          <MoneyAmount value={month.income} hidden={hidden} direction="in" />
        </div>
        <div className={`${styles.statTile} ${styles.statOut}`}>
          <span className={styles.statIcon}><MoneyIcon path="M12 5v14 M6 13l6 6 6-6" /></span>
          <span className={styles.statLabel}>Chi ra</span>
          <MoneyAmount value={month.expense} hidden={hidden} direction="out" />
        </div>
      </div>
      <div className={styles.meter} aria-hidden="true"><div style={{ width: `${hidden ? 0 : spentRatio * 100}%` }} /></div>
      <div className={styles.meterLegend}>
        <span>Đã chi <PrivateText text={percent(month.income > 0 ? month.expense / month.income : null)} hidden={hidden} /> thu nhập</span>
        <span className={styles.badge}>Tiết kiệm <PrivateText text={percent(month.savingsRate)} hidden={hidden} /></span>
      </div>
    </section>
  </>;
}
