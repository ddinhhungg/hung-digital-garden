import { useEffect, useMemo, useRef, useState } from 'react';
import { MoneyError, type Account, type CalendarItem, type NewPlan, type PlanStatus } from '../../lib/money/types';
import { dayTitle, shiftMonth } from '../../lib/money/calendar';
import { itemEmoji } from '../../lib/money/emoji';
import MoneyAmount from './MoneyAmount';
import { moneyErrorText } from './MoneyState';
import styles from './money.module.css';

export interface CalendarSheetProps {
  items: CalendarItem[]; accounts: Account[]; today: string; hidden: boolean;
  initialMonth: string; initialDate: string | null; startInForm: boolean;
  onAdd: (plan: NewPlan) => Promise<{ id: string }>;
  onSetStatus: (id: string, status: PlanStatus, date?: string) => Promise<void>;
  onClose: () => void; onUnauthorized: () => void;
}

type Filter = 'all' | 'sure' | 'maybe' | 'done';
const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' }, { key: 'sure', label: 'Chắc chắn' },
  { key: 'maybe', label: 'Dự kiến' }, { key: 'done', label: 'Đã xong' },
];
const validDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
const errorMessage = (e: MoneyError) => e.code === 'VALIDATION' ? e.message : moneyErrorText[e.code] ?? moneyErrorText.SERVER;

