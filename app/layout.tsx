import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import PageLoader from "@/components/PageLoader";

const GA_ID = "G-3G4695SB7Y";

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
