'use client';

import { useEffect, useState } from 'react';
import { createMoneyClient } from '../../lib/money/api';
import { createMoneyLock } from '../../lib/money/lock';
import type { MockScenario } from '../../lib/money/mock';
import type { MoneyClient, MoneyLock } from '../../lib/money/types';
import MoneyApp from './MoneyApp';
import MoneyState from './MoneyState';
import styles from './money.module.css';

type Providers = { client: MoneyClient; lock: MoneyLock };
type Controls = { setScenario: (s: MockScenario) => void };

// Mặc định dùng dữ liệu thật. Thêm ?demo=1 vào địa chỉ để xem bản dữ liệu giả
// (không cần token, không gọi mạng, mất khi tải lại trang).
export default function MoneyRoot() {
  const [providers, setProviders] = useState<Providers | null>(null);
  const [controls, setControls] = useState<Controls | null>(null);
  const [scenario, setScenario] = useState<MockScenario>('full');

  useEffect(() => {
    let cancelled = false;
    const demo = new URLSearchParams(window.location.search).get('demo') === '1';

    if (!demo) {
      setProviders({ client: createMoneyClient(), lock: createMoneyLock() });
      return;
    }

    let nowMs = Date.now();
    const updateClock = () => { nowMs = Date.now(); };
    const timer = window.setInterval(updateClock, 1000);
    document.addEventListener('visibilitychange', updateClock);

    void import('../../lib/money/mock').then(({ createMoneyMock }) => {
      if (cancelled) return;
      const mock = createMoneyMock({ now: () => nowMs });
      setProviders({ client: mock.client, lock: mock.lock });
      setControls(mock.controls);
    });

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', updateClock);
    };
  }, []);

  if (!providers) {
    return (
      <section className={styles.root}>
        <div className={styles.content}>
          <MoneyState status="loading" />
        </div>
      </section>
    );
  }

  return (
    <>
      {controls && (
        <div className={styles.previewControls}>
          <label htmlFor="money-scenario">Dữ liệu giả</label>
          <select
            id="money-scenario"
            value={scenario}
            onChange={event => {
              const next = event.target.value as MockScenario;
              controls.setScenario(next);
              setScenario(next);
              // Tạo object mới để MoneyApp tải lại summary theo kịch bản mới.
              setProviders({ client: { ...providers.client }, lock: providers.lock });
            }}
          >
            <option value="full">Đầy đủ</option>
            <option value="new">Dữ liệu mới</option>
            <option value="empty">Rỗng</option>
          </select>
        </div>
      )}
      <MoneyApp client={providers.client} lock={providers.lock} />
    </>
  );
}
