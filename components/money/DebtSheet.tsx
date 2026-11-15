import { useRef, useState, type ReactNode } from 'react';
import {
  MoneyError, type Account, type Debt, type DebtResult, type NewDebt, type OffsetResult, type SettleDebtInput,
} from '../../lib/money/types';
import { dateIsValid } from '../../lib/money/categories';
import AccountSelect from './AccountSelect';
import AmountField from './AmountField';
import MoneyAmount from './MoneyAmount';
import { moneyErrorText } from './MoneyState';
import { useModal } from './useModal';
import styles from './money.module.css';

export type DebtMode =
  | { type: 'new'; direction: 'lend' | 'borrow' }
  | { type: 'settle'; debt: Debt }
  | { type: 'offset'; receivable: Debt; payable: Debt };

export interface DebtSheetProps {
  mode: DebtMode; accounts: Account[]; defaultAccount: string; today: string; hidden: boolean;
  onAdd: (input: NewDebt) => Promise<DebtResult>;
  onSettle: (input: SettleDebtInput) => Promise<DebtResult>;
  onOffset: (receivable: string, payable: string) => Promise<OffsetResult>;
  onClose: () => void; onUnauthorized: () => void;
}

const errorMessage = (e: MoneyError) => e.code === 'VALIDATION' ? e.message : moneyErrorText[e.code] ?? moneyErrorText.SERVER;
const money = new Intl.NumberFormat('vi-VN');

// Ghi nợ mới, thu nợ / trả nợ (từng phần cũng được) và bù trừ: bấm trong app, app tự ghi sổ.
export default function DebtSheet(p: DebtSheetProps) {
  const { mode, accounts, hidden, onClose } = p;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState<{ title: string; lines: ReactNode[]; balances: Record<string, number> } | null>(null);
  const [sending, setSending] = useState(false);
  useModal(dialogRef, () => { if (!sending) onClose(); });

  const name = (code: string) => accounts.find(a => a.code === code)?.name ?? code;
  const title = mode.type === 'new' ? 'Ghi nợ mới'
    : mode.type === 'offset' ? 'Bù trừ nợ'
      : mode.debt.kind === 'receivable' ? 'Họ trả tôi' : 'Tôi trả họ';

  return <div className={`${styles.root} ${styles.overlay}`} onPointerDown={e => { if (e.target === e.currentTarget && !sending) onClose(); }}>
    <div ref={dialogRef} className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="money-debt-title" aria-busy={sending}>
      <div className={styles.handle} />
      {done
        ? <div className={styles.success}>
          <h2 id="money-debt-title">{done.title}</h2>
          {done.lines.map((line, i) => <p key={i}>{line}</p>)}
          {Object.keys(done.balances).length > 0 && <>
            <h3>Số dư mới</h3>
            {Object.entries(done.balances).map(([code, balance]) => <div className={styles.row} key={code}><span>{name(code)}</span><MoneyAmount value={balance} hidden={hidden} /></div>)}
          </>}
          <button type="button" data-done className={styles.primary} onClick={onClose}>Xong</button>
        </div>
        : <>
          <div className={styles.drawerHeading}>
            <h2 id="money-debt-title">{title}</h2>
            <button type="button" className={styles.iconButton} disabled={sending} onClick={onClose} aria-label="Đóng">×</button>
          </div>
          {mode.type === 'new' && <NewForm {...p} mode={mode} setSending={setSending} sending={sending} onDone={setDone} />}
          {mode.type === 'settle' && <SettleForm {...p} mode={mode} setSending={setSending} sending={sending} onDone={setDone} />}
          {mode.type === 'offset' && <OffsetForm {...p} mode={mode} setSending={setSending} sending={sending} onDone={setDone} />}
        </>}
    </div>
  </div>;
}

type FormProps<M extends DebtMode> = DebtSheetProps & {
  mode: M; sending: boolean; setSending: (v: boolean) => void;
  onDone: (d: { title: string; lines: ReactNode[]; balances: Record<string, number> }) => void;
};

function useSubmit(p: { setSending: (v: boolean) => void; onUnauthorized: () => void }, fields: string[]) {
  const pending = useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clear = (field: string) => setErrors(old => { const n = { ...old }; delete n[field]; return n; });
  async function run(work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true; p.setSending(true); setErrors({});
    try { await work(); } catch (value) {
      const e = value as MoneyError;
      setErrors({ [e.field && fields.includes(e.field) ? e.field : 'general']: errorMessage(e) });
      if (e.code === 'UNAUTHORIZED') p.onUnauthorized();
    } finally { pending.current = false; p.setSending(false); }
  }
  return { errors, setErrors, clear, run };
}

