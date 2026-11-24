import { useEffect, useMemo, useRef, useState } from 'react';
import { MoneyError, type Transaction, type TransactionList } from '../../lib/money/types';
import { dayTitle } from '../../lib/money/calendar';
import {
  filterTransactions, rangeChips, totalsOf, typeChips, type RangeKey, type TxFilter, type TypeKey,
} from '../../lib/money/txFilter';
import MoneyAmount from './MoneyAmount';
import MoneyState from './MoneyState';
import TransactionRow from './TransactionRow';
import { moneyErrorText } from './MoneyState';
import { useModal } from './useModal';
import styles from './money.module.css';

export interface TransactionsSheetProps {
  /** Mức của Apps Script: từ 3 mới tải được toàn bộ sổ. */
  apiLevel: number;
  /** 30 giao dịch gần nhất đã có sẵn trong summary, dùng khi chưa tải được toàn bộ. */
  fallback: Transaction[];
  load: () => Promise<TransactionList>;
  today: string; currentYear: number; hidden: boolean;
  /** Mở sẵn bộ lọc theo một ngày (từ heatmap). */
  initialDate: string | null;
  initialType: TypeKey;
  onClose: () => void; onUnauthorized: () => void;
}

const PAGE = 80;

// Trang chi tiết giao dịch: tải toàn bộ sổ, lọc nhanh theo ngày, loại và từ khoá.
export default function TransactionsSheet(p: TransactionsSheetProps) {
  const { apiLevel, fallback, load, today, currentYear, hidden, onClose, onUnauthorized } = p;
  const dialogRef = useRef<HTMLDivElement>(null);
  useModal(dialogRef, onClose);

  const [list, setList] = useState<TransactionList | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState<TxFilter>({
    range: p.initialDate ? 'custom' : 'all', from: p.initialDate ?? '', to: p.initialDate ?? '', type: p.initialType, query: '',
  });
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    if (apiLevel < 3) return;
    let alive = true;
    load().then(result => { if (alive) { setList(result); setFailed(null); } }).catch((value: unknown) => {
      if (!alive) return;
      const e = value as MoneyError;
      if (e?.code === 'UNAUTHORIZED') { onUnauthorized(); return; }
      setFailed(moneyErrorText[e?.code] ?? moneyErrorText.SERVER);
    });
    return () => { alive = false; };
  }, [apiLevel, load, attempt, onUnauthorized]);

  useEffect(() => {
    // Chip đang chọn nằm ngoài tầm nhìn (hàng chip cuộn ngang) thì kéo vào.
    dialogRef.current?.querySelectorAll<HTMLElement>('[role="group"] [aria-pressed="true"]').forEach(el => el.scrollIntoView({ inline: 'center', block: 'nearest' }));
  }, [filter.range, filter.type]);

  const limited = apiLevel < 3 || failed !== null;
  const source = list?.items ?? (limited ? fallback : null);
  const rows = useMemo(() => source ? filterTransactions(source, filter, today) : [], [source, filter, today]);
  const sums = useMemo(() => totalsOf(rows), [rows]);
  const shown = rows.slice(0, limit);
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of shown) map.set(t.date, [...(map.get(t.date) ?? []), t]);
    return [...map.entries()];
  }, [shown]);

  const update = (patch: Partial<TxFilter>) => { setFilter(old => ({ ...old, ...patch })); setLimit(PAGE); };
  const pickRange = (range: RangeKey) => update(range === 'custom'
    ? { range, from: filter.from || today, to: filter.to || filter.from || today }
    : { range });
  const reset = () => update({ range: 'all', from: '', to: '', type: 'all', query: '' });
  const filtered = filter.range !== 'all' || filter.type !== 'all' || filter.query.trim() !== '';
  const showTotals = filter.type === 'all' || filter.type === 'Chi' || filter.type === 'Thu';

  return <div className={`${styles.root} ${styles.overlay}`} onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={dialogRef} className={`${styles.drawer} ${styles.sheet}`} role="dialog" aria-modal="true" aria-labelledby="money-tx-title">
      <div className={styles.handle} />
      <div className={styles.drawerHeading}>
        <h2 id="money-tx-title">Giao dịch</h2>
        <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Đóng">×</button>
      </div>
      <div className={styles.sheetTop}>
        <p className={styles.chipsLabel} id="tx-range-label">Thời gian</p>
        <div className={styles.chips} role="group" aria-labelledby="tx-range-label">
          {rangeChips.map(c => <button key={c.key} type="button" aria-pressed={filter.range === c.key} onClick={() => pickRange(c.key)}>{c.label}</button>)}
        </div>
        {filter.range === 'custom' && <div className={styles.dateRange}>
          <label>Từ<input type="date" value={filter.from} max={filter.to || undefined} onChange={e => update({ from: e.target.value })} /></label>
          <label>Đến<input type="date" value={filter.to} min={filter.from || undefined} onChange={e => update({ to: e.target.value })} /></label>
        </div>}
        <p className={styles.chipsLabel} id="tx-type-label">Loại giao dịch</p>
        <div className={styles.chips} role="group" aria-labelledby="tx-type-label">
          {typeChips.map(c => <button key={c.key} type="button" aria-pressed={filter.type === c.key} onClick={() => update({ type: c.key as TypeKey })}>{c.label}</button>)}
        </div>
        <input
          className={styles.searchBox} type="search" inputMode="search" placeholder="Tìm theo danh mục, người, ghi chú"
          aria-label="Tìm giao dịch" value={filter.query} onChange={e => update({ query: e.target.value })}
        />
        {source && <div className={styles.sheetSum}>
          <span>{rows.length} giao dịch{filtered ? ' khớp bộ lọc' : ''}</span>
          {showTotals && filter.type !== 'Chi' && <span>thu <MoneyAmount value={sums.income} hidden={hidden} direction="in" size="small" /></span>}
          {showTotals && filter.type !== 'Thu' && <span>chi <MoneyAmount value={sums.expense} hidden={hidden} direction="out" size="small" /></span>}
        </div>}
      </div>
      <div className={styles.drawerScroll}>
        {limited && source && <div className={styles.notice} role="status">
          {failed
            ? <>{failed} Đang hiện {fallback.length} giao dịch gần nhất đã có sẵn. <button type="button" className={styles.inlineLink} onClick={() => setAttempt(n => n + 1)}>Thử tải lại</button></>
            : <>Mới hiện được {fallback.length} giao dịch gần nhất. Cập nhật Apps Script lên bản 1.8 để xem toàn bộ sổ.</>}
        </div>}
        {!source && <MoneyState status="loading" />}
        {source && !rows.length && <p className={styles.sheetEmpty}>
          Không có giao dịch nào khớp.<br />
          {filtered && <button type="button" className={styles.inlineLink} onClick={reset}>Xoá bộ lọc</button>}
        </p>}
        {groups.map(([date, items]) => {
          const day = totalsOf(items);
          return <section key={date} className={styles.dayGroup}>
            <h3 className={styles.dayTitle}>
              {dayTitle(date)}{date === today && <span className={styles.dayNow}>hôm nay</span>}
              <span className={styles.dayTotal}>
                {day.expense > 0 && <MoneyAmount value={day.expense} hidden={hidden} direction="out" size="small" sign="−" />}
                {day.income > 0 && <MoneyAmount value={day.income} hidden={hidden} direction="in" size="small" sign="+" />}
              </span>
            </h3>
            <ul className={styles.list}>{items.map(t => <TransactionRow key={t.id} t={t} hidden={hidden} currentYear={currentYear} showDate={false} />)}</ul>
          </section>;
        })}
        {rows.length > shown.length && <button type="button" className={styles.seeAll} onClick={() => setLimit(n => n + PAGE)}>Hiện thêm ({rows.length - shown.length} giao dịch nữa)</button>}
        {list?.truncated && rows.length === shown.length && <p className={styles.footHint}>Đã hiện {list.items.length} giao dịch mới nhất trong tổng {list.total}.</p>}
      </div>
    </div>
  </div>;
}
