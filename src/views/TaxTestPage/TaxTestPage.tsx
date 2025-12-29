"use client";

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  US_STATE_TAX_RATES,
  CANADA_PROVINCE_TAX_RATES,
  calculateSalesTax,
  getAllUSStates,
  getAllCanadaProvinces,
  NO_SALES_TAX_STATES,
  type StateTaxRate,
} from "../../data/salesTaxRates";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function TaxTestPage() {
  const [selectedCountry, setSelectedCountry] = useState<"US" | "CA">("US");
  const [selectedState, setSelectedState] = useState<string>("CA");
  const [subtotal, setSubtotal] = useState<number>(100);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const allUSStates = useMemo(() => getAllUSStates(), []);
  const allCAProvinces = useMemo(() => getAllCanadaProvinces(), []);

  const currentList = selectedCountry === "US" ? allUSStates : allCAProvinces;

  const filteredList = useMemo(() => {
    if (!searchTerm) return currentList;
    const term = searchTerm.toLowerCase();
    return currentList.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.code.toLowerCase().includes(term)
    );
  }, [currentList, searchTerm]);

  const taxResult = useMemo(() => {
    return calculateSalesTax(
      subtotal,
      selectedState,
      selectedCountry === "US" ? "United States" : "Canada"
    );
  }, [subtotal, selectedState, selectedCountry]);

  const total = subtotal + taxResult.taxAmount;

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/" style={{ color: "#8B5A2B", textDecoration: "none" }}>
          ← Back to Home
        </Link>
      </div>

      <h1
        style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#1e293b" }}
      >
        🧾 Sales Tax Calculator - Test Page
      </h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        Tax rates from Tax Foundation (July 2025). Last updated: December 2024.
      </p>

      {/* Calculator Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          padding: "2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          border: "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "1.5rem",
            color: "#334155",
          }}
        >
          Tax Calculator
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Country Select */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "#475569",
              }}
            >
              Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                const country = e.target.value as "US" | "CA";
                setSelectedCountry(country);
                setSelectedState(country === "US" ? "CA" : "ON");
              }}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "1rem",
                background: "white",
              }}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
            </select>
          </div>

          {/* State/Province Select */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "#475569",
              }}
            >
              {selectedCountry === "US" ? "State" : "Province"}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "1rem",
                background: "white",
              }}
            >
              {currentList.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name} ({item.code}) - {item.displayRate}
                </option>
              ))}
            </select>
          </div>

          {/* Subtotal Input */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: 500,
                color: "#475569",
              }}
            >
              Subtotal ($)
            </label>
            <input
              type="number"
              value={subtotal}
              onChange={(e) => setSubtotal(Number(e.target.value) || 0)}
              min="0"
              step="0.01"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "1rem",
              }}
            />
          </div>
        </div>

        {/* Results */}
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ color: "#64748b" }}>Subtotal</span>
            <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ color: "#64748b" }}>
              Tax ({taxResult.stateName} {taxResult.displayRate})
            </span>
            <span
              style={{
                fontWeight: 500,
                color: taxResult.hasTax ? "#ea580c" : "#22c55e",
              }}
            >
              {taxResult.hasTax
                ? formatCurrency(taxResult.taxAmount)
                : "No Tax"}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "0.75rem",
              borderTop: "2px solid #e2e8f0",
              fontSize: "1.25rem",
              fontWeight: 600,
            }}
          >
            <span>Total</span>
            <span style={{ color: "#1e40af" }}>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* States Without Sales Tax */}
      <div
        style={{
          background: "#ecfdf5",
          padding: "1rem 1.5rem",
          borderRadius: "8px",
          marginBottom: "2rem",
          border: "1px solid #86efac",
        }}
      >
        <h3
          style={{ color: "#166534", marginBottom: "0.5rem", fontSize: "1rem" }}
        >
          ✓ States with NO Sales Tax
        </h3>
        <p style={{ color: "#15803d", margin: 0 }}>
          {NO_SALES_TAX_STATES.map(
            (code) => US_STATE_TAX_RATES[code]?.name
          ).join(", ")}
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search states/provinces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "1rem",
          }}
        />
      </div>

      {/* Tax Rates Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "#1e40af", color: "white" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>Code</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                {selectedCountry === "US" ? "State" : "Province"}
              </th>
              <th style={{ padding: "1rem", textAlign: "right" }}>Tax Rate</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>
                Local Tax?
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item, index) => (
              <tr
                key={item.code}
                style={{
                  background: index % 2 === 0 ? "#f8fafc" : "white",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    fontWeight: 600,
                    color: "#1e40af",
                  }}
                >
                  {item.code}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>{item.name}</td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontWeight: 600,
                    color: item.rate === 0 ? "#22c55e" : "#1e293b",
                  }}
                >
                  {item.displayRate}
                </td>
                <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                  {item.hasLocalTax ? (
                    <span style={{ color: "#f59e0b" }}>⚠️ Yes</span>
                  ) : (
                    <span style={{ color: "#22c55e" }}>✓ No</span>
                  )}
                </td>
                <td
                  style={{
                    padding: "0.75rem 1rem",
                    color: "#64748b",
                    fontSize: "0.875rem",
                  }}
                >
                  {item.notes || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#fef3c7",
          borderRadius: "8px",
          border: "1px solid #fcd34d",
        }}
      >
        <p style={{ margin: 0, color: "#92400e", fontSize: "0.875rem" }}>
          <strong>⚠️ Disclaimer:</strong> These are STATE-LEVEL tax rates only.
          Local jurisdictions (cities, counties) may impose additional taxes.
          For precise tax calculations, consult a tax professional or use a
          dedicated tax compliance service.
        </p>
      </div>
    </div>
  );
}
