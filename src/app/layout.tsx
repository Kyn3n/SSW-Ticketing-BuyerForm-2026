import type { Metadata } from "next";
import { ThemeModeProvider } from "@/providers/theme-mode-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summer Soundwave 2026 | Tickets",
  description: "Purchase tickets for Summer Soundwave 2026.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeModeProvider>{children}</ThemeModeProvider>
      </body>
    </html>
  );
}
