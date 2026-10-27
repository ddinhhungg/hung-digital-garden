import { useEffect, useRef, useState } from 'react';
import { MoneyError, type Account, type AddResult, type NewTransaction, type Summary } from '../../lib/money/types';
import MoneyAmount from './MoneyAmount';
import { moneyErrorText } from './MoneyState';
import styles from './money.module.css';

export interface TransactionDrawerProps {
  open: boolean; accounts: Account[]; categories: Summary['meta']['categories'];
  defaultAccount: string; today: string; hidden: boolean;
  onSubmit: (t: NewTransaction) => Promise<AddResult>;
  onClose: () => void; onUnauthorized: () => void;
}
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

export default function TransactionDrawer({ open, accounts, categories, defaultAccount, today, hidden, onSubmit, onClose, onUnauthorized }: TransactionDrawerProps) {
  const fresh = (): NewTransaction => ({ date: today, type: 'Chi', amount: 0, from: defaultAccount, to: 'Ngoài', category: '', note: '' });
  const [draft, setDraft] = useState<NewTransaction>(fresh);
  const [dirty, setDirty] = useState(false), [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AddResult | null>(null);
  const [hint, setHint] = useState(''), [manualCategory, setManualCategory] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null), pending = useRef(false);
  const closeRef = useRef(() => {});
  const clear = () => { setDraft(fresh()); setDirty(false); setErrors({}); setResult(null); setHint(''); setManualCategory(false); };
  const close = () => { if (pending.current) return; clear(); onClose(); };
  useEffect(() => { closeRef.current = close; });
  useEffect(() => { if (!dirty && !pending.current && !result) setDraft({ date: today, type: 'Chi', amount: 0, from: defaultAccount, to: 'Ngoài', category: '', note: '' }); }, [today, defaultAccount, dirty, result]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const shell = document.getElementById('money-panel')?.closest('section');
    const wasInert = shell?.inert ?? false;
    if (shell) shell.inert = true;
    const first = () => dialogRef.current?.querySelector<HTMLElement>('input:not(:disabled),button:not(:disabled)');
    first()?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const nodes = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled)') ?? [])];
      if (!nodes.length) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); if (shell) shell.inert = wasInert; if (previous?.isConnected) previous.focus(); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (result) dialogRef.current?.querySelector<HTMLElement>('[data-done]')?.focus();
    else if (Object.keys(errors).length) dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [result, errors, open]);

  function patch(value: Partial<NewTransaction>, fields: string[] = []) {
    setDirty(true); setDraft(d => ({ ...d, ...value }));
    setErrors(old => Object.fromEntries(Object.entries(old).filter(([field]) => !fields.includes(field))));
  }
  function changeType(type: NewTransaction['type']) {
    const account = draft.type === 'Thu' ? draft.to : draft.from;
    patch({ type, from: type === 'Thu' ? 'Ngoài' : account, to: type === 'Thu' ? account : type === 'Chi' ? 'Ngoài' : '', category: '' });
    setErrors({}); setHint(''); setManualCategory(false);
  }
  function noteChanged(note: string) {
    const match = categories.find(c => c.type === draft.type && c.hints.some(h => normalize(note).includes(normalize(h))));
    patch({ note, ...(!manualCategory && match ? { category: match.name } : {}) }, match && !manualCategory ? ['category'] : []);
    setHint(match ? `Gợi ý: ${match.name}${manualCategory ? ' · giữ danh mục anh đã chọn' : ' · có thể đổi lại'}` : '');
  }
  const options = (pocket: boolean) => accounts.filter(a => (a.fundCode !== null) === pocket).map(a => <option key={a.code} value={a.code}>{a.name}</option>);
  const accountSelect = (field: 'from' | 'to', label: string, value: string) => <div className={styles.field}><label htmlFor={`money-${field}`}>{label}</label><select id={`money-${field}`} disabled={sending} value={value} onChange={e => patch({ [field]: e.target.value }, [field])} aria-invalid={Boolean(errors[field])} aria-describedby={`money-error-${field}`}><option value="">Chọn tài khoản</option><optgroup label="Tài khoản thường">{options(false)}</optgroup><optgroup label="Ngăn quỹ">{options(true)}</optgroup></select><p id={`money-error-${field}`} className={styles.fieldError}>{errors[field]}</p></div>;

  async function submit() {
    if (pending.current) return;
    const next: Record<string, string> = {};
    if (!Number.isSafeInteger(draft.amount) || draft.amount <= 0) next.amount = 'Nhập số tiền nguyên dương bằng VND.';
    if (draft.type !== 'Thu' && !accounts.some(a => a.code === draft.from)) next.from = 'Chọn tài khoản nguồn.';
    if (draft.type !== 'Chi' && !accounts.some(a => a.code === draft.to)) next.to = 'Chọn tài khoản nhận.';
    if (draft.type === 'Chuyển' && draft.from === draft.to) next.to = 'Hai tài khoản phải khác nhau.';
    if (draft.type !== 'Chuyển' && !categories.some(c => c.type === draft.type && c.name === draft.category)) next.category = 'Chọn danh mục phù hợp.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date) || !Number.isFinite(Date.parse(`${draft.date}T00:00:00Z`)) || new Date(`${draft.date}T00:00:00Z`).toISOString().slice(0, 10) !== draft.date) next.date = 'Chọn ngày hợp lệ.';
    if (Object.keys(next).length) { setErrors(next); return; }
    pending.current = true; setSending(true); setErrors({});
    try {
      const transaction: NewTransaction = { date: draft.date, type: draft.type, amount: draft.amount, from: draft.from, to: draft.to, note: draft.note ?? '' };
      if (draft.type !== 'Chuyển') transaction.category = draft.category;
      setResult(await onSubmit(transaction));
    } catch (value) {
      const error = value as MoneyError;
      const message = error.code === 'VALIDATION' ? error.message : moneyErrorText[error.code] ?? moneyErrorText.SERVER;
      const field = draft.type === 'Thu' && error.field === 'from' ? 'to' : draft.type === 'Chi' && error.field === 'to' ? 'from' : error.field;
      setErrors({ [field && ['amount', 'from', 'to', 'category', 'note', 'date', 'type'].includes(field) ? field : 'general']: message });
      if (error.code === 'UNAUTHORIZED') onUnauthorized();
    } finally { pending.current = false; setSending(false); }
  }
  if (!open) return null;
  return <div className={`${styles.root} ${styles.overlay}`} onPointerDown={e => { if (e.target === e.currentTarget) close(); }}>
    <div ref={dialogRef} className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="money-drawer-title" aria-busy={sending}>
      <div className={styles.handle} />
      {result ? <div className={styles.success}><h2 id="money-drawer-title">Đã ghi vào sổ.</h2><p>Khoản {draft.type.toLowerCase()} <MoneyAmount value={draft.amount} hidden={hidden} /></p><h3>Số dư mới</h3>{Object.entries(result.balances).map(([code, balance]) => <div className={styles.row} key={code}><span>{accounts.find(a => a.code === code)?.name ?? code}</span><MoneyAmount value={balance} hidden={hidden} /></div>)}<button data-done className={styles.primary} onClick={close}>Xong</button></div> : <form className={styles.drawerForm} onSubmit={e => { e.preventDefault(); void submit(); }}>
        <div className={styles.drawerHeading}><h2 id="money-drawer-title">Thêm giao dịch</h2><button type="button" className={styles.iconButton} disabled={sending} onClick={close} aria-label="Đóng">×</button></div>
        <div className={styles.drawerScroll}>
          <div className={styles.field}><label htmlFor="money-amount">Số tiền · VND</label><div className={styles.amountEntry}><input id="money-amount" inputMode="numeric" autoComplete="off" placeholder="0" disabled={sending} value={draft.amount ? draft.amount.toLocaleString('vi-VN') : ''} onChange={e => patch({ amount: Number(e.target.value.replace(/\D/g, '').slice(0, 15)) }, ['amount'])} aria-invalid={Boolean(errors.amount)} aria-describedby="money-error-amount" /><span>đ</span><button className={styles.zeros} type="button" disabled={sending} onClick={() => { const amount = draft.amount * 1000; if (Number.isSafeInteger(amount)) patch({ amount }, ['amount']); else setErrors({ amount: 'Số tiền quá lớn.' }); }}>000</button></div><p id="money-error-amount" className={styles.fieldError}>{errors.amount}</p></div>
          <div className={styles.segments}>{(['Chi', 'Thu', 'Chuyển'] as const).map(type => <button key={type} type="button" disabled={sending} aria-pressed={draft.type === type} onClick={() => changeType(type)}>{type}</button>)}</div>{errors.type && <p className={styles.fieldError}>{errors.type}</p>}
          {draft.type === 'Thu' ? accountSelect('to', 'Tài khoản', draft.to) : accountSelect('from', draft.type === 'Chuyển' ? 'Từ tài khoản' : 'Tài khoản', draft.from)}
          {draft.type === 'Chuyển' ? accountSelect('to', 'Đến tài khoản', draft.to) : <div className={styles.field}><label htmlFor="money-category">Danh mục</label><select id="money-category" value={draft.category ?? ''} disabled={sending} onChange={e => { patch({ category: e.target.value }, ['category']); setManualCategory(true); }} aria-invalid={Boolean(errors.category)} aria-describedby="money-error-category"><option value="">Chọn danh mục</option>{categories.filter(c => c.type === draft.type).map(c => <option key={c.name}>{c.name}</option>)}</select><p id="money-error-category" className={styles.fieldError}>{errors.category}</p><p className={styles.hint}>{hint}</p></div>}
          <div className={styles.field}><label htmlFor="money-note">Ghi chú · không bắt buộc</label><textarea id="money-note" value={draft.note ?? ''} disabled={sending} onChange={e => { noteChanged(e.target.value); setErrors(old => { const next = { ...old }; delete next.note; return next; }); }} aria-invalid={Boolean(errors.note)} aria-describedby="money-error-note" /><p id="money-error-note" className={styles.fieldError}>{errors.note}</p></div>
          <div className={styles.field}><label htmlFor="money-date">Ngày</label><input id="money-date" type="date" value={draft.date} disabled={sending} onChange={e => patch({ date: e.target.value }, ['date'])} aria-invalid={Boolean(errors.date)} aria-describedby="money-error-date" /><p id="money-error-date" className={styles.fieldError}>{errors.date}</p></div>
          {errors.general && <div className={styles.notice} role="alert">{errors.general}</div>}
        </div><div className={styles.drawerFooter}><button className={styles.primary} type="submit" disabled={sending}>{sending ? 'Đang gửi…' : Object.keys(errors).length ? 'Thử gửi lại' : `Lưu khoản ${draft.type.toLowerCase()}`}</button></div>
      </form>}
    </div>
  </div>;
}
