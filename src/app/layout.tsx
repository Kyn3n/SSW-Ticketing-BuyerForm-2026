import type { Metadata } from "next";
import { ThemeModeProvider } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summer Soundwave 2026 | Tickets",
  description: "Purchase tickets for Summer Soundwave 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeModeProvider>{children}</ThemeModeProvider>
      </body>
    </html>
  );
}
