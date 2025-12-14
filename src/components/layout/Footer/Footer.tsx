"use client";

import { FormEvent, useState } from "react";
import { FiClock, FiFacebook, FiInstagram, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useI18n } from "../../../context/I18nContext";
import { useToast } from "../../../context/ToastContext";
import { ApiService } from "../../../services/api";
import styles from "./Footer.module.css";

const mapHref = "https://maps.app.goo.gl/M675ESVRWXjbb9we9";

const contactDetails = [
  { icon: FiMapPin, label: "Location: 236 N Claremont Ave, San Jose, CA 95127, USA", href: mapHref },
  { icon: FiClock, label: "Business Hour: Monday - Sunday 10pm - 6pm (PST)" },
  { icon: FiPhone, label: "1.669.254.7401", href: "tel:+16692547401" },
  { icon: FiMail, label: "henry@timeliteclothing.com", href: "mailto:henry@timeliteclothing.com" },
];

export const Footer = () => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const currentYear = new Date().getFullYear();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields (Name, Email, Message).' });
      showToast('Please fill in all required fields (Name, Email, Message).', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[ContactForm] Sending email request...', { name, email, phone: phone || '(none)', messageLength: message.length });
      const result = await ApiService.submitContactRequest({ name, email, phone, message });
      console.log('[ContactForm] ✅ Email sent successfully!', {
        to: 'henry@timeliteclothing.com',
        from: email,
        name: name,
        messageId: (result as { messageId?: string })?.messageId || 'unknown'
      });

      // Show success popup notification
      showToast('✅ Thank you! Your message has been sent successfully.', 'success', 5000);
      setFeedback({ type: 'success', message: 'Thank you! Your message has been sent successfully.' });

      // Clear form
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('[ContactForm] ❌ Failed to send email:', error);
      showToast('Failed to send message. Please try again or contact us directly.', 'error', 5000);
      setFeedback({ type: 'error', message: 'Failed to send message. Please try again or contact us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <p className={styles.sectionTitle}>Contact Us</p>
          <ul className={styles.contactList}>
            {contactDetails.map(({ icon: Icon, label, href }) => (
              <li key={label} className={styles.contactItem}>
                <Icon className={styles.contactIcon} aria-hidden="true" />
                {href ? (
                  <a href={href}>{label}</a>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={`${styles.column} ${styles.formColumn}`}>
          <p className={styles.sectionTitle}>Contact Timeliteclothing</p>
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <label className={styles.inputField}>
              <span>Name</span>
              <input className={styles.inputControl} type="text" name="name" placeholder="Your name" />
            </label>

            <div className={styles.formGrid}>
              <label className={styles.inputField}>
                <span>Email</span>
                <input className={styles.inputControl} type="email" name="email" placeholder="email@example.com" />
              </label>
              <label className={styles.inputField}>
                <span>Phone number</span>
                <input className={styles.inputControl} type="tel" name="phone" placeholder="+1 (669) ..." />
              </label>
            </div>

            <label className={styles.inputField}>
              <span>Message</span>
              <textarea
                className={`${styles.inputControl} ${styles.textArea}`}
                name="message"
                placeholder="Share your occasion, styling preferences, or sizing questions."
              />
            </label>

            {feedback && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                marginBottom: '10px',
                backgroundColor: feedback.type === 'success' ? '#d4edda' : '#f8d7da',
                color: feedback.type === 'success' ? '#155724' : '#721c24',
                fontSize: '14px'
              }}>
                {feedback.message}
              </div>
            )}

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send request'}
            </button>
          </form>
        </div>
      </div>

      <div className={styles.legal}>
        <p>&copy; 2025 Timeliteclothing. All rights reserved.</p>
        {process.env.NODE_ENV === "development" && (
          <div className={styles.legalLinks}>
            <Link to="/404" style={{ color: "#ff6b6b", fontSize: "0.85rem" }}>
              [Dev] Preview 404
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
};
