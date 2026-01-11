import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import styles from "./OrderConfirmationPage.module.css";

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
  color?: string;
  size?: string;
}

interface OrderData {
  order_id?: string;
  id?: number;
  user_name?: string;
  user_address?: string;
  user_phone?: string;
  email?: string;
  products_items?: string | OrderItem[];
  products_price?: number;
  total_price?: number;
  payment_method?: string;
  status?: string;
  create_date?: string;
}

export default function OrderConfirmationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    // Get order data from URL params
    const orderJson = searchParams.get("data");
    if (orderJson) {
      try {
        const data = JSON.parse(decodeURIComponent(orderJson));
        setOrderData(data);
      } catch {
        console.error("Failed to parse order data");
      }
    }
  }, [searchParams]);

  const parseItems = (): OrderItem[] => {
    if (!orderData?.products_items) return [];
    if (typeof orderData.products_items === "string") {
      try {
        return JSON.parse(orderData.products_items);
      } catch {
        return [];
      }
    }
    return orderData.products_items;
  };

  const items = parseItems();
  const orderNumber = orderData?.order_id || `ORD${String(orderData?.id || "").padStart(5, "0")}`;

  if (!orderData) {
    return (
      <main className={styles.page}>
        <section className={styles.section}>
          <div className={styles.lookupForm}>
            <h1 className={styles.formTitle}>Order Not Found</h1>
            <p className={styles.formDescription}>
              We couldn&apos;t find your order details. You can look up your order using the form below.
            </p>
            <Link to="/order-lookup" className={styles.primaryButton} style={{ display: "block", textAlign: "center" }}>
              Look Up Order
            </Link>
            <Link to="/" className={styles.backLink} style={{ display: "block", marginTop: "1rem" }}>
              Continue Shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        {/* Success Banner */}
        <div className={styles.successBanner}>
          <div className={styles.successIcon}>
            <CheckCircle size={32} />
          </div>
          <h1 className={styles.successTitle}>Thank You for Your Order!</h1>
          <p className={styles.successMessage}>
            Your order <span className={styles.orderNumber}>{orderNumber}</span> has been placed successfully.
          </p>
          <p className={styles.successMessage}>
            We&apos;ve sent a confirmation email to <strong>{orderData.email || "your email"}</strong>.
          </p>
        </div>

        {/* Order Details */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Order Details</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Order Number</span>
              <span className={styles.infoValue}>{orderNumber}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>{orderData.status || "Pending"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Payment Method</span>
              <span className={styles.infoValue}>{orderData.payment_method || "N/A"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date</span>
              <span className={styles.infoValue}>
                {orderData.create_date ? new Date(orderData.create_date).toLocaleDateString() : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Shipping Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{orderData.user_name || "N/A"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{orderData.user_phone || "N/A"}</span>
            </div>
            <div className={styles.infoItem + " sm:col-span-2"}>
              <span className={styles.infoLabel}>Address</span>
              <span className={styles.infoValue}>{orderData.user_address || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Items Ordered</h2>
          <div className={styles.productList}>
            {items.map((item, index) => (
              <div key={index} className={styles.productItem}>
                <div>
                  <div className={styles.productName}>{item.name || "Product"}</div>
                  <div className={styles.productMeta}>
                    {item.color && `Color: ${item.color}`}
                    {item.color && item.size && " | "}
                    {item.size && `Size: ${item.size}`}
                    {(item.color || item.size) && " | "}
                    Qty: {item.quantity || 1}
                  </div>
                </div>
                <div className={styles.productPrice}>
                  ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totalsSection}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>${Number(orderData.products_price || 0).toFixed(2)}</span>
            </div>
            <div className={styles.grandTotal}>
              <span>Total</span>
              <span>${Number(orderData.total_price || orderData.products_price || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={() => navigate("/")} className={styles.primaryButton}>
            Continue Shopping
          </button>
          <button onClick={() => window.print()} className={styles.secondaryButton}>
            Print Order
          </button>
        </div>
      </section>
    </main>
  );
}
