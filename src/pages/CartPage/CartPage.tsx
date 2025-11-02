/* eslint-disable @next/next/no-img-element */
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import styles from "./CartPage.module.css";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export const CartPage = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.eyebrow}>Cart</span>
            <h1 className={styles.title}>Your Timelite selection</h1>
          </div>
          <Link to="/shop" className={styles.linkUnderline}>
            Continue shopping
          </Link>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.cartPanel}>
            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Your cart is empty.</p>
                <Link to="/shop" className={styles.emptyButton}>
                  Explore collections
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                  />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemMeta}>
                      Color: {item.color} | Size: {item.size}
                    </p>
                    <div className={styles.quantityRow}>
                      <label className={styles.quantityLabel}>Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuantity(item.id, Math.max(Number(event.target.value), 1))
                        }
                        className={styles.quantityInput}
                      />
                    </div>
                  </div>
                  <div className={styles.itemSummary}>
                    <p className={styles.itemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className={styles.removeButton}
                    >
                      <FiTrash2 className={styles.trashIcon} />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.summaryPanel}>
            <h2 className={styles.summaryTitle}>Order summary</h2>
            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Concierge service</span>
                <span>Included</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className={`${styles.checkoutButton} ${
                items.length === 0 ? styles.checkoutButtonDisabled : ""
              }`.trim()}
            >
              Proceed to checkout
            </Link>

            <p className={styles.legalText}>
              By continuing you agree to Timelite concierge policies and couture care guidelines.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

    export default CartPage;
