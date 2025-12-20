import { useState, useEffect, FormEvent, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart, type CartItem } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../context/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { ApiService } from "../../services/api";
import { API_CONFIG } from "../../config/api";
import { getUserData } from "../../utils/auth";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import CountryPhoneInput from "react-country-phone-input";
import "react-country-phone-input/lib/style.css";
// We no longer rely on static numeric productId map.
import styles from "./CheckoutPage.module.css";

type InputProps = {
  label: string;
  type?: string;
  className?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  autoComplete?: string;
};

const Input = ({
  label,
  type = "text",
  className,
  name,
  value,
  onChange,
  required = false,
  pattern,
  minLength,
  maxLength,
  placeholder,
  autoComplete,
}: InputProps) => (
  <label className={`${styles.inputLabel} ${className ?? ""}`.trim()}>
    {label}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      pattern={pattern}
      minLength={minLength}
      maxLength={maxLength}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={styles.inputField}
    />
  </label>
);

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  notes: string;
  paymentMethod: "credit_card" | "bank_transfer";
  shippingMethod: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  billingSameAsShipping: boolean;
  billingFirstName: string;
  billingLastName: string;
  billingCompany: string;
  billingStreetAddress: string;
  billingApartment: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
  billingCountry: string;
  billingPhone: string;
}

// Shipping rate type from Shippo API
interface ShippingRate {
  id: string;
  name: string;
  price: number;
  time: string;
  provider?: string;
  service?: string;
  estimatedDays?: number;
  fallback?: boolean;
}

// Fallback rates if API fails
const FALLBACK_SHIPPING_RATES: ShippingRate[] = [
  {
    id: "fallback_ground",
    name: "USPS Ground Advantage",
    price: 7.49,
    time: "3-5 business days",
    provider: "USPS",
    fallback: true,
  },
  {
    id: "fallback_priority",
    name: "USPS Priority Mail",
    price: 9.99,
    time: "1-3 business days",
    provider: "USPS",
    fallback: true,
  },
  {
    id: "fallback_express",
    name: "USPS Priority Mail Express",
    price: 29.99,
    time: "1-2 business days",
    provider: "USPS",
    fallback: true,
  },
];

const DEFAULT_SHIPPING_METHOD = "fallback_ground";
const SUPPORTED_COUNTRIES = ["US", "CA"];

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (value: string) => {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
};

