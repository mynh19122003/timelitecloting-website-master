const poyntService = require('./src/services/poyntService');

async function debug() {
  console.log("🚀 Starting Direct Poynt Service Debug...");
  
  const mockOrder = {
    firstname: "Debug",
    lastname: "User",
    email: "debug@example.com",
    notes: "Debug transaction",
    total_amount: 1.00,
    items: [
        { name: "Debug Item", price: 1.00, quantity: 1 }
    ]
  };

  try {
    console.log("Calling createPaymentUrl...");
    const result = await poyntService.createPaymentUrl(mockOrder);
    console.log("✅ RESULT:", result);
  } catch (error) {
    console.error("❌ ERROR CAUGHT:");
    console.error(error.message);
    if (error.response) {
        console.error("HTTP Status:", error.response.status);
        console.error("HTTP Data:", JSON.stringify(error.response.data, null, 2));
    } else {
        console.error("Full Error:", error);
    }
  }
}

debug();
