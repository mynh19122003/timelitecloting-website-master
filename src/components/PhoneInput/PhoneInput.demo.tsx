import { useState } from "react";
import { PhoneInput } from "./PhoneInput";

/**
 * Demo component showing how to use PhoneInput
 * This file is for demonstration purposes only
 */
export const PhoneInputDemo = () => {
  const [phone, setPhone] = useState("+1 (312) 555-0174");

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>PhoneInput Component Demo</h2>
      
      <div style={{ marginTop: "24px" }}>
        <h3>Basic Usage</h3>
        <PhoneInput
          value={phone}
          onChange={setPhone}
        />
        <p style={{ marginTop: "12px", color: "#666" }}>
          Current value: <strong>{phone}</strong>
        </p>
      </div>

      <div style={{ marginTop: "32px" }}>
        <h3>With Error</h3>
        <PhoneInput
          value=""
          onChange={() => {}}
          error="Phone number is required"
        />
      </div>

      <div style={{ marginTop: "32px" }}>
        <h3>Features</h3>
        <ul style={{ color: "#666", lineHeight: "1.8" }}>
          <li>✅ Searchable country dropdown with 50+ countries</li>
          <li>✅ Country flags for easy identification</li>
          <li>✅ Auto-formats phone with country code</li>
          <li>✅ Click outside to close dropdown</li>
          <li>✅ Keyboard navigation support</li>
          <li>✅ Responsive design</li>
          <li>✅ Error state styling</li>
          <li>✅ Custom styling support</li>
        </ul>
      </div>

      <div style={{ marginTop: "32px" }}>
        <h3>Code Example</h3>
        <pre style={{ 
          background: "#f5f5f5", 
          padding: "16px", 
          borderRadius: "8px",
          overflow: "auto"
        }}>
{`import { PhoneInput } from "./components/PhoneInput";

const MyForm = () => {
  const [phone, setPhone] = useState("");

  return (
    <PhoneInput
      value={phone}
      onChange={setPhone}
      error={!phone ? "Required" : undefined}
    />
  );
};`}
        </pre>
      </div>
    </div>
  );
};

