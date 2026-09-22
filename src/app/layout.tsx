import type { Metadata } from "next";
import { ThemeModeProvider } from "@/providers/theme-mode-provider";
import "./globals.css";

const title = "Odyssey | Selangor Symphonic Winds Tickets";
const description = "Purchase tickets for Odyssey by Selangor Symphonic Winds.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? ""
  ),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: "/ssw_logo_no_bg.png",
        alt: "Selangor Symphonic Winds",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/ssw_logo_no_bg.png"],
  },
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
