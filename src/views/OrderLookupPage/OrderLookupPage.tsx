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
      const response = (await ApiService.lookupOrder(
        orderNumber.trim(),
        email.trim(),
      )) as ApiResponse;

      if (response.success && response.data) {
        // Store order data in sessionStorage (secure - not in URL)
        sessionStorage.setItem(
          "order_lookup_data",
          JSON.stringify(response.data),
        );

        // Navigate with only order_id (safe to expose)
        const orderId =
          response.data.order_id ||
          `ORD${String(response.data.id || "").padStart(5, "0")}`;
        navigate(`/order-confirmation?id=${orderId}`);
      } else {
        setError(
          response.message ||
            "Order not found. Please check your order number and email.",
        );
      }
    } catch (err) {
      console.error("Lookup error:", err);

      // Detailed error handling
      let errorMessage =
        "Order not found. Please check your order number and email.";

      if (err instanceof Error) {
        // Show the actual error message for debugging
        errorMessage = err.message;

        // Add more context if it's an API error
        if (err.message.includes("Token") || err.message.includes("401")) {
          errorMessage =
            "Authentication error: " +
            err.message +
            " (Try refreshing the page)";
        } else if (
          err.message.includes("Network") ||
          err.message.includes("timeout")
        ) {
          errorMessage =
            "Network error: " + err.message + " (Check your connection)";
        } else if (err.message.includes("404")) {
          errorMessage =
            "Order not found. Please check your order number and email.";
        }
      } else if (typeof err === "object" && err !== null) {
        // Handle error objects
        const errObj = err as {
          message?: string;
          error?: string;
          status?: number;
        };
        errorMessage = errObj.message || errObj.error || JSON.stringify(err);
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className={styles.lookupForm}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              className={styles.successIcon}
              style={{ background: "#f5f0eb" }}
            >
              <Package size={32} style={{ color: "#c79b61" }} />
            </div>
          </div>

          <h1 className={styles.formTitle}>Track Your Order</h1>
          <p className={styles.formDescription}>
            Enter your order number and email address to view your order
            details.
          </p>

          {error && <div className={styles.errorMessage}>{error}</div>}

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
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Search size={18} />
              {loading ? "Looking up..." : "Find My Order"}
            </button>
          </form>

          <Link
            to="/"
            className={styles.backLink}
            style={{ display: "block", marginTop: "2rem", textAlign: "center" }}
          >
            ← Back to Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
