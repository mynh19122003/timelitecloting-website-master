import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
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

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

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

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as FormData['paymentMethod'] }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate cart has items
    if (items.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }
      
      // Phone validation (US format)
      const phoneRegex = /^[\d\s()+-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('Please enter a valid phone number (at least 10 digits).');
        setIsSubmitting(false);
        return;
      }
      
      // Address validation
      if (!formData.streetAddress.trim() || formData.streetAddress.length < 5) {
        setError('Please enter a valid street address.');
        setIsSubmitting(false);
        return;
      }
      
      if (!formData.city.trim() || formData.city.length < 2) {
        setError('Please enter a valid city name.');
        setIsSubmitting(false);
        return;
      }
      
      // State validation (2 letter US state code)
      const stateRegex = /^[A-Z]{2}$/i;
      if (!stateRegex.test(formData.state)) {
        setError('Please enter a valid 2-letter state code (e.g., CA, NY, TX).');
        setIsSubmitting(false);
        return;
      }
      
      // ZIP code validation (5 digits or 5+4 format)
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(formData.zipCode)) {
        setError('Please enter a valid ZIP code (e.g., 12345 or 12345-6789).');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare order data for backend
      const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim();
      
      // Build items with products_id (PID) or product_slug fallback
      type OrderItemPayload = {
        quantity: number;
        color: string;
        size: string;
        products_id?: string | number;
        product_slug?: string;
      };

      const orderData = {
        firstname: formData.firstName,
        lastname: formData.lastName,
        address: fullAddress,
        phonenumber: formData.phone,
        payment_method: formData.paymentMethod,
        items: items.map<OrderItemPayload>(item => {
          const base: OrderItemPayload = {
            quantity: item.quantity,
            color: item.color,
            size: item.size
          };
          
          // Use pid (products_id) from cart item if available
          if (item.pid) {
            return { products_id: item.pid, ...base };
          }
          
          // Fallback: use product_slug so backend can resolve
          return { product_slug: item.productId, ...base };
        }),
        total_amount: total,
        notes: formData.notes || ''
      };

      // 🔍 DEBUG: Log complete order data being sent to API
      console.log('📦 Order Data to be sent:');
      console.log(JSON.stringify(orderData, null, 2));
      console.log('======================');

      // Create order via API
      const response = await ApiService.createOrder(orderData);
      
      // 🔍 DEBUG: Log API response
      console.log('✅ API Response:', response);
      
      // Show success toast
      showToast(
        `Order #${response.order_id || response.id || 'placed'} created successfully! Our concierge team will contact you within 24 hours.`,
        'success'
      );
      
      // Clear cart on success
      clearCart();
      
      // Navigate to order history
      navigate('/profile?tab=orders');
      
    } catch (err: unknown) {
      console.error('Order creation failed:', err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: unknown }).message)
          : 'Failed to place order. Please try again or contact support.';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.eyebrow}>Checkout</span>
            <h1 className={styles.heading}>Concierge checkout details</h1>
            <p className={styles.description}>
              Our concierge team will reach out within 24 hours to confirm your fitting schedule,
              delivery preferences, and styling support anywhere in the United States.
            </p>
          </div>

          <Link to="/cart" className={styles.linkUnderline}>
            Return to cart
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
            Loading your profile information...
          </div>
        )}

        <div className={styles.grid}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div>
              <h2 className={styles.sectionTitle}>Client information</h2>
              <div className={styles.fieldGrid}>
                <Input 
                  label="First name" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder="John"
                />
                <Input 
                  label="Last name"
                  name="lastName" 
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder="Doe"
                />
                <Input 
                  label="Email" 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john.doe@example.com"
                />
                <Input 
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  minLength={10}
                  placeholder="(555) 123-4567"
                />
                <Input 
                  label="Company (optional)"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <h2 className={styles.sectionTitle}>Shipping address (U.S.)</h2>
              <div className={styles.fieldGrid}>
                <Input 
                  label="Street address" 
                  className={styles.fullWidth}
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  required
                  minLength={5}
                  placeholder="123 Main Street"
                />
                <Input 
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  placeholder="Los Angeles"
                />
                <Input 
                  label="State"
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
                  label="ZIP code"
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
              <h2 className={styles.sectionTitle}>Notes for your stylist</h2>
              <div className={styles.notesWrapper}>
                <textarea
                  rows={6}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Share your event date, venue, moodboard inspiration, or special requests."
                  className={styles.textArea}
                />
              </div>
            </div>

            <div>
              <h2 className={styles.sectionTitle}>Payment method</h2>
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
                      <p className={styles.paymentTitle}>Bank Transfer</p>
                      <p className={styles.paymentDesc}>Secure bank transfer payment</p>
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
                      <p className={styles.paymentTitle}>Cash on Delivery</p>
                      <p className={styles.paymentDesc}>Pay when you receive</p>
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
              {isSubmitting ? 'Placing order...' : 'Place order'}
            </button>
            <p className={styles.notice}>
              Submitting this form authorizes Timelite to confirm your order, coordinate fittings, and send
              updates about production milestones.
            </p>
          </form>

          <div className={styles.summaryPanel}>
            <h2 className={styles.summaryHeading}>Your order</h2>
            <div className={styles.summaryList}>
              {items.length === 0 ? (
                <p className={styles.summaryEmpty}>
                  You have not added any items yet. <Link to="/shop">Discover the shop.</Link>
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <div>
                      <p className={styles.summaryProductName}>{item.name}</p>
                      <p className={styles.summaryMeta}>
                        {item.color} | {item.size} | Qty {item.quantity}
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
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Stylist service</span>
                <span>Included</span>
              </div>
            </div>

            <div className={styles.totalWrapper}>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className={styles.perkCard}>
              <p className={styles.perkTitle}>Concierge perk</p>
              <p className={styles.perkDescription}>
                Every order unlocks 24/7 access to our stylist team, including one complimentary virtual
                styling session to prepare for your occasion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

    export default CheckoutPage;

