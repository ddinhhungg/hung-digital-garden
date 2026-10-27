import type { Metadata, Viewport } from 'next';
import MoneyRoot from '../../components/money/MoneyRoot';

// Trang /money có biểu tượng và manifest riêng, để "Thêm vào màn hình chính"
// từ trang này tạo ra app Money mở thẳng vào /money/, tách khỏi app của website.
export const metadata: Metadata = {
  title: 'Money',
  description: 'Sổ tay tài chính cá nhân.',
  robots: { index: false, follow: false, nocache: true },
  manifest: '/money/manifest.webmanifest',
  icons: {
    icon: '/money/icon-192.png',
    apple: '/money/apple-touch-icon.png',
  },
  appleWebApp: { capable: true, title: 'Money', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#F7EDE0',
};

export default function MoneyPage() {
  return <MoneyRoot />;
}