function NewForm(p: FormProps<Extract<DebtMode, { type: 'new' }>>) {
  const [direction, setDirection] = useState(p.mode.direction);
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState(0);
  const [account, setAccount] = useState(p.defaultAccount);
  const [date, setDate] = useState(p.today);
  const [due, setDue] = useState('');
  const [note, setNote] = useState('');
  const { errors, setErrors, clear, run } = useSubmit(p, ['party', 'amount', 'account', 'date', 'due', 'note']);
  const lend = direction === 'lend';

  function submit() {
    const next: Record<string, string> = {};
    if (!party.trim() || party.trim().length > 80) next.party = 'Nhập tên người từ 1 đến 80 ký tự.';
    if (!Number.isSafeInteger(amount) || amount <= 0) next.amount = 'Nhập số tiền nguyên dương bằng VND.';
    if (!p.accounts.some(a => a.code === account)) next.account = 'Chọn tài khoản.';
    if (!dateIsValid(date)) next.date = 'Chọn ngày hợp lệ.';
    if (due && !dateIsValid(due)) next.due = 'Chọn ngày hợp lệ.';
    if (Object.keys(next).length) { setErrors(next); return; }
    void run(async () => {
      const result = await p.onAdd({ direction, party: party.trim(), amount, account, date, ...(due ? { due } : {}), ...(note.trim() ? { note: note.trim() } : {}) });
      p.onDone({
        title: 'Đã ghi nợ.',
        lines: [<>{lend ? `Anh cho ${party.trim()} mượn ` : `Anh mượn của ${party.trim()} `}<MoneyAmount value={amount} hidden={p.hidden} />{result.code ? ` · mã ${result.code}` : ''}</>],
        balances: result.balances,
      });
    });
  }

  return <form className={styles.drawerForm} onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className={styles.drawerScroll}>
      <div className={styles.segments}>
        <button type="button" disabled={p.sending} aria-pressed={lend} onClick={() => setDirection('lend')}>Tôi cho ai mượn</button>
        <button type="button" disabled={p.sending} aria-pressed={!lend} onClick={() => setDirection('borrow')}>Tôi mượn của ai</button>
      </div>
      <div className={styles.field}>
        <label htmlFor="debt-party">{lend ? 'Cho ai mượn?' : 'Mượn của ai?'}</label>
        <input id="debt-party" maxLength={80} autoComplete="off" placeholder="Tên người" disabled={p.sending} value={party}
          onChange={e => { setParty(e.target.value); clear('party'); }} aria-invalid={Boolean(errors.party)} />
        <p className={styles.fieldError}>{errors.party}</p>
      </div>
      <AmountField id="debt-amount" label="Số tiền · VND" value={amount} disabled={p.sending} error={errors.amount} onChange={v => { setAmount(v); clear('amount'); }} />
      <AccountSelect id="debt-account" label={lend ? 'Lấy tiền từ tài khoản' : 'Nhận tiền vào tài khoản'} value={account} accounts={p.accounts}
        disabled={p.sending} error={errors.account} onChange={v => { setAccount(v); clear('account'); }} />
      <div className={styles.field}>
        <label htmlFor="debt-date">Ngày</label>
        <input id="debt-date" type="date" disabled={p.sending} value={date} aria-invalid={Boolean(errors.date)} onChange={e => { setDate(e.target.value); clear('date'); }} />
        <p className={styles.fieldError}>{errors.date}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="debt-due">{lend ? 'Hẹn họ trả lúc · không bắt buộc' : 'Hạn trả · không bắt buộc'}</label>
        <input id="debt-due" type="date" disabled={p.sending} value={due} aria-invalid={Boolean(errors.due)} onChange={e => { setDue(e.target.value); clear('due'); }} />
        <p className={styles.fieldError}>{errors.due}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="debt-note">Ghi chú · không bắt buộc</label>
        <textarea id="debt-note" disabled={p.sending} value={note} onChange={e => setNote(e.target.value)} />
      </div>
      {errors.general && <div className={styles.notice} role="alert">{errors.general}</div>}
    </div>
    <div className={styles.drawerFooter}>
      <button className={styles.primary} type="submit" disabled={p.sending}>{p.sending ? 'Đang ghi…' : Object.keys(errors).length ? 'Thử ghi lại' : 'Ghi nợ'}</button>
    </div>
  </form>;
}

