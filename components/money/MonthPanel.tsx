import { useState } from 'react';
import type { Summary } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import { MoneyIcon } from './MoneyShell';
import { PrivateText, formatMonth, percent } from './ChartPrimitives';
import { categoryEmoji } from '../../lib/money/emoji';
import styles from './money.module.css';

type Row = { category: string; budget: number | null; spent: number };

export default function MonthPanel({ month, months, hidden }: {
  month: Summary['month']; months: Summary['trend']['months']; hidden: boolean;
}) {
  const keys = [...new Set([...months.map(m => m.key), month.key])].sort().reverse();
  const [selected, setSelected] = useState(month.key);
  const key = keys.includes(selected) ? selected : month.key;
  const index = keys.indexOf(key);
  const isCurrent = key === month.key;
  const past = months.find(m => m.key === key);

  const income = isCurrent ? month.income : past?.income ?? 0;
  const expense = isCurrent ? month.expense : past?.expense ?? 0;
  const left = income - expense;
  const rate = income > 0 ? left / income : null;
  const budgetOf = new Map(month.byCategory.map(c => [c.category, c.budget] as const));
  const rows: Row[] = isCurrent
    ? month.byCategory
    : (past?.byCategory ?? []).map(c => ({ category: c.category, spent: c.spent, budget: budgetOf.get(c.category) ?? null }));
  const hasData = income > 0 || expense > 0;

  return <>
    <div className={styles.monthPicker}>
      <button className={styles.iconButton} onClick={() => setSelected(keys[index + 1])} disabled={index >= keys.length - 1} aria-label="Tháng trước"><MoneyIcon path="M15 5l-7 7 7 7" /></button>
      <label className={styles.monthSelect}>
        <span className={styles.srOnly}>Chọn tháng</span>
        <select value={key} onChange={e => setSelected(e.target.value)}>
          {keys.map(k => <option key={k} value={k}>{formatMonth(k)}{k === month.key ? ' (hiện tại)' : ''}</option>)}
        </select>
      </label>
      <button className={styles.iconButton} onClick={() => setSelected(keys[index - 1])} disabled={index <= 0} aria-label="Tháng sau"><MoneyIcon path="M9 5l7 7-7 7" /></button>
    </div>

    <section className={styles.card}>
      <div className={styles.cardHead}><h2>Tổng kết</h2><span className={styles.cardMeta}>{formatMonth(key)}</span></div>
      <div className={styles.statGrid}>
        <div className={`${styles.statTile} ${styles.statIn}`}><span className={styles.statIcon}><MoneyIcon path="M12 19V5 M6 11l6-6 6 6" /></span><span className={styles.statLabel}>Thu vào</span><MoneyAmount value={income} hidden={hidden} direction="in" /></div>
        <div className={`${styles.statTile} ${styles.statOut}`}><span className={styles.statIcon}><MoneyIcon path="M12 5v14 M6 13l6 6 6-6" /></span><span className={styles.statLabel}>Chi ra</span><MoneyAmount value={expense} hidden={hidden} direction="out" /></div>
      </div>
      <div className={styles.leftRow}>
        <span>{left >= 0 ? '🐷 Dư trong tháng' : '⚠️ Chi vượt thu'}</span>
        <MoneyAmount value={Math.abs(left)} hidden={hidden} direction={left >= 0 ? 'in' : 'out'} sign={left >= 0 ? '+' : '−'} />
      </div>
      {rate !== null && <p className={styles.leftNote}>Tiết kiệm <PrivateText text={percent(rate)} hidden={hidden} /> thu nhập</p>}
    </section>

    <section className={styles.card}>
      <div className={styles.cardHead}><h2>Chi theo danh mục</h2></div>
      {!rows.length
        ? <MoneyState status="empty" title={expense > 0 ? 'Chưa có chi tiết danh mục' : 'Chưa có chi tiêu'} description={expense > 0 ? 'Cần cập nhật Apps Script để xem chi theo danh mục của tháng cũ.' : isCurrent ? 'Các khoản chi sẽ được tổng hợp tại đây.' : 'Tháng này không có giao dịch.'} />
        : [...rows].sort((a, b) => b.spent - a.spent).map(c => {
          const over = c.budget !== null && c.spent > c.budget;
          return <article className={styles.spend} key={c.category}>
            <div className={styles.row}><span><span className={styles.emoji} aria-hidden="true">{categoryEmoji(c.category)}</span>{c.category}</span><MoneyAmount value={c.spent} hidden={hidden} direction={over ? 'out' : 'neutral'} /></div>
            {c.budget !== null ? <><div className={styles.track} aria-hidden="true"><div className={`${styles.fill} ${over ? styles.over : ''}`} style={{ width: `${Math.min(100, c.budget > 0 ? c.spent / c.budget * 100 : c.spent > 0 ? 100 : 0)}%` }} /></div><div className={styles.row}><small>Ngân sách <MoneyAmount value={c.budget} hidden={hidden} size="small" /></small>{over && <small className={styles.bad}>Vượt <MoneyAmount value={c.spent - c.budget} hidden={hidden} size="small" /></small>}</div></> : <small className={styles.muted}>Chưa đặt ngân sách</small>}
          </article>;
        })}
    </section>
  </>;
}
