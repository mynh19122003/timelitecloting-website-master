import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../context/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { ApiService } from "../../services/api";
import { getUserData } from "../../utils/auth";
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
};

const Input = ({ label, type = "text", className, name, value, onChange, required = false, pattern, minLength, maxLength, placeholder }: InputProps) => (
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
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  paymentMethod: 'cod' | 'bank_transfer' | 'card';
}

export const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
    paymentMethod: 'cod'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      // If authenticated → fetch live profile
      // If not authenticated → try local cached user to prefill
      const hasToken = ApiService.isAuthenticated();

      try {
        const profile = hasToken ? await ApiService.getProfile() : getUserData();
        
        // Parse name into first/last name
        const nameParts = ((profile && profile.name) || '').trim().split(' ').filter(Boolean);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Parse address into components
        const rawAddress = (profile && profile.address) || '';
        const addressParts = rawAddress.split(',').map(s => s.trim());
        let streetAddress = addressParts[0] || '';
        const city = addressParts[1] || '';
        let state = '';
        let zipCode = '';
        if (addressParts.length >= 3) {
          const stateZip = addressParts[2] || '';
          const stateZipMatch = stateZip.match(/^([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/i);
          state = stateZipMatch ? stateZipMatch[1].toUpperCase() : '';
          zipCode = stateZipMatch ? stateZipMatch[2] : '';
        } else if (rawAddress && (!streetAddress || !city)) {
          // Fallback: if cannot parse, put full address into streetAddress
          streetAddress = rawAddress;
        }

        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          email: (profile && profile.email) || prev.email,
          phone: (profile && profile.phone) || prev.phone,
          streetAddress: streetAddress || prev.streetAddress,
          city: city || prev.city,
          state: state || prev.state,
          zipCode: zipCode || prev.zipCode,
        }));
      } catch (err: unknown) {
        console.error('Failed to load profile:', err);
        // Don't show error to user - they can still fill the form manually
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let sanitizedValue = value;
    
    // Auto-format and sanitize based on field type
    if (name === 'state') {
      // Auto uppercase state code and limit to 2 chars
      sanitizedValue = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
    } else if (name === 'zipCode') {
      // Only allow digits and hyphen for ZIP
      sanitizedValue = value.replace(/[^\d-]/g, '').slice(0, 10);
    } else if (name === 'phone') {
      // Allow digits, spaces, parentheses, plus, hyphen
      sanitizedValue = value.replace(/[^\d\s()+-]/g, '');
    } else if (name === 'firstName' || name === 'lastName' || name === 'city') {
      // Prevent numbers and special chars in names
      sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    } else if (name === 'email') {
      // No spaces in email
      sanitizedValue = value.replace(/\s/g, '').toLowerCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as FormData['paymentMethod'] }));
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
      
      // Phone validation (US format)
      const phoneRegex = /^[\d\s()+-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
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
      
      // State validation (2 letter US state code)
      const stateRegex = /^[A-Z]{2}$/i;
      if (!stateRegex.test(formData.state)) {
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
      const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();
      
      // 🔍 DEBUG: Log raw cart items first
      console.log('🛒 ========== CART ITEMS DEBUG ==========');
      console.log('Total items in cart:', items.length);
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
          fullItem: item
        });
      });
      console.log('=========================================\n');
      
      // Build items with products_id (PID) or product_slug fallback
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
          name: item.name
        });

        // Validate required fields
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Item #${index + 1} (${item.name}) has invalid quantity: ${item.quantity}`);
        }

        if (!item.color || !item.size) {
          throw new Error(`Item #${index + 1} (${item.name}) is missing color or size`);
        }

        const base: OrderItemPayload = {
          quantity: item.quantity,
          color: item.color,
          size: item.size
        };
        
        // Priority 1: Use pid (products_id) from cart item if available
        if (item.pid && item.pid.trim() !== '') {
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
          if (item.productId.trim() !== '') {
            const result = { product_slug: item.productId, ...base };
            console.log(`  ✅ Using product_slug: ${item.productId}`, result);
            return result;
          }
        }
        
        // If we get here, the item has no valid identifier
        const errorMsg = `Item #${index + 1} (${item.name}) has no valid product identifier. productId: "${item.productId}", pid: "${item.pid}"`;
        console.error(`  ❌ ${errorMsg}`);
        throw new Error(errorMsg);
      });

      console.log('\n📋 Final mapped items:', JSON.stringify(mappedItems, null, 2));
      
      // Final validation: ensure all items have at least one identifier
      mappedItems.forEach((item, index) => {
        const hasProductId = !!item.product_id;
        const hasProductsId = !!item.products_id;
        const hasProductSlug = !!item.product_slug;
        
        if (!hasProductId && !hasProductsId && !hasProductSlug) {
          throw new Error(`Mapped item #${index + 1} is missing all product identifiers: ${JSON.stringify(item)}`);
        }
        
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Mapped item #${index + 1} has invalid quantity: ${item.quantity}`);
        }
      });

      const orderData = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        address: fullAddress,
        phonenumber: formData.phone,
        payment_method: formData.paymentMethod,
        items: mappedItems,
        total_amount: total,
        notes: formData.notes || ''
      };

      // 🔍 DEBUG: Log complete order data being sent to API
      console.log('\n📦 ========== ORDER DATA TO BE SENT ==========');
      console.log(JSON.stringify(orderData, null, 2));
      console.log('=============================================\n');

      // Create order via API
      const response = await ApiService.createOrder(orderData) as { order_id?: string; id?: string | number };
      
      // 🔍 DEBUG: Log API response
      console.log('✅ API Response:', response);
      
      // Show success toast
      const orderId = response.order_id || response.id || 'placed';
      showToast(
        t("checkout.order.success").replace("{orderId}", String(orderId)),
        'success'
      );
      
      // Clear cart on success
      clearCart();
      
      // Navigate to order history
      navigate('/profile?tab=orders');
      
    } catch (err: unknown) {
      console.error('❌ Order creation failed:', err);
      console.error('Error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : undefined,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        fullError: err
      });
      
      // Extract error message from various error formats
      let message = t("checkout.order.failed");
      
      if (err instanceof Error) {
        message = err.message || message;
      } else if (typeof err === 'object' && err !== null) {
        // Check for ApiError format
        if ('message' in err) {
          message = String((err as { message?: unknown }).message) || message;
        } else if ('error' in err) {
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
        <div className={styles.headerRow}>
          <div>
            <span className={styles.eyebrow}>{t("checkout.eyebrow")}</span>
            <h1 className={styles.heading}>{t("checkout.heading")}</h1>
            <p className={styles.description}>
              {t("checkout.description")}
            </p>
          </div>

          <Link to="/cart" className={styles.linkUnderline}>
            {t("checkout.return.to.cart")}
          </Link>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00'
          }}>
            {error}
          </div>
        )}

        {isLoadingProfile && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#f0f8ff',
            border: '1px solid #b0d4f1',
            borderRadius: '4px',
            color: '#1e5a8e'
          }}>
            {t("checkout.loading.profile")}
          </div>
        )}

        <div className={styles.grid}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <h2 className={styles.sectionTitle}>{t("checkout.client.info")}</h2>
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
                />
                <Input 
                  label={t("checkout.email")} 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder={t("checkout.email")}
                />
                <Input 
                  label={t("checkout.phone")}
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  minLength={10}
                  placeholder="(555) 123-4567"
                />
                <Input 
                  label={t("checkout.company")}
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <h2 className={styles.sectionTitle}>{t("checkout.shipping.address")}</h2>
              <div className={styles.fieldGrid}>
                <Input 
                  label={t("checkout.address")} 
                  className={styles.fullWidth}
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  required
                  minLength={5}
                  placeholder={t("checkout.address")}
                />
                <Input 
                  label={t("checkout.city")}
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  placeholder={t("checkout.city")}
                />
                <Input 
                  label={t("checkout.state")}
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  pattern="[A-Z]{2}"
                  minLength={2}
                  maxLength={2}
                  placeholder="CA"
                />
                <Input 
                  label={t("checkout.zip")}
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                  pattern="\d{5}(-\d{4})?"
                  placeholder="90001"
                />
              </div>
            </div>

            <div>
              <h2 className={styles.sectionTitle}>{t("checkout.notes.stylist")}</h2>
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
              <h2 className={styles.sectionTitle}>{t("checkout.payment.method")}</h2>
              <div className={styles.paymentMethods}>
                <label className={`${styles.paymentOption} ${formData.paymentMethod === 'bank_transfer' ? styles.paymentOptionActive : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleSelectChange}
                    className={styles.paymentRadio}
                    required
                  />
                  <div className={styles.paymentContent}>
                    <div className={styles.paymentIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="6" width="18" height="12" rx="2"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.paymentTitle}>{t("checkout.payment.bank")}</p>
                      <p className={styles.paymentDesc}>{t("checkout.payment.bank")}</p>
                    </div>
                  </div>
                </label>

                <label className={`${styles.paymentOption} ${formData.paymentMethod === 'cod' ? styles.paymentOptionActive : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleSelectChange}
                    className={styles.paymentRadio}
                  />
                  <div className={styles.paymentContent}>
                    <div className={styles.paymentIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div>
                      <p className={styles.paymentTitle}>{t("checkout.payment.cod")}</p>
                      <p className={styles.paymentDesc}>{t("checkout.payment.cod")}</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting || items.length === 0}
            >
              {isSubmitting ? t("common.loading") : t("checkout.place.order")}
            </button>
            <p className={styles.notice}>
              {t("checkout.submit.notice")}
            </p>
          </form>

          <div className={styles.summaryPanel}>
            <h2 className={styles.summaryHeading}>{t("checkout.order.summary")}</h2>
            <div className={styles.summaryList}>
              {items.length === 0 ? (
                <p className={styles.summaryEmpty}>
                  {t("checkout.empty.cart")}<Link to="/shop">{t("checkout.discover.shop")}</Link>
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div>
                      <p className={styles.summaryProductName}>{item.name}</p>
                      <p className={styles.summaryMeta}>
                        {item.color} | {item.size} | {t("checkout.qty")} {item.quantity}
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
                <span>{t("cart.complimentary")}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t("cart.concierge.service")}</span>
                <span>{t("cart.included")}</span>
              </div>
            </div>

            <div className={styles.totalWrapper}>
              <div className={styles.totalRow}>
                <span>{t("cart.total")}</span>
                <span>{formatCurrency(total)}</span>
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

