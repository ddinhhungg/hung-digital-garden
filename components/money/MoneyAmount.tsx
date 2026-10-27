import styles from './money.module.css';

export interface MoneyAmountProps {
  value: number;
  hidden?: boolean;
  direction?: 'neutral' | 'in' | 'out' | 'debt';
  sign?: '+' | '−' | '↔';
  size?: 'small' | 'normal' | 'large';
}

const numberFormat = new Intl.NumberFormat('vi-VN');

export default function MoneyAmount({
  value,
  hidden = false,
  direction = 'neutral',
  sign,
  size = 'normal',
}: MoneyAmountProps) {
  const text =
    `${sign ? `${sign} ` : ''}${numberFormat.format(value)} đ`;

  const tone = direction === 'in'
    ? styles.good
    : direction === 'out' || direction === 'debt'
      ? styles.bad
      : '';

  return (
    <span
      className={`${styles.amount} ${styles[size]} ${tone}`}
      aria-label={hidden ? 'Đã ẩn số tiền' : undefined}
    >
      <span
        className={hidden ? styles.amountHidden : ''}
        aria-hidden={hidden}
      >
        {text}
      </span>

      {hidden && (
        <span className={styles.amountDots} aria-hidden="true">
          ••••••
        </span>
      )}
    </span>
  );
}
