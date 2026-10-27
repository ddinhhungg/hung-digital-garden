import type { Summary } from '../../lib/money/types';
import NetWorthChart from './NetWorthChart';
import AllocationChart from './AllocationChart';
import FlowBars from './FlowBars';
import PacingChart from './PacingChart';
import CategoryBars from './CategoryBars';
import PortfolioList from './PortfolioList';

export default function ChartsPanel({ summary, hidden, today, currentYear }: { summary: Summary; hidden: boolean; today: string; currentYear: number }) {
  return <>
    <NetWorthChart points={summary.trend.netWorth} hidden={hidden} today={today} currentYear={currentYear} />
    <AllocationChart accounts={summary.accounts} hidden={hidden} />
    <FlowBars months={summary.trend.months} hidden={hidden} today={today} />
    <PacingChart month={summary.month} hidden={hidden} today={today} currentYear={currentYear} />
    <CategoryBars categories={summary.month.byCategory} hidden={hidden} />
    <PortfolioList portfolio={summary.portfolio} hidden={hidden} currentYear={currentYear} />
  </>;
}
