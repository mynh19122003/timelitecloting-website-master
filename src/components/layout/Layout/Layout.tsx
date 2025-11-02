"use client";

import { PropsWithChildren } from "react";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import CartDrawer from "../../../pages/CartDrawer";
import { ChatWidget } from "../../ChatWidget/ChatWidget";
import { useCart } from "../../../context/CartContext";
import styles from "./Layout.module.css";

export const Layout = ({ children }: PropsWithChildren) => {
  const { isCartOpen, closeCart } = useCart();

  return (
    <div className={styles.root}>
      <Navbar />
      <main className={styles.main}>{children}</main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <ChatWidget />
    </div>
  );
};
