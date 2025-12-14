import { useState } from "react";
import { API_CONFIG } from "../../config/api";
import styles from "./USPSTestPage.module.css";

interface Address {
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
}

interface ShippingRate {
    id: string;
    name: string;
    price: number;
    time: string;
    service?: string;
}

interface RatesResponse {
    success: boolean;
    rates: ShippingRate[];
    origin?: {
        zipCode: string;
        city: string;
        state: string;
    };
    fallback?: boolean;
    warning?: string;
}

export const USPSTestPage = () => {
    const [testAddress, setTestAddress] = useState<Address>({
        streetAddress: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001"
    });

    const [rates, setRates] = useState<RatesResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationResult, setValidationResult] = useState<any>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTestAddress(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const validateAddress = async () => {
        setLoading(true);
        setError(null);
        setValidationResult(null);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/shipping/validate-address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testAddress)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Address validation failed');
            }

            setValidationResult(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            console.error('Validation error:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateRates = async () => {
        setLoading(true);
        setError(null);
        setRates(null);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/shipping/calculate-rates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    destination: {
                        zipCode: testAddress.zipCode,
                        city: testAddress.city,
                        state: testAddress.state
                    },
                    items: [
                        { quantity: 1, weight: 1.5 }
                    ]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Rate calculation failed');
            }

            setRates(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            console.error('Calculate rates error:', err);
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/shipping/test`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Connection test failed');
            }

            alert('✅ USPS Service Connected!\n\n' + JSON.stringify(data, null, 2));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            console.error('Connection test error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>USPS Shipping API Test Page</h1>
                <p className={styles.subtitle}>Test USPS address validation and shipping rate calculation</p>
            </div>

            <div className={styles.content}>
                {/* Test Connection Button */}
                <div className={styles.section}>
                    <button
                        onClick={testConnection}
                        className={styles.testButton}
                        disabled={loading}
                    >
                        {loading ? '🔄 Testing...' : '🔌 Test USPS Connection'}
                    </button>
                </div>

                {/* Address Input Form */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>📍 Delivery Address</h2>
                    <div className={styles.form}>
                        <div className={styles.formGroup}>
                            <label>Street Address</label>
                            <input
                                type="text"
                                name="streetAddress"
                                value={testAddress.streetAddress}
                                onChange={handleInputChange}
                                className={styles.input}
                                placeholder="123 Main St"
                            />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={testAddress.city}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="New York"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={testAddress.state}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="NY"
                                    maxLength={2}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>ZIP Code</label>
                                <input
                                    type="text"
                                    name="zipCode"
                                    value={testAddress.zipCode}
                                    onChange={handleInputChange}
                                    className={styles.input}
                                    placeholder="10001"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className={styles.actions}>
                    <button
                        onClick={validateAddress}
                        className={styles.buttonPrimary}
                        disabled={loading}
                    >
                        {loading ? '⏳ Validating...' : '✅ Validate Address'}
                    </button>
                    <button
                        onClick={calculateRates}
                        className={styles.buttonSecondary}
                        disabled={loading}
                    >
                        {loading ? '⏳ Calculating...' : '💰 Calculate Shipping Rates'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className={styles.error}>
                        <strong>❌ Error:</strong> {error}
                    </div>
                )}

                {/* Validation Result */}
                {validationResult && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>✅ Address Validation Result</h2>
                        <div className={styles.result}>
                            <pre>{JSON.stringify(validationResult, null, 2)}</pre>
                        </div>
                    </div>
                )}

                {/* Shipping Rates Display */}
                {rates && (
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            💰 Shipping Rates
                            {rates.fallback && <span className={styles.fallbackBadge}>Fallback Rates</span>}
                        </h2>

                        {rates.warning && (
                            <div className={styles.warning}>
                                ⚠️ {rates.warning}
                            </div>
                        )}

                        <div className={styles.origin}>
                            <strong>Origin:</strong> {rates.origin?.city}, {rates.origin?.state} {rates.origin?.zipCode}
                        </div>

                        <div className={styles.ratesGrid}>
                            {rates.rates && rates.rates.map((rate, index) => (
                                <div key={index} className={styles.rateCard}>
                                    <div className={styles.rateName}>{rate.name}</div>
                                    <div className={styles.ratePrice}>${rate.price.toFixed(2)}</div>
                                    <div className={styles.rateTime}>{rate.time}</div>
                                    {rate.service && (
                                        <div className={styles.rateService}>Service: {rate.service}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={styles.rawData}>
                            <details>
                                <summary>View Raw Response</summary>
                                <pre>{JSON.stringify(rates, null, 2)}</pre>
                            </details>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
