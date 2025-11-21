import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import "./globals.css";
import timelitePalette from "@/color/palette";
import { Inter, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Timelite Couture | Áo Dài Cao Cấp Cho Khách Hàng Hiện Đại",
  description:
    "Áo dài và trang phục cưới cao cấp Việt Nam, được chế tác thủ công tại Sài Gòn và tạo ra cho khách hàng hiện đại trên toàn nước Mỹ.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable}`}
        style={
          {
            "--color-background-main": timelitePalette.backgroundMain,
            "--color-background-light": timelitePalette.backgroundLight,
            "--color-text-primary": timelitePalette.textPrimary,
            "--color-text-secondary": timelitePalette.textSecondary,
            "--color-accent-gold": timelitePalette.accentGold,
            "--color-accent-gold-deep": timelitePalette.accentGoldDeep,
            "--color-cta-primary": timelitePalette.ctaPrimary,
            "--color-cta-primary-text": timelitePalette.ctaPrimaryText,
            "--color-cta-secondary-border": timelitePalette.ctaSecondaryBorder,
            "--color-cta-secondary-text": timelitePalette.ctaSecondaryText,
            "--color-hero-frame-border": timelitePalette.heroFrameBorder,
            "--color-icon-stroke": timelitePalette.iconStroke,
            "--color-whatsapp": timelitePalette.whatsapp,
            "--color-messenger": timelitePalette.messenger,
            "--color-floating-action": timelitePalette.floatingAction,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
