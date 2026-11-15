import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MoneyError, type Account, type CalendarItem, type CompleteFixedInput, type CompletePlanInput, type CompleteResult,
  type NewPlan, type PlanStatus, type Summary,
} from '../../lib/money/types';
import { daysBetween, dayTitle, kindSign, kindTone, shiftMonth } from '../../lib/money/calendar';
import { dateIsValid, matchCategory } from '../../lib/money/categories';
import { itemEmoji } from '../../lib/money/emoji';
import AccountSelect from './AccountSelect';
import AmountField from './AmountField';
import MoneyAmount from './MoneyAmount';
import { moneyErrorText } from './MoneyState';
import { useModal } from './useModal';
import styles from './money.module.css';

export interface CalendarSheetProps {
  items: CalendarItem[]; accounts: Account[]; categories: Summary['meta']['categories'];
  /** Mức của Apps Script. Từ 2: bấm Xong tự ghi sổ, có khoản chuyển quỹ. */
  apiLevel: number;
  today: string; hidden: boolean;
  initialMonth: string; initialDate: string | null; startInForm: boolean;
  onAdd: (plan: NewPlan) => Promise<{ id: string }>;
  onSetStatus: (id: string, status: PlanStatus, date?: string) => Promise<void>;
  onCompletePlan: (input: CompletePlanInput) => Promise<CompleteResult>;
  onCompleteFixed: (input: CompleteFixedInput) => Promise<CompleteResult>;
  onClose: () => void; onUnauthorized: () => void;
}

type Filter = 'all' | 'sure' | 'maybe' | 'done';
type View = 'agenda' | 'form' | 'complete';
const filters: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' }, { key: 'sure', label: 'Chắc chắn' },
  { key: 'maybe', label: 'Dự kiến' }, { key: 'done', label: 'Đã xong' },
];
const errorMessage = (e: MoneyError) => e.code === 'VALIDATION' ? e.message : moneyErrorText[e.code] ?? moneyErrorText.SERVER;
const typeOf = (kind: CalendarItem['kind']) => kind === 'in' ? 'Thu' : kind === 'out' ? 'Chi' : 'Chuyển';
const FIXED_TICK_DAYS = 7; // khoản cố định chỉ hiện nút Đã trả / Đã nhận khi còn tối đa chừng này ngày nữa

