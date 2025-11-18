"use client";

import { PropsWithChildren } from "react";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import CartDrawer from "../../../views/CartDrawer";
import { ChatWidget } from "../../ChatWidget/ChatWidget";
import { useCart } from "../../../context/CartContext";
import styles from "./Layout.module.css";

type LayoutProps = PropsWithChildren<{
  showNavbar?: boolean;
  showFooter?: boolean;
}>;

export const Layout = ({ children, showNavbar = true, showFooter = true }: LayoutProps) => {
  const { isCartOpen, closeCart } = useCart();

  return (
    <div className={styles.root}>
      {showNavbar && <Navbar />}
      <main className={styles.main}>{children}</main>
      {showFooter && <Footer />}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <ChatWidget />
    </div>
  );
};