export default function CalendarSheet(p: CalendarSheetProps) {
  const { items, accounts, today, hidden, onAdd, onSetStatus, onClose, onUnauthorized } = p;
  const [view, setView] = useState<'agenda' | 'form'>(p.startInForm ? 'form' : 'agenda');
  const [month, setMonth] = useState(p.initialMonth);
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [moving, setMoving] = useState<{ id: string; date: string } | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [problem, setProblem] = useState('');
  const [toast, setToast] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef(() => {});
  useEffect(() => { keyRef.current = () => { if (view === 'form' && !p.startInForm) setView('agenda'); else onClose(); }; });

  // Khóa phần nền (giống ngăn kéo thêm giao dịch), Escape để đóng, giữ phím Tab trong hộp thoại.
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const shell = document.getElementById('money-panel')?.closest('section');
    const wasInert = shell?.inert ?? false;
    if (shell) shell.inert = true;
    dialogRef.current?.querySelector<HTMLElement>('button:not(:disabled),input:not(:disabled)')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); keyRef.current(); }
      if (event.key !== 'Tab') return;
      const nodes = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)') ?? [])];
      if (!nodes.length) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); if (shell) shell.inert = wasInert; if (previous?.isConnected) previous.focus(); };
  }, []);

  const accountName = (code: string | null) => code ? accounts.find(a => a.code === code)?.name ?? code : null;
  const passes = (i: CalendarItem) => {
    if (i.status === 'Huỷ') return false;
    if (filter === 'done') return i.status === 'Đã xong';
    if (filter === 'sure') return i.certain && i.status !== 'Đã xong';
    if (filter === 'maybe') return !i.certain && i.status !== 'Đã xong';
    return true;
  };
  const overdue = useMemo(
    () => items.filter(i => i.source === 'plan' && i.status === 'Chờ' && i.date < today && passes(i)),
    [items, today, filter], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const groups = useMemo(() => {
    const overdueSet = new Set(overdue);
    const map = new Map<string, CalendarItem[]>();
    for (const i of items.filter(x => x.date.startsWith(month) && passes(x) && !overdueSet.has(x))) {
      map.set(i.date, [...(map.get(i.date) ?? []), i]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items, month, overdue, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthPending = items.filter(i => i.date.startsWith(month) && i.status === 'Chờ' && i.certain && i.amount);
  const total = (kind: CalendarItem['kind']) => monthPending.filter(i => i.kind === kind).reduce((n, i) => n + (i.amount ?? 0), 0);

  useEffect(() => {
    if (view !== 'agenda' || !p.initialDate) return;
    dialogRef.current?.querySelector<HTMLElement>(`[data-day="${p.initialDate}"]`)?.scrollIntoView({ block: 'start' });
  }, [view, p.initialDate]);

  function flash(text: string) { setToast(text); window.setTimeout(() => setToast(''), 2600); }
  async function act(item: CalendarItem, status: PlanStatus, date?: string, done?: string) {
    if (!item.id || busy) return;
    setBusy(item.id); setProblem('');
    try {
      await onSetStatus(item.id, status, date);
      setMoving(null); setCancelling(null);
      if (done) flash(done);
    } catch (value) {
      const e = value as MoneyError;
      setProblem(errorMessage(e));
      if (e.code === 'UNAUTHORIZED') onUnauthorized();
    } finally { setBusy(null); }
  }

  const row = (item: CalendarItem, i: number) => {
    const isDone = item.status === 'Đã xong';
    const mine = item.source === 'plan' && item.id;
    const working = busy === item.id;
    return <li key={`${item.id ?? 'fx'}-${item.date}-${i}`} className={`${styles.planRow} ${isDone ? styles.planDone : ''}`}>
      <div className={styles.planMain}>
        <span className={styles.emoji} aria-hidden="true">{itemEmoji(item.label)}</span>
        <span className={styles.itemText}>
          <span>{item.label}</span>
          <small>
            {item.source === 'fixed' ? 'Cố định' : item.certain ? 'Chắc chắn' : 'Dự kiến'}
            {accountName(item.account) ? ` · ${accountName(item.account)}` : ''}
            {isDone ? ' · đã xong' : ''}
          </small>
          {item.note && <small className={styles.planNote}>{item.note}</small>}
        </span>
        {item.amount !== null
          ? <MoneyAmount value={item.amount} hidden={hidden} sign={item.kind === 'in' ? '+' : '−'} direction={item.kind} size="small" />
          : <em className={styles.unknownAmount}>chưa rõ</em>}
      </div>
      {mine && <div className={styles.planActions}>
        {isDone
          ? <button type="button" disabled={working} onClick={() => void act(item, 'Chờ')}>↺ Mở lại</button>
          : moving?.id === item.id
            ? <>
              <input type="date" aria-label="Dời sang ngày" value={moving.date} onChange={e => setMoving({ id: item.id!, date: e.target.value })} />
              <button type="button" disabled={working || !validDate(moving.date)} onClick={() => void act(item, 'Chờ', moving.date, 'Đã dời lịch')}>Lưu</button>
              <button type="button" onClick={() => setMoving(null)}>Bỏ</button>
            </>
            : cancelling === item.id
              ? <>
                <span className={styles.planAsk}>Huỷ khoản này?</span>
                <button type="button" className={styles.planDanger} disabled={working} onClick={() => void act(item, 'Huỷ', undefined, 'Đã huỷ kế hoạch')}>Huỷ thật</button>
                <button type="button" onClick={() => setCancelling(null)}>Thôi</button>
              </>
              : <>
                <button type="button" className={styles.planOk} disabled={working} onClick={() => void act(item, 'Đã xong', undefined, 'Đã đánh dấu xong')}>✓ Xong</button>
                <button type="button" disabled={working} onClick={() => setMoving({ id: item.id!, date: item.date })}>Dời ngày</button>
                <button type="button" disabled={working} onClick={() => setCancelling(item.id)}>Huỷ</button>
              </>}
      </div>}
    </li>;
  };

  return <div className={`${styles.root} ${styles.overlay}`} onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={dialogRef} className={`${styles.drawer} ${styles.sheet}`} role="dialog" aria-modal="true" aria-labelledby="money-cal-title">
      <div className={styles.handle} />
      {view === 'form'
        ? <PlanForm
          accounts={accounts} today={today} defaultDate={p.initialDate ?? today} onAdd={onAdd} onUnauthorized={onUnauthorized}
          onBack={() => (p.startInForm ? onClose() : setView('agenda'))}
          onDone={(date) => { setMonth(date.slice(0, 7)); setView('agenda'); flash('Đã ghi vào lịch'); }}
        />
        : <>
          <div className={styles.drawerHeading}>
            <h2 id="money-cal-title">Lịch thu chi</h2>
            <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Đóng">×</button>
          </div>
          <div className={styles.sheetTop}>
            <div className={styles.sheetMonth}>
              <button type="button" className={styles.calNav} onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Tháng trước">‹</button>
              <b>Tháng {Number(month.slice(5))}, {month.slice(0, 4)}</b>
              <button type="button" className={styles.calNav} onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Tháng sau">›</button>
            </div>
            <div className={styles.chips} role="group" aria-label="Lọc theo loại">
              {filters.map(f => <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</button>)}
            </div>
            <div className={styles.sheetSum}>
              <span>chắc chắn tháng này</span>
              <span>vào <MoneyAmount value={total('in')} hidden={hidden} direction="in" size="small" /></span>
              <span>ra <MoneyAmount value={total('out')} hidden={hidden} direction="out" size="small" /></span>
            </div>
          </div>
          <div className={styles.drawerScroll}>
            {problem && <div className={styles.notice} role="alert">{problem}</div>}
            {overdue.length > 0 && <section className={styles.dayGroup}>
              <h3 className={styles.dayTitle}><span className={styles.dayOver}>Quá hạn, chưa xử lý</span></h3>
              <ul className={styles.list}>{overdue.map(row)}</ul>
            </section>}
            {groups.map(([date, list]) => <section key={date} className={styles.dayGroup} data-day={date}>
              <h3 className={styles.dayTitle}>{dayTitle(date)}{date === today && <span className={styles.dayNow}>hôm nay</span>}</h3>
              <ul className={styles.list}>{list.map(row)}</ul>
            </section>)}
            {!overdue.length && !groups.length && <p className={styles.sheetEmpty}>Tháng này chưa có gì trong mục này.<br /><span>Bấm "Thêm kế hoạch" để ghi lại nhé.</span></p>}
          </div>
          <div className={styles.drawerFooter}>
            {toast && <p className={styles.sheetToast} role="status">{toast}</p>}
            <button type="button" className={styles.primary} onClick={() => setView('form')}>＋ Thêm kế hoạch</button>
          </div>
        </>}
    </div>
  </div>;
}

function PlanForm({ accounts, today, defaultDate, onAdd, onBack, onDone, onUnauthorized }: {
  accounts: Account[]; today: string; defaultDate: string;
  onAdd: CalendarSheetProps['onAdd']; onBack: () => void; onDone: (date: string) => void; onUnauthorized: () => void;
}) {
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'Chi' | 'Thu'>('Chi');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(defaultDate >= today ? defaultDate : today);
  const [account, setAccount] = useState('');
  const [certain, setCertain] = useState(true);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = useRef(false);
  const clear = (field: string) => setErrors(old => { const n = { ...old }; delete n[field]; return n; });

  async function submit() {
    if (pending.current) return;
    const next: Record<string, string> = {};
    const name = label.trim();
    if (!name || name.length > 80) next.label = 'Nhập tên từ 1 đến 80 ký tự.';
    if (!validDate(date)) next.date = 'Chọn ngày hợp lệ.';
    if (Object.keys(next).length) { setErrors(next); return; }
    pending.current = true; setSending(true); setErrors({});
    try {
      await onAdd({ date, label: name, kind, amount: amount > 0 ? amount : null, account: account || null, certain, note: note.trim() });
      onDone(date);
    } catch (value) {
      const e = value as MoneyError;
      setErrors({ [e.field && ['label', 'amount', 'date', 'account', 'note'].includes(e.field) ? e.field : 'general']: errorMessage(e) });
      if (e.code === 'UNAUTHORIZED') onUnauthorized();
    } finally { pending.current = false; setSending(false); }
  }

  return <form className={styles.drawerForm} onSubmit={e => { e.preventDefault(); void submit(); }}>
    <div className={styles.drawerHeading}>
      <h2 id="money-cal-title">Ghi kế hoạch</h2>
      <button type="button" className={styles.iconButton} disabled={sending} onClick={onBack} aria-label="Quay lại">×</button>
    </div>
    <div className={styles.drawerScroll}>
      <div className={styles.field}>
        <label htmlFor="plan-label">Việc gì?</label>
        <input id="plan-label" maxLength={80} autoComplete="off" placeholder="Ví dụ: Đóng học phí, nhận thưởng quý" disabled={sending} value={label}
          onChange={e => { setLabel(e.target.value); clear('label'); }} aria-invalid={Boolean(errors.label)} />
        <p className={styles.fieldError}>{errors.label}</p>
      </div>
      <div className={styles.segments}>{(['Chi', 'Thu'] as const).map(k => <button key={k} type="button" disabled={sending} aria-pressed={kind === k} onClick={() => setKind(k)}>{k === 'Chi' ? 'Sẽ chi' : 'Sẽ thu'}</button>)}</div>
      <div className={styles.field}>
        <label htmlFor="plan-amount">Số tiền · VND · chưa biết thì để trống</label>
        <div className={styles.amountEntry}>
          <input id="plan-amount" inputMode="numeric" autoComplete="off" placeholder="chưa rõ" disabled={sending}
            value={amount ? amount.toLocaleString('vi-VN') : ''} onChange={e => { setAmount(Number(e.target.value.replace(/\D/g, '').slice(0, 12))); clear('amount'); }} />
          <span>đ</span>
          <button className={styles.zeros} type="button" disabled={sending} onClick={() => setAmount(a => (a * 1000 <= 999_999_999_999 ? a * 1000 : a))}>000</button>
        </div>
        <p className={styles.fieldError}>{errors.amount}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="plan-date">Ngày</label>
        <input id="plan-date" type="date" disabled={sending} value={date} onChange={e => { setDate(e.target.value); clear('date'); }} aria-invalid={Boolean(errors.date)} />
        <p className={styles.fieldError}>{errors.date}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="plan-account">Tài khoản · không bắt buộc</label>
        <select id="plan-account" disabled={sending} value={account} onChange={e => setAccount(e.target.value)}>
          <option value="">Chưa chọn</option>
          {accounts.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <label>Mức chắc chắn</label>
        <div className={styles.segments} style={{ margin: 0 }}>
          <button type="button" disabled={sending} aria-pressed={certain} onClick={() => setCertain(true)}>Chắc chắn</button>
          <button type="button" disabled={sending} aria-pressed={!certain} onClick={() => setCertain(false)}>Dự kiến</button>
        </div>
        <p className={styles.hint}>{certain ? 'Tính vào số "chắc chắn" và nhắc trong bản tin sáng.' : 'Chỉ ghi nhớ, không tính vào tổng. Vẫn nhắc nhẹ khi gần ngày.'}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="plan-note">Ghi chú · không bắt buộc</label>
        <textarea id="plan-note" disabled={sending} value={note} onChange={e => setNote(e.target.value)} />
      </div>
      {errors.general && <div className={styles.notice} role="alert">{errors.general}</div>}
    </div>
    <div className={styles.drawerFooter}>
      <button className={styles.primary} type="submit" disabled={sending}>{sending ? 'Đang gửi…' : Object.keys(errors).length ? 'Thử gửi lại' : 'Lưu vào lịch'}</button>
    </div>
  </form>;
}