export default function CalendarSheet(p: CalendarSheetProps) {
  const { items, accounts, categories, apiLevel, today, hidden, onAdd, onSetStatus, onClose, onUnauthorized } = p;
  const smart = apiLevel >= 2;
  const [view, setView] = useState<View>(p.startInForm ? 'form' : 'agenda');
  const [completing, setCompleting] = useState<CalendarItem | null>(null);
  const [month, setMonth] = useState(p.initialMonth);
  const [filter, setFilter] = useState<Filter>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [moving, setMoving] = useState<{ id: string; date: string } | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [problem, setProblem] = useState('');
  const [toast, setToast] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  useModal(dialogRef, () => {
    if (view === 'complete') { setView('agenda'); setCompleting(null); }
    else if (view === 'form' && !p.startInForm) setView('agenda');
    else onClose();
  });

  const accountName = (code: string | null | undefined) => code ? accounts.find(a => a.code === code)?.name ?? code : null;
  const passes = (i: CalendarItem) => {
    if (i.status === 'Huỷ') return false;
    if (filter === 'done') return i.status === 'Đã xong';
    if (filter === 'sure') return i.certain && i.status !== 'Đã xong';
    if (filter === 'maybe') return !i.certain && i.status !== 'Đã xong';
    return true;
  };
  const overdue = useMemo(
    () => items.filter(i => (i.source === 'plan' || smart) && i.status === 'Chờ' && i.date < today && passes(i)),
    [items, today, filter, smart], // eslint-disable-line react-hooks/exhaustive-deps
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
  function startComplete(item: CalendarItem) { setProblem(''); setCompleting(item); setView('complete'); }

  const row = (item: CalendarItem, i: number) => {
    const isDone = item.status === 'Đã xong';
    const isPlan = item.source === 'plan' && Boolean(item.id);
    const working = busy === item.id;
    const showTick = !isDone && item.source === 'fixed' && smart && daysBetween(today, item.date) <= FIXED_TICK_DAYS;
    const tickLabel = item.kind === 'in' ? '✓ Đã nhận' : item.kind === 'move' ? '✓ Đã chuyển' : '✓ Đã trả';
    const route = item.kind === 'move' && (accountName(item.account) || accountName(item.to))
      ? ` · ${accountName(item.account) ?? '?'} → ${accountName(item.to) ?? '?'}`
      : accountName(item.account) ? ` · ${accountName(item.account)}` : '';
    return <li key={`${item.id ?? 'fx'}-${item.label}-${item.date}-${i}`} className={`${styles.planRow} ${isDone ? styles.planDone : ''}`}>
      <div className={styles.planMain}>
        <span className={styles.emoji} aria-hidden="true">{itemEmoji(item.label)}</span>
        <span className={styles.itemText}>
          <span>{item.label}</span>
          <small>
            {item.source === 'fixed' ? 'Cố định' : item.certain ? 'Chắc chắn' : 'Dự kiến'}
            {route}
            {isDone ? (item.txId ? ' · đã ghi sổ' : ' · đã xong') : ''}
          </small>
          {item.note && <small className={styles.planNote}>{item.note}</small>}
        </span>
        {item.amount !== null
          ? <MoneyAmount value={item.amount} hidden={hidden} sign={kindSign(item.kind)} direction={kindTone(item.kind)} size="small" />
          : <em className={styles.unknownAmount}>chưa rõ</em>}
      </div>
      {isPlan && <div className={styles.planActions}>
        {isDone
          ? (item.txId
            ? <span className={styles.planLogged}>Đã ghi vào sổ</span>
            : <button type="button" disabled={working} onClick={() => void act(item, 'Chờ')}>↺ Mở lại</button>)
          : moving?.id === item.id
            ? <>
              <input type="date" aria-label="Dời sang ngày" value={moving.date} onChange={e => setMoving({ id: item.id!, date: e.target.value })} />
              <button type="button" disabled={working || !dateIsValid(moving.date)} onClick={() => void act(item, 'Chờ', moving.date, 'Đã dời lịch')}>Lưu</button>
              <button type="button" onClick={() => setMoving(null)}>Bỏ</button>
            </>
            : cancelling === item.id
              ? <>
                <span className={styles.planAsk}>Huỷ khoản này?</span>
                <button type="button" className={styles.planDanger} disabled={working} onClick={() => void act(item, 'Huỷ', undefined, 'Đã huỷ kế hoạch')}>Huỷ thật</button>
                <button type="button" onClick={() => setCancelling(null)}>Thôi</button>
              </>
              : <>
                <button type="button" className={styles.planOk} disabled={working}
                  onClick={() => smart ? startComplete(item) : void act(item, 'Đã xong', undefined, 'Đã đánh dấu xong')}>✓ Xong</button>
                <button type="button" disabled={working} onClick={() => setMoving({ id: item.id!, date: item.date })}>Dời ngày</button>
                <button type="button" disabled={working} onClick={() => setCancelling(item.id)}>Huỷ</button>
              </>}
      </div>}
      {showTick && <div className={styles.planActions}>
        <button type="button" className={styles.planOk} onClick={() => startComplete(item)}>{tickLabel}</button>
      </div>}
    </li>;
  };

  return <div className={`${styles.root} ${styles.overlay}`} onPointerDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={dialogRef} className={`${styles.drawer} ${styles.sheet}`} role="dialog" aria-modal="true" aria-labelledby="money-cal-title">
      <div className={styles.handle} />
      {view === 'complete' && completing
        ? <CompleteForm
          key={`${completing.id ?? completing.label}-${completing.date}`}
          item={completing} accounts={accounts} categories={categories} today={today}
          onCompletePlan={p.onCompletePlan} onCompleteFixed={p.onCompleteFixed} onUnauthorized={onUnauthorized}
          onBack={() => { setView('agenda'); setCompleting(null); }}
          onDone={(text) => { setView('agenda'); setCompleting(null); flash(text); }}
        />
        : view === 'form'
          ? <PlanForm
            accounts={accounts} today={today} smart={smart} defaultDate={p.initialDate ?? today} onAdd={onAdd} onUnauthorized={onUnauthorized}
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
              {!overdue.length && !groups.length && <p className={styles.sheetEmpty}>Tháng này chưa có gì trong mục này.<br /><span>Bấm &quot;Thêm kế hoạch&quot; để ghi lại nhé.</span></p>}
            </div>
            <div className={styles.drawerFooter}>
              {toast && <p className={styles.sheetToast} role="status">{toast}</p>}
              <button type="button" className={styles.primary} onClick={() => setView('form')}>＋ Thêm kế hoạch</button>
            </div>
          </>}
    </div>
  </div>;
}

// Bấm Xong / Đã trả / Đã nhận: số liệu điền sẵn từ kế hoạch, sửa nếu thực tế khác rồi ghi sổ một lần.
function CompleteForm({ item, accounts, categories, today, onCompletePlan, onCompleteFixed, onBack, onDone, onUnauthorized }: {
  item: CalendarItem; accounts: Account[]; categories: Summary['meta']['categories']; today: string;
  onCompletePlan: CalendarSheetProps['onCompletePlan']; onCompleteFixed: CalendarSheetProps['onCompleteFixed'];
  onBack: () => void; onDone: (text: string) => void; onUnauthorized: () => void;
}) {
  const type = typeOf(item.kind);
  const [amount, setAmount] = useState(item.amount ?? 0);
  const [date, setDate] = useState(today);
  const [account, setAccount] = useState(item.account ?? '');
  const [to, setTo] = useState(item.to ?? '');
  const [category, setCategory] = useState(item.category ?? (type === 'Chuyển' ? '' : matchCategory(categories, type, item.label)));
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = useRef(false);
  const clear = (field: string) => setErrors(old => { const n = { ...old }; delete n[field]; return n; });
  const options = categories.filter(c => c.type === type);

  async function send(record: boolean) {
    if (pending.current) return;
    const next: Record<string, string> = {};
    if (record) {
      if (!Number.isSafeInteger(amount) || amount <= 0) next.amount = 'Nhập số tiền để ghi sổ.';
      if (!accounts.some(a => a.code === account)) next.account = type === 'Thu' ? 'Chọn tài khoản nhận tiền.' : 'Chọn tài khoản.';
      if (type === 'Chuyển') {
        if (!accounts.some(a => a.code === to)) next.to = 'Chọn tài khoản đến.';
        else if (to === account) next.to = 'Hai tài khoản phải khác nhau.';
      } else if (!options.some(c => c.name === category)) next.category = 'Chọn danh mục phù hợp.';
      if (!dateIsValid(date)) next.date = 'Chọn ngày hợp lệ.';
    }
    if (Object.keys(next).length) { setErrors(next); return; }
    pending.current = true; setSending(true); setErrors({});
    try {
      if (item.source === 'plan') {
        await onCompletePlan(record
          ? { id: item.id!, record: true, date, amount, account, ...(type === 'Chuyển' ? { to } : { category }), note: note.trim() }
          : { id: item.id!, record: false });
      } else {
        await onCompleteFixed(record
          ? { label: item.label, date: item.date, record: true, txDate: date, amount, account, category, note: note.trim() }
          : { label: item.label, date: item.date, record: false });
      }
      onDone(record ? 'Đã ghi vào sổ' : 'Đã đánh dấu xong');
    } catch (value) {
      const e = value as MoneyError;
      const field = e.field === 'txDate' ? 'date' : e.field;
      setErrors({ [field && ['amount', 'account', 'to', 'category', 'date'].includes(field) ? field : 'general']: errorMessage(e) });
      if (e.code === 'UNAUTHORIZED') onUnauthorized();
    } finally { pending.current = false; setSending(false); }
  }

  const verb = item.kind === 'in' ? 'nhận' : item.kind === 'move' ? 'chuyển' : 'trả';
  return <form className={styles.drawerForm} onSubmit={e => { e.preventDefault(); void send(true); }}>
    <div className={styles.drawerHeading}>
      <h2 id="money-cal-title">Xong khoản này</h2>
      <button type="button" className={styles.iconButton} disabled={sending} onClick={onBack} aria-label="Quay lại">×</button>
    </div>
    <div className={styles.drawerScroll}>
      <p className={styles.completeLead}>
        <span aria-hidden="true">{itemEmoji(item.label)}</span> <b>{item.label}</b>
        <small>theo lịch ngày {Number(item.date.slice(8))}/{Number(item.date.slice(5, 7))}, {type === 'Thu' ? 'thu' : type === 'Chi' ? 'chi' : 'chuyển quỹ'}</small>
      </p>
      <p className={styles.hint}>Thực tế {verb} khác kế hoạch thì sửa lại, rồi bấm Ghi sổ. App tự tạo giao dịch, anh không phải nhắn lại.</p>
      <AmountField id="complete-amount" label="Số tiền thực tế · VND" value={amount} disabled={sending} error={errors.amount}
        placeholder={item.amount === null ? 'chưa rõ, nhập số thật' : '0'} onChange={v => { setAmount(v); clear('amount'); }} />
      <AccountSelect id="complete-account" label={type === 'Thu' ? 'Tiền vào tài khoản' : type === 'Chi' ? 'Trả từ tài khoản' : 'Chuyển từ'}
        value={account} accounts={accounts} disabled={sending} error={errors.account} onChange={v => { setAccount(v); clear('account'); }} />
      {type === 'Chuyển'
        ? <AccountSelect id="complete-to" label="Chuyển đến" value={to} accounts={accounts} disabled={sending} error={errors.to}
          onChange={v => { setTo(v); clear('to'); }} />
        : <div className={styles.field}>
          <label htmlFor="complete-category">Danh mục</label>
          <select id="complete-category" disabled={sending} value={category} aria-invalid={Boolean(errors.category)} onChange={e => { setCategory(e.target.value); clear('category'); }}>
            <option value="">Chọn danh mục</option>
            {options.map(c => <option key={c.name}>{c.name}</option>)}
          </select>
          <p className={styles.fieldError}>{errors.category}</p>
        </div>}
      <div className={styles.field}>
        <label htmlFor="complete-date">Ngày ghi sổ</label>
        <input id="complete-date" type="date" disabled={sending} value={date} aria-invalid={Boolean(errors.date)} onChange={e => { setDate(e.target.value); clear('date'); }} />
        <p className={styles.fieldError}>{errors.date}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="complete-note">Ghi chú · không bắt buộc</label>
        <textarea id="complete-note" disabled={sending} value={note} placeholder={item.label} onChange={e => setNote(e.target.value)} />
      </div>
      {errors.general && <div className={styles.notice} role="alert">{errors.general}</div>}
    </div>
    <div className={styles.drawerFooter}>
      <button className={styles.primary} type="submit" disabled={sending}>{sending ? 'Đang ghi…' : Object.keys(errors).length ? 'Thử ghi lại' : 'Xong và ghi sổ'}</button>
      <button type="button" className={styles.linkButton} disabled={sending} onClick={() => void send(false)}>Chỉ đánh dấu xong, không ghi sổ</button>
      <p className={styles.footHint}>Chọn cách này khi anh đã ghi khoản đó rồi.</p>
    </div>
  </form>;
}

function PlanForm({ accounts, today, smart, defaultDate, onAdd, onBack, onDone, onUnauthorized }: {
  accounts: Account[]; today: string; smart: boolean; defaultDate: string;
  onAdd: CalendarSheetProps['onAdd']; onBack: () => void; onDone: (date: string) => void; onUnauthorized: () => void;
}) {
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<'Chi' | 'Thu' | 'Chuyển'>('Chi');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(defaultDate >= today ? defaultDate : today);
  const [account, setAccount] = useState('');
  const [to, setTo] = useState('');
  const [certain, setCertain] = useState(true);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = useRef(false);
  const clear = (field: string) => setErrors(old => { const n = { ...old }; delete n[field]; return n; });
  const kinds = smart ? (['Chi', 'Thu', 'Chuyển'] as const) : (['Chi', 'Thu'] as const);
  const kindLabel = { Chi: 'Sẽ chi', Thu: 'Sẽ thu', Chuyển: 'Chuyển quỹ' } as const;

  async function submit() {
    if (pending.current) return;
    const next: Record<string, string> = {};
    const name = label.trim();
    if (!name || name.length > 80) next.label = 'Nhập tên từ 1 đến 80 ký tự.';
    if (!dateIsValid(date)) next.date = 'Chọn ngày hợp lệ.';
    if (kind === 'Chuyển' && account && to && account === to) next.to = 'Hai tài khoản phải khác nhau.';
    if (Object.keys(next).length) { setErrors(next); return; }
    pending.current = true; setSending(true); setErrors({});
    try {
      await onAdd({ date, label: name, kind, amount: amount > 0 ? amount : null, account: account || null, ...(kind === 'Chuyển' ? { to: to || null } : {}), certain, note: note.trim() });
      onDone(date);
    } catch (value) {
      const e = value as MoneyError;
      setErrors({ [e.field && ['label', 'amount', 'date', 'account', 'to', 'note'].includes(e.field) ? e.field : 'general']: errorMessage(e) });
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
      <div className={styles.segments}>{kinds.map(k => <button key={k} type="button" disabled={sending} aria-pressed={kind === k} onClick={() => setKind(k)}>{kindLabel[k]}</button>)}</div>
      <AmountField id="plan-amount" label="Số tiền · VND · chưa biết thì để trống" value={amount} disabled={sending} error={errors.amount}
        placeholder="chưa rõ" onChange={v => { setAmount(v); clear('amount'); }} />
      <div className={styles.field}>
        <label htmlFor="plan-date">Ngày</label>
        <input id="plan-date" type="date" disabled={sending} value={date} onChange={e => { setDate(e.target.value); clear('date'); }} aria-invalid={Boolean(errors.date)} />
        <p className={styles.fieldError}>{errors.date}</p>
      </div>
      <AccountSelect id="plan-account" label={kind === 'Chuyển' ? 'Chuyển từ · không bắt buộc' : 'Tài khoản · không bắt buộc'} value={account}
        accounts={accounts} disabled={sending} placeholder="Chưa chọn" onChange={v => { setAccount(v); clear('to'); }} />
      {kind === 'Chuyển' && <AccountSelect id="plan-to" label="Chuyển đến · không bắt buộc" value={to} accounts={accounts}
        disabled={sending} error={errors.to} placeholder="Chưa chọn" onChange={v => { setTo(v); clear('to'); }} />}
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