const passesLuhnCheck = (value: string) => {
  let sum = 0;
  let shouldDouble = false;
  for (let i = value.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(value.charAt(i), 10);
    if (Number.isNaN(digit)) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const parseCardExpiry = (value: string) => {
  const match = value.match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const fullYear = 2000 + year;
  const expiryDate = new Date(fullYear, month, 0, 23, 59, 59, 999);
  return { month, year: fullYear, expiryDate };
};

type CheckoutLocationState = {
  directPurchase?: CartItem;
};

export const CheckoutPage = () => {
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ??
    null) as CheckoutLocationState | null;
  const directPurchaseItem = locationState?.directPurchase;
  const items = directPurchaseItem ? [directPurchaseItem] : cartItems;
  const total = directPurchaseItem
    ? directPurchaseItem.price * directPurchaseItem.quantity
    : cartTotal;
  const isDirectPurchase = Boolean(directPurchaseItem);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    notes: "",
    paymentMethod: "credit_card",
    shippingMethod: DEFAULT_SHIPPING_METHOD,
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    billingSameAsShipping: true,
    billingFirstName: "",
    billingLastName: "",
    billingCompany: "",
    billingStreetAddress: "",
    billingApartment: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
    billingCountry: "United States",
    billingPhone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shipping rates state (fetched from Shippo API)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Check if address is complete for shipping calculation
  const isAddressComplete = Boolean(
    formData.city.trim() &&
      formData.state.trim() &&
      formData.zipCode.trim() &&
      formData.zipCode.length >= 5
  );

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      // If authenticated → fetch live profile
      // If not authenticated → try local cached user to prefill
      const hasToken = ApiService.isAuthenticated();

      try {
        const profile = hasToken
          ? await ApiService.getProfile()
          : getUserData();

        // Parse name into first/last name
        const nameParts = ((profile && profile.name) || "")
          .trim()
          .split(" ")
          .filter(Boolean);
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Parse address into components
        const rawAddress = (profile && profile.address) || "";
        const addressParts = rawAddress
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        let streetAddress = addressParts[0] || "";
        const city = addressParts[1] || "";
        let state = "";
        let zipCode = "";
        let detectedCountry = "";
        if (addressParts.length >= 3) {
          const stateZip = addressParts[2] || "";
          const stateZipMatch = stateZip.match(
            /^([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/i
          );
          state = stateZipMatch ? stateZipMatch[1].toUpperCase() : "";
          zipCode = stateZipMatch ? stateZipMatch[2] : "";
          if (addressParts.length >= 4) {
            detectedCountry = addressParts[addressParts.length - 1] || "";
          }
        } else if (rawAddress && (!streetAddress || !city)) {
          // Fallback: if cannot parse, put full address into streetAddress
          streetAddress = rawAddress;
        }

        setFormData((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: (profile && profile.email) || prev.email,
          phone: (profile && profile.phone) || prev.phone,
          streetAddress: streetAddress || prev.streetAddress,
          city: city || prev.city,
          state: state || prev.state,
          zipCode: zipCode || prev.zipCode,
          country: detectedCountry || prev.country || "United States",
        }));
      } catch (err: unknown) {
        console.error("Failed to load profile:", err);
        // Don't show error to user - they can still fill the form manually
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  // Fetch shipping rates when address is complete
  // Using a ref to track if we already fetched for this address to avoid re-fetching
  const shippingFetchKeyRef = useRef<string>("");

  useEffect(() => {
    if (!isAddressComplete) {
      // Reset shipping when address becomes incomplete
      setShippingRates([]);
      setShippingError(null);
      shippingFetchKeyRef.current = "";
      return;
    }

    // Create a key from address to avoid re-fetching same address
    const addressKey = `${formData.city}-${formData.state}-${formData.zipCode}`;
    if (shippingFetchKeyRef.current === addressKey) {
      return; // Already fetched for this address
    }

    const fetchShippingRates = async () => {
      setIsLoadingShipping(true);
      setShippingError(null);

      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/api/shipping/calculate-rates`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              destination: {
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                streetAddress: formData.streetAddress || "123 Main St",
              },
              items: [{ quantity: 1, weight: 1.5 }],
            }),
          }
        );

        const data = await response.json();

        if (data.success && data.rates && data.rates.length > 0) {
          setShippingRates(data.rates);
          shippingFetchKeyRef.current = addressKey;
          // Only auto-select if no method selected yet
          setFormData((prev) => {
            if (
              !prev.shippingMethod ||
              prev.shippingMethod.startsWith("fallback")
            ) {
              return { ...prev, shippingMethod: data.rates[0].id };
            }
            // Check if current method exists in new rates
            const exists = data.rates.some(
              (r: ShippingRate) => r.id === prev.shippingMethod
            );
            if (!exists) {
              return { ...prev, shippingMethod: data.rates[0].id };
            }
            return prev; // Keep current selection
          });
        } else {
          // Use fallback rates
          setShippingRates(FALLBACK_SHIPPING_RATES);
          setShippingError("Using estimated rates");
          shippingFetchKeyRef.current = addressKey;
          setFormData((prev) => {
            if (
              !prev.shippingMethod ||
              !prev.shippingMethod.startsWith("fallback")
            ) {
              return { ...prev, shippingMethod: FALLBACK_SHIPPING_RATES[0].id };
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Failed to fetch shipping rates:", err);
        setShippingRates(FALLBACK_SHIPPING_RATES);
        setShippingError("Could not fetch live rates. Using estimates.");
        shippingFetchKeyRef.current = addressKey;
        setFormData((prev) => {
          if (
            !prev.shippingMethod ||
            !prev.shippingMethod.startsWith("fallback")
          ) {
            return { ...prev, shippingMethod: FALLBACK_SHIPPING_RATES[0].id };
          }
          return prev;
        });
      } finally {
        setIsLoadingShipping(false);
      }
    };

    // Debounce to avoid too many API calls
    const timer = setTimeout(fetchShippingRates, 600);
    return () => clearTimeout(timer);
    // Only depend on address fields, not items or shippingMethod
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddressComplete, formData.city, formData.state, formData.zipCode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    // Auto-format and sanitize based on field type
    if (name === "state" || name === "billingState") {
      // Auto uppercase state code and limit to 2 chars
      sanitizedValue = value
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
        .slice(0, 2);
    } else if (name === "zipCode" || name === "billingZipCode") {
      // Only allow digits and hyphen for ZIP
      sanitizedValue = value.replace(/[^\d-]/g, "").slice(0, 10);
    } else if (
      name === "firstName" ||
      name === "lastName" ||
      name === "city" ||
      name === "billingFirstName" ||
      name === "billingLastName" ||
      name === "billingCity"
    ) {
      // Prevent numbers and special chars in names
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, "");
    } else if (name === "email") {
      // No spaces in email
      sanitizedValue = value.replace(/\s/g, "").toLowerCase();
    } else if (name === "cardNumber") {
      sanitizedValue = formatCardNumber(value);
    } else if (name === "cardExpiry") {
      sanitizedValue = formatExpiry(value);
    } else if (name === "cardCvc") {
      sanitizedValue = digitsOnly(value).slice(0, 4);
    } else if (name === "cardName") {
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, "").toUpperCase();
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value as FormData["paymentMethod"],
    }));
    if (error) setError(null);
  };

  const handleCountryChange = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      country,
      state: "",
    }));
    if (error) setError(null);
  };

  const handleRegionChange = (region: string) => {
    const normalizedRegion = region ? region.toUpperCase() : "";
    setFormData((prev) => ({ ...prev, state: normalizedRegion }));
    if (error) setError(null);
  };

  const handleShippingChange = (methodId: string) => {
    setFormData((prev) => ({ ...prev, shippingMethod: methodId }));
  };

  const handleBillingToggle = () => {
    setFormData((prev) => {
      const nextValue = !prev.billingSameAsShipping;
      if (nextValue) {
        return {
          ...prev,
          billingSameAsShipping: nextValue,
          billingFirstName: prev.firstName,
          billingLastName: prev.lastName,
          billingCompany: prev.company,
          billingStreetAddress: prev.streetAddress,
          billingApartment: prev.apartment,
          billingCity: prev.city,
          billingState: prev.state,
          billingZipCode: prev.zipCode,
          billingCountry: prev.country,
          billingPhone: prev.phone,
        };
      }

      return { ...prev, billingSameAsShipping: nextValue };
    });
  };

  const handleBillingCountryChange = (country: string) => {
    setFormData((prev) => ({
      ...prev,
      billingCountry: country,
      billingState: "",
    }));
    if (error) setError(null);
  };

  const handleBillingRegionChange = (region: string) => {
    const normalizedRegion = region ? region.toUpperCase() : "";
    setFormData((prev) => ({ ...prev, billingState: normalizedRegion }));
    if (error) setError(null);
  };

  // Calculate shipping cost from dynamic rates
  const getShippingCost = () => {
    const rates =
      shippingRates.length > 0 ? shippingRates : FALLBACK_SHIPPING_RATES;
    const method = rates.find((m) => m.id === formData.shippingMethod);
    return method ? method.price : 0;
  };

  const shippingCost = getShippingCost();
  const finalTotal = total + shippingCost;
  // Use dynamic shipping rates (from API or fallback)
  const shippingOptions = shippingRates.length > 0 ? shippingRates : [];

  const sanitizePhoneNumber = (value: string) => value.replace(/[^\d+]/g, "");

  const handlePhoneChange = (
    field: "phone" | "billingPhone",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate cart has items
    if (items.length === 0) {
      setError(t("checkout.cart.empty"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError(t("checkout.name.required"));
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError(t("checkout.email.invalid"));
        setIsSubmitting(false);
        return;
      }

      // Phone validation (allow international)
      const numericPhone = sanitizePhoneNumber(formData.phone);
      if (numericPhone.length < 8) {
        setError(t("checkout.phone.invalid"));
        setIsSubmitting(false);
        return;
      }

      // Address validation
      if (!formData.streetAddress.trim() || formData.streetAddress.length < 5) {
        setError(t("checkout.address.invalid"));
        setIsSubmitting(false);
        return;
      }

      if (!formData.city.trim() || formData.city.length < 2) {
        setError(t("checkout.city.invalid"));
        setIsSubmitting(false);
        return;
      }

      if (!formData.country.trim()) {
        setError(t("checkout.country.invalid"));
        setIsSubmitting(false);
        return;
      }

      // State validation (support US + general regions)
      const stateRegex = /^[A-Z]{2}$/;
      if (!formData.state.trim()) {
        setError(t("checkout.state.required"));
        setIsSubmitting(false);
        return;
      } else if (
        formData.country === "United States" &&
        !stateRegex.test(formData.state)
      ) {
        setError(t("checkout.state.invalid"));
        setIsSubmitting(false);
        return;
      }

      // ZIP code validation (5 digits or 5+4 format)
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formData.zipCode)) {
        setError(t("checkout.zip.invalid"));
        setIsSubmitting(false);
        return;
      }

      // Prepare order data for backend
      const shippingStreetLine = formData.apartment
        ? `${formData.streetAddress}, ${formData.apartment}`
        : formData.streetAddress;
      const shippingAddress =
        `${shippingStreetLine}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`.trim();

      const billingData = formData.billingSameAsShipping
        ? {
            billingFirstName: formData.firstName,
            billingLastName: formData.lastName,
            billingCompany: formData.company,
            billingStreetAddress: formData.streetAddress,
            billingApartment: formData.apartment,
            billingCity: formData.city,
            billingState: formData.state,
            billingZipCode: formData.zipCode,
            billingCountry: formData.country,
            billingPhone: formData.phone,
          }
        : {
            billingFirstName: formData.billingFirstName,
            billingLastName: formData.billingLastName,
            billingCompany: formData.billingCompany,
            billingStreetAddress: formData.billingStreetAddress,
            billingApartment: formData.billingApartment,
            billingCity: formData.billingCity,
            billingState: formData.billingState,
            billingZipCode: formData.billingZipCode,
            billingCountry: formData.billingCountry,
            billingPhone: formData.billingPhone,
          };

      if (!formData.billingSameAsShipping) {
        const requiredBillingFields: Array<[keyof typeof billingData, string]> =
          [
            ["billingFirstName", t("checkout.first.name")],
            ["billingLastName", t("checkout.last.name")],
            ["billingStreetAddress", t("checkout.address.search")],
            ["billingCity", t("checkout.city")],
            ["billingState", t("checkout.state")],
            ["billingZipCode", t("checkout.zip")],
            ["billingCountry", t("checkout.country")],
            ["billingPhone", t("checkout.phone")],
          ];

        for (const [field, label] of requiredBillingFields) {
          if (!billingData[field]?.trim()) {
            setError(t("checkout.billing.required").replace("{field}", label));
            setIsSubmitting(false);
            return;
          }
        }

        const billingPhoneNumeric = sanitizePhoneNumber(
          billingData.billingPhone || ""
        );
        if (billingPhoneNumeric.length < 8) {
          setError(t("checkout.billing.phone.invalid"));
          setIsSubmitting(false);
          return;
        }
      }

      if (formData.paymentMethod === "credit_card") {
        const cardNameTrimmed = formData.cardName.trim();
        const cardDigits = digitsOnly(formData.cardNumber);
        const expiryInfo = parseCardExpiry(formData.cardExpiry.trim());
        const cvcDigits = digitsOnly(formData.cardCvc);

        if (cardNameTrimmed.length < 2) {
          setError("Please enter the name printed on your card.");
          setIsSubmitting(false);
          return;
        }

        if (
          cardDigits.length < 13 ||
          cardDigits.length > 19 ||
          !passesLuhnCheck(cardDigits)
        ) {
          setError("Please enter a valid card number (13‑19 digits).");
          setIsSubmitting(false);
          return;
        }

        if (!expiryInfo) {
          setError("Expiration date must follow MM / YY format.");
          setIsSubmitting(false);
          return;
        }

        const now = new Date();
        if (expiryInfo.expiryDate < now) {
          setError("This card appears to be expired.");
          setIsSubmitting(false);
          return;
        }

        if (!/^\d{3,4}$/.test(cvcDigits)) {
          setError("Security code must be 3 or 4 digits.");
          setIsSubmitting(false);
          return;
        }
      }

      const billingStreetLine = billingData.billingApartment
        ? `${billingData.billingStreetAddress}, ${billingData.billingApartment}`
        : billingData.billingStreetAddress;
      const billingAddress =
        `${billingStreetLine}, ${billingData.billingCity}, ${billingData.billingState} ${billingData.billingZipCode}, ${billingData.billingCountry}`.trim();

      // 🔍 DEBUG: Log raw cart items first
      console.log("🛒 ========== CART ITEMS DEBUG ==========");
      console.log("Total items in cart:", items.length);
      items.forEach((item, index) => {
        console.log(`\n📦 Cart Item #${index + 1}:`, {
          id: item.id,
          productId: item.productId,
          pid: item.pid,
          name: item.name,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price,
          fullItem: item,
        });
      });
      console.log("=========================================\n");

      // Build items with products_id (PID) or product_slug fallback
      const DEFAULT_SIZE_LABEL = "One Size";

      type OrderItemPayload = {
        quantity: number;
        color: string;
        size: string;
        products_id?: string;
        product_id?: number;
        product_slug?: string;
      };

      const mappedItems = items.map<OrderItemPayload>((item, index) => {
        console.log(`\n🔄 Mapping item #${index + 1}:`, {
          itemId: item.id,
          productId: item.productId,
          pid: item.pid,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          name: item.name,
        });

        // Validate required fields
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(
            `Item #${index + 1} (${item.name}) has invalid quantity: ${
              item.quantity
            }`
          );
        }

        if (!item.color) {
          throw new Error(`Item #${index + 1} (${item.name}) is missing color`);
        }

        const resolvedSize =
          typeof item.size === "string" && item.size.trim().length > 0
            ? item.size.trim()
            : DEFAULT_SIZE_LABEL;

        if (!item.size) {
          console.warn(
            `[Checkout] Item ${item.name} has no size. Using fallback "${resolvedSize}".`,
            item
          );
        }

        const base: OrderItemPayload = {
          quantity: item.quantity,
          color: item.color,
          size: resolvedSize,
        };

        // Priority 1: Use pid (products_id) from cart item if available
        if (item.pid && item.pid.trim() !== "") {
          const result = { products_id: String(item.pid), ...base };
          console.log(`  ✅ Using products_id: ${item.pid}`, result);
          return result;
        }

        // Priority 2: Try to parse productId as number (product_id)
        if (item.productId) {
          const numericId = parseInt(item.productId, 10);
          if (!isNaN(numericId) && numericId > 0) {
            const result = { product_id: numericId, ...base };
            console.log(`  ✅ Using product_id: ${numericId}`, result);
            return result;
          }

          // Priority 3: Fallback: use product_slug so backend can resolve
          if (item.productId.trim() !== "") {
            const result = { product_slug: item.productId, ...base };
            console.log(`  ✅ Using product_slug: ${item.productId}`, result);
            return result;
          }
        }

        // If we get here, the item has no valid identifier
        const errorMsg = `Item #${index + 1} (${
          item.name
        }) has no valid product identifier. productId: "${
          item.productId
        }", pid: "${item.pid}"`;
        console.error(`  ❌ ${errorMsg}`);
        throw new Error(errorMsg);
      });

      console.log(
        "\n📋 Final mapped items:",
        JSON.stringify(mappedItems, null, 2)
      );

      // Final validation: ensure all items have at least one identifier
      mappedItems.forEach((item, index) => {
        const hasProductId = !!item.product_id;
        const hasProductsId = !!item.products_id;
        const hasProductSlug = !!item.product_slug;

        if (!hasProductId && !hasProductsId && !hasProductSlug) {
          throw new Error(
            `Mapped item #${
              index + 1
            } is missing all product identifiers: ${JSON.stringify(item)}`
          );
        }

        if (!item.quantity || item.quantity <= 0) {
          throw new Error(
            `Mapped item #${index + 1} has invalid quantity: ${item.quantity}`
          );
        }
      });

      const orderData = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        email: formData.email,
        company: formData.company,
        address: shippingAddress,
        street_address: formData.streetAddress,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        country: formData.country,
        phonenumber: formData.phone,
        notes: formData.notes || "",
        payment_method: formData.paymentMethod,
        shipping_method: formData.shippingMethod,
        shipping_cost: shippingCost,
        shipping_firstname: formData.firstName,
        shipping_lastname: formData.lastName,
        shipping_company: formData.company,
        shipping_address: shippingAddress,
        shipping_phone: formData.phone,
        billing_firstname: billingData.billingFirstName,
        billing_lastname: billingData.billingLastName,
        billing_company: billingData.billingCompany,
        billing_address: billingAddress,
        billing_phone: billingData.billingPhone,
        items: mappedItems,
        total_amount: finalTotal,
      };

      // 🔍 DEBUG: Log complete order data being sent to API
      console.log("\n📦 ========== ORDER DATA TO BE SENT ==========");
      console.log(JSON.stringify(orderData, null, 2));
      console.log("=============================================\n");

      // Create order via API
      const response = (await ApiService.createOrder(orderData)) as {
        order_id?: string;
        id?: string | number;
      };

      // 🔍 DEBUG: Log API response
      console.log("✅ API Response:", response);

      // Show success toast
      const orderId = response.order_id || response.id || "placed";
      showToast(
        t("checkout.order.success").replace("{orderId}", String(orderId)),
        "success"
      );

      // Clear cart on success only when checking out cart contents
      if (!isDirectPurchase) {
        clearCart();
      }

      // Navigate to order history
      navigate("/profile?tab=orders");
    } catch (err: unknown) {
      console.error("❌ Order creation failed:", err);
      console.error(
        "Error type:",
        err instanceof Error ? err.constructor.name : typeof err
      );
      console.error("Error details:", {
        name: err instanceof Error ? err.name : undefined,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        fullError: err,
      });

      // Extract error message from various error formats
      let message = t("checkout.order.failed");

      if (err instanceof Error) {
        message = err.message || message;
      } else if (typeof err === "object" && err !== null) {
        // Check for ApiError format
        if ("message" in err) {
          message = String((err as { message?: unknown }).message) || message;
        } else if ("error" in err) {
          message = String((err as { error?: unknown }).error) || message;
        }
      }

      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.headerActions}>
          <Link to="/cart" className={styles.linkUnderline}>
            {t("checkout.return.to.cart")}
          </Link>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
              color: "#c00",
            }}
          >
            {error}
          </div>
        )}

        {isLoadingProfile && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1.5rem",
              backgroundColor: "#f0f8ff",
              border: "1px solid #b0d4f1",
              borderRadius: "4px",
              color: "#1e5a8e",
            }}
          >
            {t("checkout.loading.profile")}
          </div>
        )}

        <div className={styles.grid}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <h2 className={styles.clientInfoTitle}>
                {t("checkout.client.info")}
              </h2>
              <div className={styles.fieldGrid}>
                <Input
                  label={t("checkout.first.name")}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder={t("checkout.first.name")}
                  autoComplete="given-name"
                />
                <Input
                  label={t("checkout.last.name")}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder={t("checkout.last.name")}
                  autoComplete="family-name"
                />
                <Input
                  label={t("checkout.company")}
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  autoComplete="organization"
                  className={styles.fullWidth}
                />
                <label className={`${styles.inputLabel} ${styles.fullWidth}`}>
                  {t("checkout.address.search")}
                  <div className={styles.addressSearchField}>
                    <span
                      className={styles.addressSearchIcon}
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <line x1="16.5" y1="16.5" x2="22" y2="22" />
                      </svg>
                    </span>
                    <input
                      name="streetAddress"
                      value={formData.streetAddress}
                      onChange={handleInputChange}
                      required
                      minLength={5}
                      placeholder={t("checkout.address.search.placeholder")}
                      autoComplete="address-line1"
                      className={styles.addressInput}
                    />
                  </div>
                </label>
                <Input
                  label={t("checkout.apartment")}
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className={styles.fullWidth}
                  placeholder={t("checkout.apartment.placeholder")}
                  autoComplete="address-line2"
                />
                <Input
                  label={t("checkout.city")}
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  placeholder={t("checkout.city")}
                  autoComplete="address-level2"
                />
                <label className={styles.inputLabel}>
                  {t("checkout.country")}
                  <div className={styles.selectWrapper}>
                    <CountryDropdown
                      value={formData.country}
                      onChange={handleCountryChange}
                      whitelist={SUPPORTED_COUNTRIES}
                      className={styles.selectField}
                      defaultOptionLabel={t("checkout.country.placeholder")}
                      valueType="full"
                      name="country"
                      aria-label={t("checkout.country")}
                    />
                  </div>
                </label>
                <label className={styles.inputLabel}>
                  {t("checkout.state")}
                  <div className={styles.selectWrapper}>
                    <RegionDropdown
                      country={formData.country}
                      value={formData.state}
                      onChange={handleRegionChange}
                      valueType="short"
                      className={styles.selectField}
                      blankOptionLabel={t("checkout.state.placeholder")}
                      disableWhenEmpty
                      name="state"
                      aria-label={t("checkout.state")}
                    />
                  </div>
                </label>
                <Input
                  label={t("checkout.zip")}
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  pattern="\d{5}(-\d{4})?"
                  placeholder="90001"
                  autoComplete="postal-code"
                />
                <label className={styles.inputLabel}>
                  {t("checkout.phone")}
                  <div className={styles.phoneInputWrapper}>
                    <CountryPhoneInput
                      value={formData.phone}
                      onChange={(value: string) =>
                        handlePhoneChange("phone", value)
                      }
                      placeholder={t("checkout.phone.placeholder")}
                      enableSearch
                      inputProps={{ name: "phone", autoComplete: "tel" }}
                    />
                  </div>
                </label>
                <Input
                  label={t("checkout.email")}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={t("checkout.email")}
                  autoComplete="email"
                  className={styles.fullWidth}
                />
              </div>
            </div>

            {/* Shipping Method Section - Only show when address is complete */}
            <div>
              <h2 className={styles.sectionTitle}>
                {t("checkout.shipping.method")}
              </h2>

              {/* Show prompt when address incomplete */}
              {!isAddressComplete && (
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    color: "#6c757d",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Please fill in your city, state, and ZIP code to see shipping
                  options
                </div>
              )}

              {/* Show loading spinner */}
              {isAddressComplete && isLoadingShipping && (
                <div
                  style={{
                    padding: "1.5rem",
                    backgroundColor: "#f0f8ff",
                    border: "1px solid #b0d4f1",
                    borderRadius: "8px",
                    color: "#1e5a8e",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid #b0d4f1",
                      borderTop: "2px solid #1e5a8e",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Calculating shipping rates...
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Show error with warning */}
              {isAddressComplete && !isLoadingShipping && shippingError && (
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    marginBottom: "0.5rem",
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffc107",
                    borderRadius: "6px",
                    color: "#856404",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {shippingError}
                </div>
              )}

              {/* Show shipping options when loaded */}
              {isAddressComplete &&
                !isLoadingShipping &&
                shippingOptions.length > 0 && (
                  <div className={styles.shippingOptions}>
                    {shippingOptions.map((method) => (
                      <label
                        key={method.id}
                        className={`${styles.shippingOption} ${
                          formData.shippingMethod === method.id
                            ? styles.shippingOptionActive
                            : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.id}
                            checked={formData.shippingMethod === method.id}
                            onChange={() => handleShippingChange(method.id)}
                            className={styles.shippingRadio}
                          />
                          <div className={styles.shippingInfo}>
                            <span className={styles.shippingName}>
                              {method.provider && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "0.15rem 0.4rem",
                                    marginRight: "0.5rem",
                                    backgroundColor: "#1e40af",
                                    color: "white",
                                    borderRadius: "4px",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {method.provider}
                                </span>
                              )}
                              {method.name.replace(`${method.provider} `, "")}
                            </span>
                            <span className={styles.shippingTime}>
                              {method.time}
                            </span>
                          </div>
                        </div>
                        <span className={styles.shippingPrice}>
                          {formatCurrency(method.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
            </div>

            <div>
              <h2 className={styles.sectionTitle}>
                {t("checkout.notes.stylist")}
              </h2>
              <div className={styles.notesWrapper}>
                <textarea
                  rows={6}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t("checkout.notes.placeholder")}
                  className={styles.textArea}
                />
              </div>
            </div>

            <div>
              <h2 className={styles.sectionTitle}>
                {t("checkout.payment.method")}
              </h2>

              <div className={styles.paymentGroup}>
                <div
                  className={`${styles.paymentOption} ${
                    formData.paymentMethod === "credit_card"
                      ? styles.paymentOptionActive
                      : ""
                  }`}
                >
                  <label
                    htmlFor="payment-credit-card"
                    className={styles.paymentOptionHeader}
                  >
                    <div className={styles.paymentHeaderLeft}>
                      <input
                        type="radio"
                        id="payment-credit-card"
                        name="paymentMethod"
                        value="credit_card"
                        checked={formData.paymentMethod === "credit_card"}
                        onChange={handleSelectChange}
                        className={styles.paymentRadio}
                      />
                      <div>
                        <p className={styles.paymentTitle}>Credit card</p>
                        <p className={styles.paymentDesc}>
                          Pay securely with Visa, Mastercard or digital wallets
                        </p>
                      </div>
                    </div>
                    <div className={styles.paymentLogos}>
                      <img
                        src="/images/apple-pay-seeklogo.png"
                        alt="Apple Pay"
                        className={styles.paymentLogo}
                        loading="lazy"
                      />
                      <img
                        src="/images/google-pay.png"
                        alt="Google Pay"
                        className={styles.paymentLogo}
                        loading="lazy"
                      />
                    </div>
                  </label>

                  <div
                    className={styles.paymentBody}
                    aria-hidden={formData.paymentMethod !== "credit_card"}
                  >
                    <div className={styles.ccInputGroup}>
                      <Input
                        label=""
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="Card number"
                        className="w-full"
                      />
                      <div className={styles.ccInputIcon}>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="3"
                            y="11"
                            width="18"
                            height="11"
                            rx="2"
                            ry="2"
                          ></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      </div>
                    </div>

                    <div className={styles.paymentBodyGrid}>
                      <Input
                        label=""
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="Expiration date (MM / YY)"
                      />
                      <Input
                        label=""
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        placeholder="Security code"
                      />
                    </div>

                    <Input
                      label=""
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="Name on card"
                    />

                    <div className={styles.billingToggle}>
                      <input
                        type="checkbox"
                        id="billingSame"
                        checked={formData.billingSameAsShipping}
                        onChange={handleBillingToggle}
                        className={styles.billingCheckbox}
                      />
                      <label
                        htmlFor="billingSame"
                        className={styles.billingLabel}
                      >
                        Use shipping address as billing address
                      </label>
                    </div>

                    {!formData.billingSameAsShipping && (
                      <div className={styles.billingDetails} aria-live="polite">
                        <div className={styles.billingDetailsHeader}>
                          <p className={styles.billingTitle}>Billing address</p>
                          <p className={styles.billingSubtitle}>
                            Enter the address that matches your payment method
                          </p>
                        </div>
                        <div className={styles.fieldGrid}>
                          <Input
                            label={t("checkout.first.name")}
                            name="billingFirstName"
                            value={formData.billingFirstName}
                            onChange={handleInputChange}
                            required
                            minLength={2}
                            autoComplete="billing given-name"
                          />
                          <Input
                            label={t("checkout.last.name")}
                            name="billingLastName"
                            value={formData.billingLastName}
                            onChange={handleInputChange}
                            required
                            minLength={2}
                            autoComplete="billing family-name"
                          />
                          <Input
                            label={t("checkout.company")}
                            name="billingCompany"
                            value={formData.billingCompany}
                            onChange={handleInputChange}
                            className={styles.fullWidth}
                            autoComplete="billing organization"
                          />
                          <label
                            className={`${styles.inputLabel} ${styles.fullWidth}`}
                          >
                            {t("checkout.address.search")}
                            <div className={styles.addressSearchField}>
                              <span
                                className={styles.addressSearchIcon}
                                aria-hidden="true"
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                >
                                  <circle cx="11" cy="11" r="7" />
                                  <line x1="16.5" y1="16.5" x2="22" y2="22" />
                                </svg>
                              </span>
                              <input
                                name="billingStreetAddress"
                                value={formData.billingStreetAddress}
                                onChange={handleInputChange}
                                required
                                minLength={5}
                                placeholder={t(
                                  "checkout.address.search.placeholder"
                                )}
                                autoComplete="billing address-line1"
                                className={styles.addressInput}
                              />
                            </div>
                          </label>
                          <Input
                            label={t("checkout.apartment")}
                            name="billingApartment"
                            value={formData.billingApartment}
                            onChange={handleInputChange}
                            className={styles.fullWidth}
                            placeholder={t("checkout.apartment.placeholder")}
                            autoComplete="billing address-line2"
                          />
                          <Input
                            label={t("checkout.city")}
                            name="billingCity"
                            value={formData.billingCity}
                            onChange={handleInputChange}
                            required
                            minLength={2}
                            placeholder={t("checkout.city")}
                            autoComplete="billing address-level2"
                          />
                          <label className={styles.inputLabel}>
                            {t("checkout.country")}
                            <div className={styles.selectWrapper}>
                              <CountryDropdown
                                value={formData.billingCountry}
                                onChange={handleBillingCountryChange}
                                whitelist={SUPPORTED_COUNTRIES}
                                className={styles.selectField}
                                defaultOptionLabel={t(
                                  "checkout.country.placeholder"
                                )}
                                valueType="full"
                                name="billingCountry"
                                aria-label={`${t(
                                  "checkout.country"
                                )} (billing)`}
                              />
                            </div>
                          </label>
                          <label className={styles.inputLabel}>
                            {t("checkout.state")}
                            <div className={styles.selectWrapper}>
                              <RegionDropdown
                                country={formData.billingCountry}
                                value={formData.billingState}
                                onChange={handleBillingRegionChange}
                                valueType="short"
                                className={styles.selectField}
                                blankOptionLabel={t(
                                  "checkout.state.placeholder"
                                )}
                                disableWhenEmpty
                                name="billingState"
                                aria-label={`${t("checkout.state")} (billing)`}
                              />
                            </div>
                          </label>
                          <Input
                            label={t("checkout.zip")}
                            name="billingZipCode"
                            value={formData.billingZipCode}
                            onChange={handleInputChange}
                            required
                            pattern="\d{5}(-\d{4})?"
                            placeholder="90001"
                            autoComplete="billing postal-code"
                          />
                          <label className={styles.inputLabel}>
                            {t("checkout.phone")}
                            <div className={styles.phoneInputWrapper}>
                              <CountryPhoneInput
                                value={formData.billingPhone}
                                onChange={(value: string) =>
                                  handlePhoneChange("billingPhone", value)
                                }
                                placeholder={t("checkout.phone.placeholder")}
                                enableSearch
                                inputProps={{
                                  name: "billingPhone",
                                  autoComplete: "billing tel",
                                }}
                              />
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? t("common.loading") : t("checkout.place.order")}
            </button>
            <p className={styles.notice}>{t("checkout.submit.notice")}</p>
          </form>

          <div className={styles.summaryPanel}>
            <h2 className={styles.summaryHeading}>
              {t("checkout.order.summary")}
            </h2>
            <div className={styles.summaryList}>
              {items.length === 0 ? (
                <p className={styles.summaryEmpty}>
                  {t("checkout.empty.cart")}
                  <Link to="/shop">{t("checkout.discover.shop")}</Link>
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div>
                      <p className={styles.summaryProductName}>{item.name}</p>
                      <p className={styles.summaryMeta}>
                        {item.color} | {item.size} | {t("checkout.qty")}{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <p className={styles.summaryPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>{t("cart.subtotal")}</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t("cart.shipping")}</span>
                <span>
                  {shippingCost === 0
                    ? t("cart.complimentary")
                    : formatCurrency(shippingCost)}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t("cart.concierge.service")}</span>
                <span>{t("cart.included")}</span>
              </div>
            </div>

            <div className={styles.totalWrapper}>
              <div className={styles.totalRow}>
                <span>{t("cart.total")}</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <div className={styles.perkCard}>
              <p className={styles.perkTitle}>{t("checkout.concierge.perk")}</p>
              <p className={styles.perkDescription}>
                {t("checkout.concierge.perk.description")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;
