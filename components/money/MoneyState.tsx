import type { MoneyError } from '../../lib/money/types';
import styles from './money.module.css';

export const moneyErrorText = {
  UNAUTHORIZED: 'Token sai hoặc đã hết hiệu lực. Anh nhập lại token nhé.',
  NETWORK: 'Chưa kết nối được mạng. Anh thử lại khi kết nối ổn định nhé.',
  BUSY: 'Sổ đang được cập nhật. Anh chờ một chút rồi thử lại nhé.',
  SERVER: 'Hệ thống gặp lỗi tạm thời. Anh có thể thử lại.',
  VALIDATION: 'Có thông tin chưa hợp lệ. Anh kiểm tra lại ô được đánh dấu nhé.',
} as const;

export interface MoneyStateProps {
  status: 'loading' | 'refreshing' | 'stale' | 'error' | 'empty';
  error?: MoneyError | null;
  savedAt?: string | null;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onEnterToken?: () => void;
}

export default function MoneyState({
  status, error, savedAt, title, description, onRetry, onEnterToken,
}: MoneyStateProps) {
  if (status === 'loading') {
    return (
      <div role="status" aria-label="Đang tải sổ tài chính" aria-busy="true">
        <p className={styles.muted}>Đang mở sổ của anh…</p>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
        {[0, 1, 2].map(i => <div key={i} className={`${styles.skeleton} ${styles.skeletonBlock}`} />)}
      </div>
    );
  }
  if (status === 'refreshing') {
    return <p className={styles.statusLine} role="status">Đang làm mới…</p>;
  }
  if (status === 'stale') {
    // savedAt is an explicit ISO input; this does not read the system clock.
    const date = savedAt ? new Date(savedAt) : null;
    const time = date && Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit',
          hourCycle: 'h23',
        }).format(date)
      : null;
    return (
      <div className={styles.notice} role="status">
        <p>{time ? `Cập nhật lúc ${time}, chưa làm mới được.` : 'Chưa làm mới được dữ liệu đã lưu.'}</p>
        <p>Đang hiển thị bản đã lưu trên máy này.</p>
        {onRetry && <button className={styles.textButton} onClick={onRetry}>Thử kết nối lại</button>}
      </div>
    );
  }
  if (status === 'empty') {
    return (
      <div className={styles.empty}>
        <h3>{title ?? 'Chưa có dữ liệu'}</h3>
        <p>{description ?? 'Dữ liệu sẽ xuất hiện ở đây khi được ghi nhận.'}</p>
      </div>
    );
  }
  const unauthorized = error?.code === 'UNAUTHORIZED';
  return (
    <div className={styles.errorCard} role="alert">
      <span className={styles.eyebrow}>{error?.code ?? 'SERVER'}</span>
      <h3>{title ?? (unauthorized ? 'Token cần được cập nhật' : 'Chưa mở được sổ')}</h3>
      <p>{description ?? moneyErrorText[error?.code ?? 'SERVER']}</p>
      {(unauthorized ? onEnterToken : onRetry) && (
        <button className={styles.primary} onClick={unauthorized ? onEnterToken : onRetry}>
          {unauthorized ? 'Nhập lại token' : 'Thử lại'}
        </button>
      )}
    </div>
  );
}
