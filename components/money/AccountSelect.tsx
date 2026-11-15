import type { Account } from '../../lib/money/types';
import styles from './money.module.css';

export interface AccountSelectProps {
  id: string; label: string; value: string; accounts: Account[];
  onChange: (code: string) => void; disabled?: boolean; error?: string; placeholder?: string;
}

// Chọn tài khoản, tách "Tài khoản thường" và "Ngăn quỹ" giống ngăn kéo thêm giao dịch.
export default function AccountSelect({ id, label, value, accounts, onChange, disabled, error, placeholder = 'Chọn tài khoản' }: AccountSelectProps) {
  const group = (pocket: boolean) => accounts.filter(a => (a.fundCode !== null) === pocket)
    .map(a => <option key={a.code} value={a.code}>{a.name}</option>);
  return <div className={styles.field}>
    <label htmlFor={id}>{label}</label>
    <select id={id} disabled={disabled} value={value} onChange={e => onChange(e.target.value)} aria-invalid={Boolean(error)} aria-describedby={`${id}-error`}>
      <option value="">{placeholder}</option>
      <optgroup label="Tài khoản thường">{group(false)}</optgroup>
      <optgroup label="Ngăn quỹ">{group(true)}</optgroup>
    </select>
    <p id={`${id}-error`} className={styles.fieldError}>{error}</p>
  </div>;
}
