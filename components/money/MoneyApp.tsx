'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MoneyError, type MoneyClient, type MoneyErrorCode,
  type MoneyLock, type NewTransaction, type Summary,
} from '../../lib/money/types';
import MoneyShell, { MoneyIcon, moneyTabs, type MoneyTab } from './MoneyShell';
import PinScreen from './PinScreen';
import TokenScreen from './TokenScreen';
import MoneyState, { moneyErrorText } from './MoneyState';
// These files are delivered in lượt 2; their connection is ready here.
import ChartsPanel from './ChartsPanel';
import UpcomingList from './UpcomingList';
import OverviewPanel from './OverviewPanel';
import AccountList from './AccountList';
import RecentTransactions from './RecentTransactions';
import FundsPanel from './FundsPanel';
import MonthPanel from './MonthPanel';
import DebtsPanel from './DebtsPanel';
import TransactionDrawer from './TransactionDrawer';
import styles from './money.module.css';

type Gate = 'boot' | 'pin' | 'check-token' | 'token' | 'ready';
type LoadState = 'loading' | 'refreshing' | 'ready' | 'stale' | 'error';
type Clock = { today: string; currentYear: number };
const lockAfterMs = 120_000;
const refreshAfterMs = 60_000;

function asMoneyError(value: unknown): MoneyError {
  const object = value as { code?: unknown; message?: unknown; field?: unknown } | null;
  const codes: MoneyErrorCode[] = ['UNAUTHORIZED', 'VALIDATION', 'BUSY', 'NETWORK', 'SERVER'];
  const code = codes.includes(object?.code as MoneyErrorCode) ? object!.code as MoneyErrorCode : 'SERVER';
  return new MoneyError(code,
    typeof object?.message === 'string' ? object.message : moneyErrorText[code],
    typeof object?.field === 'string' ? object.field : undefined,
  );
}

export interface MoneyAppProps { client: MoneyClient; lock: MoneyLock }

