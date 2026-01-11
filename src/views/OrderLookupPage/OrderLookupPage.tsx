import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Package } from "lucide-react";
import { ApiService } from "@/services/api";
import styles from "../OrderConfirmationPage/OrderConfirmationPage.module.css";

interface OrderData {
  order_id?: string;
  id?: number;
  user_name?: string;
  user_address?: string;
  user_phone?: string;
  email?: string;
  products_items?: string;
  products_price?: number;
  total_price?: number;
  payment_method?: string;
  status?: string;
  create_date?: string;
}

interface ApiResponse {
  success?: boolean;
  data?: OrderData;
  message?: string;
  error?: string;
}

export default function OrderLookupPage() {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await ApiService.lookupOrder(orderNumber.trim(), email.trim()) as ApiResponse;
      
      if (response.success && response.data) {
        // Navigate to confirmation page with order data
        const orderDataParam = encodeURIComponent(JSON.stringify(response.data));
        navigate(`/order-confirmation?data=${orderDataParam}`);
      } else {
        setError(response.message || "Order not found. Please check your order number and email.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Order not found. Please check your order number and email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.lookupForm}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div className={styles.successIcon} style={{ background: "#f5f0eb" }}>
              <Package size={32} style={{ color: "#c79b61" }} />
            </div>
          </div>
          
          <h1 className={styles.formTitle}>Track Your Order</h1>
          <p className={styles.formDescription}>
            Enter your order number and email address to view your order details.
          </p>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label className={styles.inputLabel}>
                Order Number
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="e.g., ORD00001"
                  className={styles.inputField}
                  required
                />
              </label>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label className={styles.inputLabel}>
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter the email used for your order"
                  className={styles.inputField}
                  required
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <Search size={18} />
              {loading ? "Looking up..." : "Find My Order"}
            </button>
          </form>

          <Link to="/" className={styles.backLink} style={{ display: "block", marginTop: "2rem", textAlign: "center" }}>
            ← Back to Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
