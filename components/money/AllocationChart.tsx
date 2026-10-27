import { useId } from 'react';
import type { Account } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { ChartCard, PrivateText, percent, useChartSelection } from './ChartPrimitives';
import styles from './money.module.css';

const colors = ['var(--sage)', 'var(--ink-lt)', 'var(--ink-muted)', 'var(--sage-lt)', 'var(--cream-dkr)'];
export default function AllocationChart({ accounts, hidden }: { accounts: Account[]; hidden: boolean }) {
  const id = useId().replace(/:/g, '');
  const groups = new Map<string, number>();
  accounts.filter(a => a.group !== 'Thẻ tín dụng').forEach(a => { const key = a.fundCode === null ? a.group : 'Ngăn quỹ'; groups.set(key, (groups.get(key) ?? 0) + a.balance); });
  const ranked = [...groups].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const slices = ranked.length > 5 ? [...ranked.slice(0, 4), { name: 'Khác', value: ranked.slice(4).reduce((n, s) => n + s.value, 0) }] : ranked;
  const total = slices.reduce((n, s) => n + s.value, 0), nonnegative = slices.every(s => s.value >= 0);
  const debt = accounts.filter(a => a.group === 'Thẻ tín dụng').reduce((n, a) => n + Math.max(0, -a.balance), 0);
  const { ref, selected, setSelected } = useChartSelection(slices.length);
  let offset = 0;
  return <ChartCard title="Cơ cấu tài sản" description="Gom theo nhóm tài khoản; ngăn quỹ được tách riêng." summary={hidden ? 'Đã ẩn toàn bộ số liệu.' : slices.map(s => `${s.name}: ${s.value.toLocaleString('vi-VN')} đ`).join('. ')} cardRef={ref}>
    {!slices.length ? <MoneyState status="empty" title="Chưa có cơ cấu tài sản" description="Cơ cấu sẽ xuất hiện khi có tài khoản." /> : <>
      {total > 0 && nonnegative ? <svg className={styles.allocationPlot} viewBox="0 0 320 48" aria-hidden="true"><defs>{slices.map((s, i) => <pattern id={`${id}-${i}`} key={s.name} width={5 + i * 2} height={5 + i * 2} patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill={colors[i]} /><path d={`M0 ${5 + i * 2}L${5 + i * 2} 0`} stroke="var(--paper)" strokeOpacity={.3} /></pattern>)}</defs>{slices.map((s, i) => { const width = s.value / total * 320, x = offset; offset += width; return <rect key={s.name} x={x} y={3} width={width} height={42} fill={`url(#${id}-${i})`} onPointerDown={() => setSelected(i)} />; })}</svg> : <p className={styles.muted}>{nonnegative ? 'Chưa có số dư để vẽ cơ cấu.' : 'Có nhóm số dư âm; xem số dư theo nhóm bên dưới.'}</p>}
      <ul className={styles.list}>{slices.map((s, i) => <li key={s.name}><button className={styles.legendButton} onClick={() => setSelected(i)} aria-pressed={selected === i}><span className={styles.legendName}><i style={{ background: colors[i] }} />{s.name}</span><span><MoneyAmount value={s.value} hidden={hidden} size="small" /> · <PrivateText text={total === 0 ? '—' : percent(s.value / total)} hidden={hidden} /></span></button></li>)}</ul>
      {selected !== null && <div className={styles.tooltip} role="status">{slices[selected].name}: <MoneyAmount value={slices[selected].value} hidden={hidden} /></div>}
    </>}
    <div className={styles.row}>Dư nợ thẻ <MoneyAmount value={debt} hidden={hidden} direction="debt" /></div>
  </ChartCard>;
}
