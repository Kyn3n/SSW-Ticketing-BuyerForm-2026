import type { Metadata } from "next";
import { ThemeModeProvider } from "@/providers/theme-mode-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Odyssey | Selangor Symphonic Winds Tickets",
  description: "Purchase tickets for Odyssey by Selangor Symphonic Winds.",
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