function SettleForm(p: FormProps<Extract<DebtMode, { type: 'settle' }>>) {
  const debt = p.mode.debt;
  const recv = debt.kind === 'receivable';
  const [amount, setAmount] = useState(debt.remaining);
  const [account, setAccount] = useState(p.defaultAccount);
  const [date, setDate] = useState(p.today);
  const [note, setNote] = useState('');
  const { errors, setErrors, clear, run } = useSubmit(p, ['amount', 'account', 'date', 'note', 'code']);

  function submit() {
    const next: Record<string, string> = {};
    if (!Number.isSafeInteger(amount) || amount <= 0) next.amount = 'Nhập số tiền nguyên dương bằng VND.';
    else if (amount > debt.remaining) next.amount = `Vượt số còn lại (${money.format(debt.remaining)}đ).`;
    if (!p.accounts.some(a => a.code === account)) next.account = 'Chọn tài khoản.';
    if (!dateIsValid(date)) next.date = 'Chọn ngày hợp lệ.';
    if (Object.keys(next).length) { setErrors(next); return; }
    void run(async () => {
      const result = await p.onSettle({ code: debt.code, amount, account, date, ...(note.trim() ? { note: note.trim() } : {}) });
      const left = result.remaining ?? debt.remaining - amount;
      p.onDone({
        title: result.closed || left === 0 ? 'Đã tất toán.' : 'Đã ghi sổ.',
        lines: [
          <>{recv ? `${debt.party} trả anh ` : `Anh trả ${debt.party} `}<MoneyAmount value={amount} hidden={p.hidden} /></>,
          left === 0 ? 'Khoản nợ này đã đóng.' : <>Còn lại <MoneyAmount value={left} hidden={p.hidden} direction={recv ? 'in' : 'debt'} /></>,
        ],
        balances: result.balances,
      });
    });
  }

  return <form className={styles.drawerForm} onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className={styles.drawerScroll}>
      <p className={styles.completeLead}>
        <span aria-hidden="true">👤</span> <b>{debt.party}</b>
        <small>{recv ? 'đang nợ anh' : 'anh đang nợ'} {hiddenText(debt.remaining, p.hidden)} · mã {debt.code}</small>
      </p>
      <AmountField id="settle-amount" label={recv ? 'Họ trả bao nhiêu · VND' : 'Anh trả bao nhiêu · VND'} value={amount} disabled={p.sending} error={errors.amount}
        onChange={v => { setAmount(v); clear('amount'); }} />
      {amount !== debt.remaining && <button type="button" className={styles.linkButton} disabled={p.sending} onClick={() => { setAmount(debt.remaining); clear('amount'); }}>
        {recv ? 'Họ trả hết' : 'Trả hết'} {hiddenText(debt.remaining, p.hidden)}
      </button>}
      <AccountSelect id="settle-account" label={recv ? 'Tiền vào tài khoản' : 'Trả từ tài khoản'} value={account} accounts={p.accounts}
        disabled={p.sending} error={errors.account} onChange={v => { setAccount(v); clear('account'); }} />
      <div className={styles.field}>
        <label htmlFor="settle-date">Ngày</label>
        <input id="settle-date" type="date" disabled={p.sending} value={date} aria-invalid={Boolean(errors.date)} onChange={e => { setDate(e.target.value); clear('date'); }} />
        <p className={styles.fieldError}>{errors.date}</p>
      </div>
      <div className={styles.field}>
        <label htmlFor="settle-note">Ghi chú · không bắt buộc</label>
        <textarea id="settle-note" disabled={p.sending} value={note} onChange={e => setNote(e.target.value)} />
      </div>
      {errors.general && <div className={styles.notice} role="alert">{errors.general}</div>}
    </div>
    <div className={styles.drawerFooter}>
      <button className={styles.primary} type="submit" disabled={p.sending}>{p.sending ? 'Đang ghi…' : Object.keys(errors).length ? 'Thử ghi lại' : recv ? 'Ghi đã thu' : 'Ghi đã trả'}</button>
    </div>
  </form>;
}

const hiddenText = (value: number, hidden: boolean) => hidden ? '••••••' : `${money.format(value)} đ`;

function OffsetForm(p: FormProps<Extract<DebtMode, { type: 'offset' }>>) {
  const { receivable, payable } = p.mode;
  const amount = Math.min(receivable.remaining, payable.remaining);
  const { errors, run } = useSubmit(p, []);
  function submit() {
    void run(async () => {
      const result = await p.onOffset(receivable.code, payable.code);
      p.onDone({
        title: 'Đã bù trừ.',
        lines: [
          <>Hai bên trừ nhau <MoneyAmount value={result.amount} hidden={p.hidden} />, không có tiền di chuyển.</>,
          result.closed.length ? `Đã đóng: ${result.closed.join(', ')}.` : 'Còn lại một phần, xem ở thẻ nợ.',
        ],
        balances: {},
      });
    });
  }
  return <form className={styles.drawerForm} onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className={styles.drawerScroll}>
      <p className={styles.completeLead}>
        <span aria-hidden="true">⇄</span> <b>{receivable.party}</b>
        <small>vừa nợ anh vừa được anh nợ</small>
      </p>
      <div className={styles.row}><span>{receivable.party} nợ anh ({receivable.code})</span><MoneyAmount value={receivable.remaining} hidden={p.hidden} direction="in" /></div>
      <div className={styles.row}><span>Anh nợ {payable.party} ({payable.code})</span><MoneyAmount value={payable.remaining} hidden={p.hidden} direction="debt" /></div>
      <p className={styles.hint}>
        Bù trừ {hiddenText(amount, p.hidden)}: hai khoản trừ nhau, không ai phải chuyển tiền.
        {receivable.remaining !== payable.remaining && ` Phần chênh còn lại ${receivable.remaining > payable.remaining ? `${receivable.party} nợ anh` : `anh nợ ${payable.party}`} ${hiddenText(Math.abs(receivable.remaining - payable.remaining), p.hidden)}.`}
      </p>
      {errors.general && <div className={styles.notice} role="alert">{errors.general}</div>}
    </div>
    <div className={styles.drawerFooter}>
      <button className={styles.primary} type="submit" disabled={p.sending}>{p.sending ? 'Đang ghi…' : Object.keys(errors).length ? 'Thử lại' : 'Bù trừ'}</button>
    </div>
  </form>;
}
