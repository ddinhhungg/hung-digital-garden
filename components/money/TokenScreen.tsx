import { useEffect, useRef, useState } from 'react';
import { MoneyIcon } from './MoneyShell';
import styles from './money.module.css';

export interface TokenScreenProps {
  hasToken: boolean;
  error?: string;
  onSave: (token: string) => void | Promise<void>;
  onClear: () => void | Promise<void>;
  onBack?: () => void;
}

export default function TokenScreen({ hasToken, error, onSave, onClear, onBack }: TokenScreenProps) {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState(error ?? '');
  const [pending, setPending] = useState(false);
  const [cleared, setCleared] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => { setMessage(error ?? ''); }, [error]);

  async function save() {
    if (pending) return;
    if (!token.trim()) { setMessage('Dán token trước khi lưu.'); return; }
    setPending(true); setMessage('');
    try { await onSave(token.trim()); setToken(''); }
    catch { setMessage('Chưa lưu được token. Anh thử lại nhé.'); }
    finally { setPending(false); }
  }
  async function clear() {
    if (pending) return;
    setPending(true); setMessage('');
    try { await onClear(); setToken(''); setCleared(true); }
    catch { setMessage('Chưa xoá được token. Anh thử lại nhé.'); }
    finally { setPending(false); }
  }

  return (
    <section className={styles.auth} aria-labelledby="money-token-title">
      <div className={styles.authMark}><MoneyIcon path="M13 9a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 13l8 8 M16 17l3-3" /></div>
      <span className={styles.eyebrow}>KẾT NỐI SỔ TAY</span>
      <h1 id="money-token-title">Token của anh</h1>
      <p>Dán token để mở dữ liệu.<br />Chỉ lưu trên máy này.</p>
      <form className={styles.authForm} onSubmit={event => { event.preventDefault(); void save(); }}>
        <div className={styles.field}>
          <label htmlFor="money-token">Token</label>
          <textarea
            ref={ref} id="money-token" value={token} disabled={pending}
            onChange={event => { setToken(event.target.value); setMessage(''); setCleared(false); }}
            placeholder="Dán chuỗi token tại đây" autoComplete="off" spellCheck={false}
            aria-invalid={Boolean(message)} aria-describedby="money-token-message"
          />
          <p id="money-token-message" className={styles.fieldError} role="alert">{message}</p>
        </div>
        <button className={styles.primary} disabled={pending} type="submit">{pending ? 'Đang xử lý…' : 'Lưu token'}</button>
      </form>
      {hasToken && <button className={styles.textButton} disabled={pending} onClick={() => void clear()}>Xoá token trên máy này</button>}
      {onBack && <button className={styles.textButton} disabled={pending} onClick={onBack}>Quay lại</button>}
      <p className={styles.authFoot} role="status">{cleared ? 'Đã xoá token mẫu.' : 'Bản mock: chỉ nhập chuỗi giả, không dùng token thật.'}</p>
    </section>
  );
}
