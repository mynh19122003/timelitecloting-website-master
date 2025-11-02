import type { AppProps } from "next/app";
import { CartProvider } from "../context/CartContext";
import { Layout } from "../components/layout/Layout";
import "../app/globals.css";
import { BrowserRouter, MemoryRouter } from "react-router-dom";

export default function MyApp({ Component, pageProps }: AppProps) {
  const Router = typeof window === "undefined" ? MemoryRouter : BrowserRouter;

  return (
    <CartProvider>
      <Router>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Router>
    </CartProvider>
  );
}
