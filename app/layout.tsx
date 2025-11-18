import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
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
  title: "Timelite Couture | Ao dai cao cap cho thi truong My",
  description:
    "E-commerce website for luxury Vietnamese ao dai, tailored for modern customers in the United States.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`bg-white text-[#222] antialiased ${inter.variable} ${playfair.variable}`}
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
