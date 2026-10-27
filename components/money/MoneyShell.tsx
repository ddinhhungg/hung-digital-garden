import {
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import styles from './money.module.css';

export type MoneyTab = 'overview' | 'funds' | 'month' | 'debts';

export const moneyTabs: {
  key: MoneyTab;
  label: string;
  path: string;
}[] = [
  {
    key: 'overview',
    label: 'Tổng quan',
    path: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  },
  {
    key: 'funds',
    label: 'Quỹ',
    path: 'M4 8h16v12H4z M3 4h18v4H3z M10 12h4',
  },
  {
    key: 'month',
    label: 'Tháng này',
    path: 'M4 20V10h4v10 M10 20V4h4v16 M16 20v-7h4v7 M2 20h20',
  },
  {
    key: 'debts',
    label: 'Công nợ',
    path: 'M4 7h15 M15 3l4 4-4 4 M20 17H5 M9 13l-4 4 4 4',
  },
];

export function MoneyIcon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} />
    </svg>
  );
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
  activeTab,
  onTabChange,
  showNavigation,
  onAdd,
  onLock,
  onManageToken,
  children,
}: MoneyShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<
    Partial<Record<MoneyTab, HTMLButtonElement>>
  >({});

  function changeTab(tab: MoneyTab) {
    onTabChange(tab);
    scrollRef.current?.scrollTo({ top: 0 });
  }

  function onKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    key: MoneyTab,
  ) {
    if (
      !['ArrowRight', 'ArrowLeft', 'Home', 'End']
        .includes(event.key)
    ) return;

    event.preventDefault();

    const index = moneyTabs.findIndex(tab => tab.key === key);
    const next = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? 3
        : (index + (event.key === 'ArrowRight' ? 1 : 3)) % 4;

    changeTab(moneyTabs[next].key);
    tabRefs.current[moneyTabs[next].key]?.focus();
  }

  return (
    <section
      className={styles.root}
      aria-label="Sổ tay tài chính của Hưng"
    >
      <header className={styles.header}>
        <div className={styles.brand}>
          money.<small>SỔ TAY CỦA HƯNG</small>
        </div>

        <div className={styles.headerActions}>
          {onManageToken && (
            <button
              className={styles.iconButton}
              onClick={onManageToken}
              aria-label="Quản lý token"
            >
              <MoneyIcon path="M13 9a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 13l8 8 M16 17l3-3" />
            </button>
          )}

          {onLock && (
            <button
              className={styles.iconButton}
              onClick={onLock}
              aria-label="Khoá màn hình"
            >
              <MoneyIcon path="M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3" />
            </button>
          )}
        </div>
      </header>

      <div
        ref={scrollRef}
        className={styles.content}
        role={showNavigation ? 'tabpanel' : undefined}
        id="money-panel"
        aria-labelledby={
          showNavigation ? `money-tab-${activeTab}` : undefined
        }
        tabIndex={showNavigation ? 0 : undefined}
      >
        {children}
      </div>

      {showNavigation && (
        <>
          <div className={styles.actionRail}>
            <button
              className={styles.addButton}
              onClick={onAdd}
              disabled={!onAdd}
              aria-label="Thêm giao dịch"
            >
              <MoneyIcon path="M12 4v16 M4 12h16" />
            </button>
          </div>

          <nav
            className={styles.navigation}
            role="tablist"
            aria-label="Điều hướng tài chính"
          >
            {moneyTabs.map(tab => (
              <button
                key={tab.key}
                ref={node => {
                  if (node) tabRefs.current[tab.key] = node;
                }}
                id={`money-tab-${tab.key}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls="money-panel"
                tabIndex={activeTab === tab.key ? 0 : -1}
                className={`${styles.tab} ${
                  activeTab === tab.key ? styles.activeTab : ''
                }`}
                onClick={() => changeTab(tab.key)}
                onKeyDown={event => onKeyDown(event, tab.key)}
              >
                <MoneyIcon path={tab.path} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}
    </section>
  );
}
