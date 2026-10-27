import type { Metadata } from 'next';
import MoneyRoot from '../../components/money/MoneyRoot';

export const metadata: Metadata = {
  title: 'money',
  description: 'Sổ tay tài chính cá nhân.',
  robots: { index: false, follow: false, nocache: true },
};

export default function MoneyPage() {
  return <MoneyRoot />;
}
