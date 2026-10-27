import type { CategorySpend } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { ChartCard, useChartSelection } from './ChartPrimitives';
import styles from './money.module.css';

export default function CategoryBars({ categories, hidden }: { categories: CategorySpend[]; hidden: boolean }) {
  const ranked = [...categories].sort((a, b) => b.spent - a.spent);
  const values = ranked.slice(0, 6).map(c => ({ name: c.category, spent: c.spent }));
  if (ranked.length > 6) values.push({ name: 'Khác (còn lại)', spent: ranked.slice(6).reduce((n, c) => n + c.spent, 0) });
  const max = Math.max(1, ...values.map(c => c.spent));
  const { ref, selected, setSelected } = useChartSelection(values.length);
  return <ChartCard title="Chi theo danh mục" description="Các danh mục chi nhiều nhất; phần còn lại gộp chung." summary={hidden ? 'Đã ẩn toàn bộ số liệu.' : values.map(c => `${c.name}: ${c.spent.toLocaleString('vi-VN')} đ`).join('. ')} cardRef={ref}>
    {!values.length ? <MoneyState status="empty" title="Chưa có danh mục chi" description="Các danh mục sẽ xuất hiện khi có dữ liệu." /> : values.map((c, i) => <button key={c.name} className={styles.categoryButton} onClick={() => setSelected(i)} aria-pressed={selected === i}>
      <span className={styles.row}><span>{c.name}</span><MoneyAmount value={c.spent} hidden={hidden} size="small" /></span>
      <svg viewBox="0 0 300 6" aria-hidden="true"><rect width={300} height={6} fill="var(--cream-dk)" /><rect width={c.spent / max * 300} height={6} fill="var(--ink-muted)" /></svg>
    </button>)}
    {selected !== null && <div className={styles.tooltip} role="status">{values[selected].name}: <MoneyAmount value={values[selected].spent} hidden={hidden} /></div>}
  </ChartCard>;
}