export default function MoneyApp({ client, lock }: MoneyAppProps) {
  const [gate, setGate] = useState<Gate>('boot');
  const [pinMode, setPinMode] = useState<'verify' | 'set'>('verify');
  const [tokenPresent, setTokenPresent] = useState(false);
  const [tokenRequired, setTokenRequired] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [tab, setTab] = useState<MoneyTab>('overview');
  const [data, setData] = useState<Summary | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState<MoneyError | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [clock, setClock] = useState<Clock | null>(null);
  const gateRef = useRef<Gate>('boot');
  const dataRef = useRef<Summary | null>(null);
  const nowRef = useRef<number | null>(null);
  const lastReadMs = useRef<number | null>(null);
  const pinConfigured = useRef(false);
  const needsRefresh = useRef(true);
  const requestId = useRef(0);
  const inFlight = useRef(false);
  const mounted = useRef(false);

  const changeGate = useCallback((next: Gate) => {
    gateRef.current = next;
    setGate(next);
  }, []);

  const invalidateRead = useCallback(() => {
    requestId.current += 1;
    inFlight.current = false;
  }, []);

  const enterToken = useCallback(() => {
    invalidateRead();
    setTokenRequired(true);
    needsRefresh.current = true;
    changeGate('token');
  }, [changeGate, invalidateRead]);

  const lockScreen = useCallback(() => {
    if (gateRef.current === 'boot' || gateRef.current === 'pin') return;
    invalidateRead();
    setPinMode(pinConfigured.current ? 'verify' : 'set');
    changeGate('pin');
  }, [changeGate, invalidateRead]);

  const readSummary = useCallback(async (force = false) => {
    if (gateRef.current !== 'ready' || (!force && inFlight.current)) return;
    const id = ++requestId.current;
    inFlight.current = true;
    setLoadState(dataRef.current ? 'refreshing' : 'loading');
    setError(null);
    try {
      const summary = await client.getSummary();
      if (!mounted.current || id !== requestId.current || gateRef.current !== 'ready') return;
      dataRef.current = summary;
      setData(summary);
      setSavedAt(summary.asOf);
      const timestamp = Date.parse(summary.asOf);
      lastReadMs.current = Number.isFinite(timestamp) ? timestamp : nowRef.current;
      needsRefresh.current = false;
      setLoadState('ready');
    } catch (value) {
      if (!mounted.current || id !== requestId.current || gateRef.current !== 'ready') return;
      const failure = asMoneyError(value);
      setError(failure);
      if (failure.code === 'UNAUTHORIZED') {
        setTokenError(moneyErrorText.UNAUTHORIZED);
        enterToken();
        return;
      }
      if (failure.code === 'NETWORK') {
        const cached = client.lastSummary();
        if (cached) {
          dataRef.current = cached.data;
          setData(cached.data);
          setSavedAt(cached.savedAt);
          const timestamp = Date.parse(cached.savedAt);
          lastReadMs.current = Number.isFinite(timestamp) ? timestamp : null;
          setLoadState('stale');
          return;
        }
      }
      setLoadState('error');
    } finally {
      if (id === requestId.current) inFlight.current = false;
    }
  }, [client, enterToken]);

  useEffect(() => {
    mounted.current = true;
    pinConfigured.current = lock.isSet();
    setPinMode(pinConfigured.current ? 'verify' : 'set');
    changeGate('pin');
    return () => { mounted.current = false; invalidateRead(); };
  }, [lock, changeGate, invalidateRead]);

  useEffect(() => {
    if (gate !== 'check-token') return;
    const present = client.hasToken();
    setTokenPresent(present);
    setTokenRequired(!present);
    changeGate(present ? 'ready' : 'token');
  }, [gate, client, changeGate]);

  useEffect(() => {
    needsRefresh.current = true;
    if (gateRef.current === 'ready') void readSummary(true);
  }, [client, readSummary]);

  useEffect(() => {
    if (gate !== 'ready') return;
    const age = nowRef.current === null || lastReadMs.current === null
      ? Infinity : nowRef.current - lastReadMs.current;
    if (needsRefresh.current || !dataRef.current || age > refreshAfterMs) void readSummary();
  }, [gate, readSummary]);

  useEffect(() => {
    let hiddenAt: number | null = null;
    let lockTimer: number | undefined;
    function updateClock() {
      const ms = Date.now();
      nowRef.current = ms;
      const today = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date(ms));
      setClock({ today, currentYear: Number(today.slice(0, 4)) });
      return ms;
    }
    function onVisibilityChange() {
      const now = updateClock();
      window.clearTimeout(lockTimer);
      if (document.visibilityState === 'hidden') {
        hiddenAt = now;
        lockTimer = window.setTimeout(lockScreen, lockAfterMs);
        return;
      }
      const mustLock = hiddenAt !== null && now - hiddenAt >= lockAfterMs;
      hiddenAt = null;
      const age = lastReadMs.current === null ? Infinity : now - lastReadMs.current;
      if (age > refreshAfterMs) needsRefresh.current = true;
      if (mustLock) { lockScreen(); return; }
      if (gateRef.current === 'ready' && needsRefresh.current) void readSummary();
    }
    updateClock();
    if (document.visibilityState === 'hidden') onVisibilityChange();
    const ticker = window.setInterval(updateClock, 30_000);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(lockTimer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [lockScreen, readSummary]);

  function submitPin(pin: string): string | null {
    if (pinMode === 'set') { lock.set(pin); pinConfigured.current = true; }
    else if (!lock.verify(pin)) return 'PIN chưa đúng. Anh thử lại nhé.';
    changeGate('check-token');
    return null;
  }
  function saveToken(token: string) {
    client.setToken(token);
    setTokenPresent(true);
    setTokenRequired(false);
    setTokenError('');
    needsRefresh.current = true;
    changeGate('ready');
  }
  function clearToken() {
    client.clearToken();
    invalidateRead();
    setTokenPresent(false); setTokenRequired(true); setTokenError('');
    dataRef.current = null; lastReadMs.current = null;
    // Keep the mounted drawer and its draft; the token gate hides all data.
    setSavedAt(null);
    needsRefresh.current = true;
  }
  async function addTransaction(transaction: NewTransaction) {
    try {
      const result = await client.addTransaction(transaction);
      needsRefresh.current = true;
      // A refresh failure must never turn a successful write into a retry.
      if (gateRef.current === 'ready') void readSummary(true);
      return result;
    } catch (value) {
      const failure = asMoneyError(value);
      if (failure.code === 'UNAUTHORIZED') {
        setTokenError(moneyErrorText.UNAUTHORIZED);
        // Keep the drawer mounted so its draft survives the token screen.
        if (gateRef.current === 'ready') enterToken();
      }
      throw failure;
    }
  }

  const ready = gate === 'ready';
  const canAdd = ready && data !== null && loadState !== 'loading' && loadState !== 'error';
  const title = moneyTabs.find(t => t.key === tab)!.label;
  let content;
  if (gate === 'pin') content = <PinScreen mode={pinMode} onSubmit={submitPin} />;
  else if (gate === 'token') content = <TokenScreen
    hasToken={tokenPresent} error={tokenError} onSave={saveToken} onClear={clearToken}
    onBack={!tokenRequired ? () => changeGate('ready') : undefined}
  />;
  else if (!ready || !clock) content = <MoneyState status="loading" />;
  else content = <>
    <div className={styles.titleRow}>
      <h1>{title}</h1>
      <button className={styles.iconButton} onClick={() => void readSummary()} disabled={loadState === 'refreshing' || loadState === 'loading'} aria-label="Làm mới">
        <MoneyIcon path="M20 5v5h-5 M4 19v-5h5 M6 7a7 7 0 0 1 14 3 M4 14a7 7 0 0 0 14 3" />
      </button>
    </div>
    {loadState === 'refreshing' && <MoneyState status="refreshing" />}
    {loadState === 'stale' && <MoneyState status="stale" savedAt={savedAt} onRetry={() => void readSummary()} />}
    {loadState === 'loading' ? <MoneyState status="loading" />
      : loadState === 'error' ? <MoneyState status="error" error={error} onRetry={() => void readSummary()} onEnterToken={enterToken} />
      : data && <>
        {tab === 'overview' && <>
          <OverviewPanel totals={data.totals} month={data.month} trend={data.trend.netWorth} currentYear={clock.currentYear} hidden={hidden} onToggleHidden={() => setHidden(value => !value)} />
          <UpcomingList items={data.upcoming} accounts={data.accounts} hidden={hidden} today={clock.today} />
          <AccountList accounts={data.accounts} hidden={hidden} />
          <RecentTransactions transactions={data.recent} hidden={hidden} currentYear={clock.currentYear} onAdd={() => setDrawerOpen(true)} />
        </>}
        {tab === 'funds' && <FundsPanel funds={data.funds} accounts={data.accounts} hidden={hidden} currentYear={clock.currentYear} />}
        {tab === 'charts' && <ChartsPanel summary={data} hidden={hidden} today={clock.today} currentYear={clock.currentYear} />}
        {tab === 'month' && <MonthPanel month={data.month} hidden={hidden} />}
        {tab === 'debts' && <DebtsPanel debts={data.debts} hidden={hidden} today={clock.today} currentYear={clock.currentYear} />}
      </>}
  </>;

  return <>
    <MoneyShell
      activeTab={tab} onTabChange={setTab} showNavigation={ready}
      onAdd={canAdd ? () => setDrawerOpen(true) : undefined}
      onLock={ready ? lockScreen : undefined}
      onManageToken={ready ? () => { setTokenRequired(false); setTokenError(''); changeGate('token'); } : undefined}
    >{content}</MoneyShell>
    {data && clock && <TransactionDrawer
      open={ready && drawerOpen}
      accounts={data.accounts} categories={data.meta.categories}
      defaultAccount={data.meta.defaultAccount} today={clock.today}
      hidden={hidden} onSubmit={addTransaction} onClose={() => setDrawerOpen(false)}
      onUnauthorized={enterToken}
    />}
  </>;
}
