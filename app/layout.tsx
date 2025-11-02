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
  title: "Timelite Couture | Ao dai cao cap cho thi truong My",
  description:
    "E-commerce website for luxury Vietnamese ao dai, tailored for modern customers in the United States.",
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
