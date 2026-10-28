import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import styles from './money.module.css';

export type MoneyTab = 'overview' | 'charts' | 'month' | 'funds';
export const moneyTabs: { key: MoneyTab; label: string; title: string; path: string }[] = [
  { key: 'overview', label: 'Tổng quan', title: 'Tổng quan', path: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z' },
  { key: 'charts', label: 'Biểu đồ', title: 'Biểu đồ', path: 'M3 20h18 M4 16l5-6 5 3 6-9' },
  { key: 'month', label: 'Tháng', title: 'Theo tháng', path: 'M4 20V10h4v10 M10 20V4h4v16 M16 20v-7h4v7 M2 20h20' },
  { key: 'funds', label: 'Quỹ & nợ', title: 'Quỹ và công nợ', path: 'M4 8h16v12H4z M3 4h18v4H3z M10 12h4' },
];

export function MoneyIcon({ path }: { path: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={path} /></svg>;
}

export interface MoneyShellProps {
  activeTab: MoneyTab;
  onTabChange: (tab: MoneyTab) => void;
  showNavigation: boolean;
  onAdd?: () => void;
  onLock?: () => void;
  onManageToken?: () => void;
  children: ReactNode;
}

export default function MoneyShell({
  activeTab, onTabChange, showNavigation, onAdd, onLock,
  onManageToken, children,
}: MoneyShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<MoneyTab, HTMLButtonElement>>>({});

  function changeTab(tab: MoneyTab) {
    onTabChange(tab);
    scrollRef.current?.scrollTo({ top: 0 });
  }
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, key: MoneyTab) {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = moneyTabs.findIndex(t => t.key === key);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? moneyTabs.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : moneyTabs.length - 1)) % moneyTabs.length;
    changeTab(moneyTabs[next].key);
    tabRefs.current[moneyTabs[next].key]?.focus();
  }

  return (
    <section className={styles.root} aria-label="Sổ tay tài chính của Hưng">
      <header className={styles.header}>
        <div className={styles.brand}>money.<small>SỔ TAY CỦA HƯNG</small></div>
        <div className={styles.headerActions}>
          {onManageToken && <button className={styles.iconButton} onClick={onManageToken} aria-label="Quản lý token"><MoneyIcon path="M13 9a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 13l8 8 M16 17l3-3" /></button>}
          {onLock && <button className={styles.iconButton} onClick={onLock} aria-label="Khoá màn hình"><MoneyIcon path="M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3" /></button>}
        </div>
      </header>
      <div
        ref={scrollRef}
        className={styles.content}
        role={showNavigation ? 'tabpanel' : undefined}
        id="money-panel"
        aria-labelledby={showNavigation ? `money-tab-${activeTab}` : undefined}
        tabIndex={showNavigation ? 0 : undefined}
      >{children}</div>
      {showNavigation && <nav className={styles.navigation} aria-label="Điều hướng tài chính">
        <div className={styles.tabList} role="tablist" aria-label="Các mục">
          {moneyTabs.slice(0, 2).map(t => <button
            key={t.key}
            ref={node => { if (node) tabRefs.current[t.key] = node; }}
            id={`money-tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={activeTab === t.key}
            aria-controls="money-panel"
            tabIndex={activeTab === t.key ? 0 : -1}
            className={`${styles.tab} ${activeTab === t.key ? styles.activeTab : ''}`}
            onClick={() => changeTab(t.key)}
            onKeyDown={event => onKeyDown(event, t.key)}
          ><MoneyIcon path={t.path} /><span>{t.label}</span></button>)}
          <span className={styles.navGap} aria-hidden="true" />
          {moneyTabs.slice(2).map(t => <button
            key={t.key}
            ref={node => { if (node) tabRefs.current[t.key] = node; }}
            id={`money-tab-${t.key}`}
            type="button"
            role="tab"
            aria-selected={activeTab === t.key}
            aria-controls="money-panel"
            tabIndex={activeTab === t.key ? 0 : -1}
            className={`${styles.tab} ${activeTab === t.key ? styles.activeTab : ''}`}
            onClick={() => changeTab(t.key)}
            onKeyDown={event => onKeyDown(event, t.key)}
          ><MoneyIcon path={t.path} /><span>{t.label}</span></button>)}
        </div>
        <button className={styles.addButton} onClick={onAdd} disabled={!onAdd} aria-label="Thêm giao dịch">
          <MoneyIcon path="M12 5v14 M5 12h14" />
        </button>
      </nav>}
    </section>
  );
}
