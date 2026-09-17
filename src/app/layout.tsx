import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopBar } from "@/components/layout/top-bar";

const display = Inter({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "安羅夕雅OS | AI Soccer Coach",
  description: "安羅夕雅専用パーソナルAIサッカーコーチ OS",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${display.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <div className="relative mx-auto flex min-h-screen w-full max-w-[560px] flex-col">
            <TopBar />
            <main className="flex-1 px-4 pb-36 pt-2">{children}</main>
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
