import type { Metadata } from "next";
import "./globals.css";

import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";

export const metadata: Metadata = {
  title: "Timelite Couture | Áo dài cao cấp cho thị trường Mỹ",
  description:
    "E-commerce website for luxury Vietnamese áo dài, tailored for modern customers in the United States.",
  icons: {
    icon: "/images/logo_web.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#222] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
