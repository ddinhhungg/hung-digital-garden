import type { Metadata } from "next";
import "./globals.css";
import PageLoader from "@/components/PageLoader";

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
      <body>
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
