"use client";

/* eslint-disable @next/next/no-img-element */

import { MouseEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiX } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import styles from "./CartDrawer.module.css";

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleQuantityChange = (cartItemId: string, value: string) => {
    const parsed = Number(value);
    const nextQuantity = Number.isNaN(parsed) ? 1 : Math.max(parsed, 1);
    updateQuantity(cartItemId, nextQuantity);
  };

  return (
    <div
      className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`.trim()}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <aside
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`.trim()}
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Shopping Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close cart drawer"
          >
            <FiX className={styles.icon} />
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Your cart is empty.</p>
              <button
                type="button"
                onClick={onClose}
                className={styles.emptyButton}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                    <div className={styles.actionsRow}>
                      <label
                        className={styles.quantityLabel}
                        htmlFor={`cart-drawer-qty-${item.id}`}
                      >
                        Qty
                      </label>
                      <input
                        id={`cart-drawer-qty-${item.id}`}
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          handleQuantityChange(item.id, event.target.value)
                        }
                        className={styles.quantityInput}
                      />
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className={styles.removeButton}
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FiTrash2 className={styles.removeIcon} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <div className={styles.ctaGroup}>
            <Link
              to="/cart"
              className={styles.primaryButton}
              onClick={onClose}
            >
              View cart
            </Link>

            <Link
              to="/checkout"
              className={`${styles.secondaryButton} ${
                items.length === 0 ? styles.secondaryButtonDisabled : ""
              }`.trim()}
              onClick={items.length === 0 ? undefined : onClose}
              aria-disabled={items.length === 0}
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
