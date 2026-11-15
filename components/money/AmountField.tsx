import styles from './money.module.css';

export interface AmountFieldProps {
  id: string; label: string; value: number; onChange: (value: number) => void;
  disabled?: boolean; error?: string; placeholder?: string; hint?: string;
}

// Ô nhập số tiền lớn kiểu sổ tay, có nút 000 để nhập nhanh.
export default function AmountField({ id, label, value, onChange, disabled, error, placeholder = '0', hint }: AmountFieldProps) {
  return <div className={styles.field}>
    <label htmlFor={id}>{label}</label>
    <div className={styles.amountEntry}>
      <input id={id} inputMode="numeric" autoComplete="off" placeholder={placeholder} disabled={disabled}
        value={value ? value.toLocaleString('vi-VN') : ''}
        onChange={e => onChange(Number(e.target.value.replace(/\D/g, '').slice(0, 12)))}
        aria-invalid={Boolean(error)} aria-describedby={`${id}-error`} />
      <span>đ</span>
      <button className={styles.zeros} type="button" disabled={disabled}
        onClick={() => { const next = value * 1000; if (Number.isSafeInteger(next) && next <= 999_999_999_999) onChange(next); }}>000</button>
    </div>
    <p id={`${id}-error`} className={styles.fieldError}>{error}</p>
    {hint && <p className={styles.hint}>{hint}</p>}
  </div>;
}
