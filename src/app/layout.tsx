import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { PwaRegister } from "@/components/layout/pwa-register";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-jp",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: "QSC Checker",
  description: "QSCチェック・ランキング・改善管理システム",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QSC Checker",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D9488",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className={`${notoSansJP.className} min-h-dvh antialiased`}>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
