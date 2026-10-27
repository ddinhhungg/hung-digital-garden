import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { MoneyIcon } from './MoneyShell';
import styles from './money.module.css';

export interface PinScreenProps {
  mode: 'verify' | 'set';
  error?: string;
  onSubmit: (pin: string) => string | null;
}

export default function PinScreen({
  mode,
  error,
  onSubmit,
}: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [message, setMessage] = useState(error ?? '');
  const ref = useRef<HTMLElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  useEffect(() => {
    setPin('');
    setFirstPin(null);
    setMessage(error ?? '');
  }, [mode, error]);

  function press(key: string) {
    if (key === 'back') {
      setPin(value => value.slice(0, -1));
      setMessage('');
      return;
    }

    if (key !== 'ok') {
      setPin(value => value.length < 6 ? value + key : value);
      setMessage('');
      return;
    }

    if (pin.length < 4) {
      setMessage('Nhập từ 4 đến 6 chữ số.');
      return;
    }

    if (mode === 'set' && firstPin === null) {
      setFirstPin(pin);
      setPin('');
      setMessage('');
      return;
    }

    if (mode === 'set' && pin !== firstPin) {
      setPin('');
      setMessage('Hai lần nhập chưa khớp. Anh thử lại nhé.');
      return;
    }

    const result = onSubmit(pin);

    if (result) {
      setPin('');
      setMessage(result);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      press(event.key);
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      press('back');
    }

    if (
      event.key === 'Enter'
      && event.target === event.currentTarget
    ) {
      event.preventDefault();
      press('ok');
    }
  }

  return (
    <section
      ref={ref}
      className={styles.auth}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      aria-labelledby="money-pin-title"
    >
      <div className={styles.authMark}>
        <MoneyIcon path="M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3" />
      </div>

      <span className={styles.eyebrow}>MỘT CHÚT RIÊNG TƯ</span>

      <h1 id="money-pin-title">
        {mode === 'verify'
          ? 'Chào anh, Hưng.'
          : firstPin === null
            ? 'Đặt PIN cho sổ tay'
            : 'Nhập lại PIN'}
      </h1>

      <p>
        {mode === 'verify'
          ? 'Nhập PIN để mở sổ tài chính.'
          : firstPin === null
            ? 'Chọn từ 4 đến 6 chữ số.'
            : 'Xác nhận PIN vừa nhập.'}
      </p>

      <div
        className={styles.pinDots}
        role="status"
        aria-label={`Đã nhập ${pin.length} chữ số`}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <i
            key={index}
            className={index < pin.length ? styles.pinFilled : ''}
            aria-hidden="true"
          />
        ))}
      </div>

      <p className={styles.pinError} role="alert">{message}</p>

      <div className={styles.keypad}>
        {[
          '1', '2', '3',
          '4', '5', '6',
          '7', '8', '9',
          'ok', '0', 'back',
        ].map(key => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className={key === 'ok' ? styles.pinConfirm : undefined}
            aria-label={
              key === 'back'
                ? 'Xoá một số'
                : key === 'ok' ? 'Xác nhận PIN' : key
            }
          >
            {key === 'back' ? (
              <MoneyIcon path="M21 5H9l-7 7 7 7h12z M11 9l6 6 M17 9l-6 6" />
            ) : key === 'ok' ? (
              mode === 'verify' ? 'Mở sổ' : 'Tiếp'
            ) : key}
          </button>
        ))}
      </div>

      <p className={styles.authFoot}>
        PIN chỉ che số trên màn hình.
        <br />
        Bản mock: PIN chỉ tồn tại trong bộ nhớ.
      </p>
    </section>
  );
}
