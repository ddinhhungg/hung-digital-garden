import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hưng's Garden",
  description: "Thinking out loud — one slow idea at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
