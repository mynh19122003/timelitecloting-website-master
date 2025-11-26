"use client";

import { FormEvent } from "react";
import { FiClock, FiFacebook, FiInstagram, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useI18n } from "../../../context/I18nContext";
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
  const currentYear = new Date().getFullYear();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

            <button type="submit" className={styles.submitButton}>
              Send request
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
