import type { Portfolio } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { ChartCard, PrivateText, formatDay, percent } from './ChartPrimitives';
import styles from './money.module.css';

export default function PortfolioList({ portfolio, hidden, currentYear }: { portfolio: Portfolio | null; hidden: boolean; currentYear: number }) {
  if (portfolio === null) return null;
  const holdings = [...portfolio.holdings].sort((a, b) => b.value - a.value);
  const max = Math.max(.01, ...holdings.map(h => Math.abs(h.pct ?? 0)));
  return <ChartCard title="Chứng khoán" description="Giá nhập tay; xem ngày cập nhật trước khi đọc giá trị." summary={hidden ? 'Đã ẩn toàn bộ số liệu.' : `Giá trị ${portfolio.value.toLocaleString('vi-VN')} đ; lãi lỗ ${portfolio.pnl.toLocaleString('vi-VN')} đ.`}>
    <div className={styles.row}>Tổng giá trị <MoneyAmount value={portfolio.value} hidden={hidden} /></div>
    <div className={styles.row}>Lãi/lỗ <span><MoneyAmount value={portfolio.pnl} hidden={hidden} direction={portfolio.pnl >= 0 ? 'in' : 'out'} /> · <PrivateText text={percent(portfolio.pnlPct)} hidden={hidden} /></span></div>
    <p className={styles.chartDescription}>Giá cập nhật ngày <PrivateText text={portfolio.priceAsOf ? formatDay(portfolio.priceAsOf, currentYear) : 'chưa có'} hidden={hidden && portfolio.priceAsOf !== null} /></p>
    {!holdings.length && <p className={styles.muted}>Chưa có mã chứng khoán.</p>}
    {holdings.map(h => <details key={h.code} className={styles.holding}><summary>
      <div className={styles.row}><strong>{h.code}</strong><MoneyAmount value={h.value} hidden={hidden} size="small" /></div>
      <div className={styles.row}><span>{h.type} · SL <PrivateText text={h.qty.toLocaleString('vi-VN')} hidden={hidden} /></span><span className={h.pnl >= 0 ? styles.good : styles.bad}>{h.pnl >= 0 ? 'Lãi ' : 'Lỗ '}<PrivateText text={percent(h.pct)} hidden={hidden} /></span></div>
      <svg viewBox="0 0 300 12" className={styles.pnlBar} aria-hidden="true"><line x1={150} x2={150} y1={0} y2={12} stroke="var(--ink-muted)" />{h.pct !== null && <rect x={h.pct < 0 ? 150 - Math.abs(h.pct) / max * 145 : 150} y={3} width={Math.abs(h.pct) / max * 145} height={6} fill={h.pnl >= 0 ? 'var(--sage)' : 'var(--tomato)'} />}</svg>
    </summary><div className={styles.fundDetail}><div className={styles.row}>Giá vốn / đơn vị <MoneyAmount value={h.cost} hidden={hidden} size="small" /></div><div className={styles.row}>Giá hiện tại / đơn vị <MoneyAmount value={h.price} hidden={hidden} size="small" /></div><div className={styles.row}>Lãi/lỗ <MoneyAmount value={h.pnl} hidden={hidden} direction={h.pnl >= 0 ? 'in' : 'out'} size="small" /></div></div></details>)}
  </ChartCard>;
}
