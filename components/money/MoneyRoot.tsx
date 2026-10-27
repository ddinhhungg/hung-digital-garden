'use client';

import { useEffect, useState } from 'react';
import { createMoneyClient } from '../../lib/money/api';
import { createMoneyLock } from '../../lib/money/lock';
import type { MoneyClient, MoneyLock } from '../../lib/money/types';
import MoneyApp from './MoneyApp';
import MoneyState from './MoneyState';
import styles from './money.module.css';

type Providers = { client: MoneyClient; lock: MoneyLock };

// Mặc định dùng dữ liệu thật. Thêm ?demo=1 vào địa chỉ để xem bản dữ liệu giả
// (không cần token, không gọi mạng, mất khi tải lại trang).
export default function MoneyRoot() {
  const [providers, setProviders] = useState<Providers | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const demo = new URLSearchParams(window.location.search).get('demo') === '1';

    if (!demo) {
      setProviders({ client: createMoneyClient(), lock: createMoneyLock() });
      return;
    }

    let nowMs = Date.now();
    timer = window.setInterval(() => { nowMs = Date.now(); }, 1000);

    void import('../../lib/money/mock').then(({ createMoneyMock }) => {
      if (cancelled) return;
      const mock = createMoneyMock({ now: () => nowMs });
      setProviders({ client: mock.client, lock: mock.lock });
    });

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearInterval(timer);
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

  return <MoneyApp client={providers.client} lock={providers.lock} />;
}
