/* eslint-disable @next/next/no-img-element */
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useI18n } from "../../context/I18nContext";
import { formatCurrency } from "../../utils/currency";
import styles from "./CartPage.module.css";

export const CartPage = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { t } = useI18n();

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.eyebrow}>{t("cart.title")}</span>
            <h1 className={styles.title}>{t("cart.title")}</h1>
          </div>
          <Link to="/shop" className={styles.linkUnderline}>
            {t("cart.continue.shopping")}
          </Link>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.cartPanel}>
            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>{t("cart.empty")}</p>
                <Link to="/shop" className={styles.emptyButton}>
                  {t("cart.explore.collections")}
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
                      {t("product.color")}: {item.color} | {t("product.size")}: {item.size}
                    </p>
                    <div className={styles.quantityRow}>
                      <label className={styles.quantityLabel}>{t("cart.quantity")}</label>
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
                      {t("cart.remove")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.summaryPanel}>
            <h2 className={styles.summaryTitle}>{t("checkout.order.summary")}</h2>
            <div className={styles.summaryList}>
              <div className={styles.summaryRow}>
                <span>{t("cart.subtotal")}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className={styles.summaryTotal}>
              <div className={styles.totalRow}>
                <span>{t("cart.total")}</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className={`${styles.checkoutButton} ${
                items.length === 0 ? styles.checkoutButtonDisabled : ""
              }`.trim()}
            >
              {t("cart.proceed.checkout")}
            </Link>

            <p className={styles.legalText}>
              {t("cart.legal.text")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

    export default CartPage;
