import React, { useState } from "react";
import ApiService from "../../services/api";

const TestPoyntPage: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState(""); // MM/YY or MM/YYYY
  const [cardCvc, setCardCvc] = useState("");
  const [cardZip, setCardZip] = useState("");

  const handlePayment = async () => {
    setLoading(true);
    setResult("Processing payment...");

    try {
      // 1. Prepare Order Data
      let realProduct;
      const prodRes = await ApiService.getProducts({ limit: 1 });
      const products = (prodRes as any).products || (prodRes as any).data || [];
      if (!products || products.length === 0)
        throw new Error("No products found");
      realProduct = products[0];

      // Parse Expiry
      let expMonth, expYear;
      if (cardExp.includes("/")) {
        [expMonth, expYear] = cardExp.split("/");
        if (expYear && expYear.length === 2) expYear = "20" + expYear;
      }

      const orderData = {
        firstname: "Test",
        lastname: "User",
        email: "test.server.token@example.com",
        address: "123 Test St, San Jose, CA 95112",
        phonenumber: "(555) 123-4567",
        payment_method: "poynt",
        // Send Raw Card Data (Test Environment Fallback)
        payment_card: {
          number: cardNumber.replace(/\s/g, ""),
          expirationMonth: expMonth,
          expirationYear: expYear,
          cvv: cardCvc,
          billingZip: cardZip,
        },
        items: [
          {
            product_id: realProduct.id,
            products_id: realProduct.products_id || undefined,
            quantity: 1,
            color: realProduct.color || "Default",
            size: realProduct.size || "M",
          },
        ],
        total_amount: Number(realProduct.price),
        notes: "Server-Side Tokenization Test",
      };

      // 2. Auto-Register
      try {
        await ApiService.register({
          email: orderData.email,
          password: "TestPassword123!",
          name: "Test User",
        });
      } catch (e) {
        console.log("User might exist, trying login");
      }
      await ApiService.login({
        email: orderData.email,
        password: "TestPassword123!",
      });

      // 3. Send to Backend
      const response = (await ApiService.createPoyntOrder(orderData)) as any;
      console.log("Backend Response:", response);

      if (response && response.success) {
        setResult(
          "SUCCESS! Payment processed. Transaction ID: " +
            (response.data?.transactionId || response.data?.order_id),
        );
      } else {
        setResult(
          "FAILED: " +
            (response.paymentError ||
              response.message ||
              JSON.stringify(response)),
        );
      }
    } catch (err: any) {
      console.error(err);
      setResult("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="p-8 max-w-2xl mx-auto"
      style={{
        padding: "50px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "Arial",
      }}
    >
      <h1 className="text-2xl font-bold mb-6">
        Poynt Direct Card Entry (Test)
      </h1>

      <div
        className="bg-white p-6 rounded-lg shadow-md mb-6"
        style={{ background: "#f9f9f9", padding: "20px", borderRadius: "8px" }}
      >
        <h2 className="text-lg font-semibold mb-4">Enter Card Details</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Card Number
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4111 1111 1111 1111"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              id="card-number"
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Expiration (MM/YY)
              </label>
              <input
                type="text"
                value={cardExp}
                onChange={(e) => setCardExp(e.target.value)}
                placeholder="12/26"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                id="card-expires"
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                CVC
              </label>
              <input
                type="text"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                placeholder="123"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
                id="card-cvc"
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Zip Code
            </label>
            <input
              type="text"
              value={cardZip}
              onChange={(e) => setCardZip(e.target.value)}
              placeholder="95112"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              id="card-zip"
            />
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "15px",
            backgroundColor: loading ? "#ccc" : "#0056b3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Processing..." : `PAY NOW ($1.00)`}
        </button>
      </div>

      {result && (
        <div
          style={{
            padding: "15px",
            marginTop: "20px",
            borderRadius: "4px",
            backgroundColor: result.includes("SUCCESS") ? "#d4edda" : "#f8d7da",
            color: result.includes("SUCCESS") ? "#155724" : "#721c24",
            border: result.includes("SUCCESS")
              ? "1px solid #c3e6cb"
              : "1px solid #f5c6cb",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Result:</h3>
          <p style={{ wordBreak: "break-word" }}>{result}</p>
        </div>
      )}
    </div>
  );
};

export default TestPoyntPage;
