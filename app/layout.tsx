import type { Metadata, Viewport } from "next";
import "./globals.css";
import PageLoader from "@/components/PageLoader";

export const metadata: Metadata = {
  title: "Hưng's Garden",
  description: "Thinking out loud — one slow idea at a time.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
