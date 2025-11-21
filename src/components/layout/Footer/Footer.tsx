"use client";

import { FiFacebook, FiInstagram, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useI18n } from "../../../context/I18nContext";
import styles from "./Footer.module.css";

export const Footer = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <p className={styles.brand}>Timelite</p>
          <p className={styles.bodyText}>
            Modern Vietnamese fashion curated for global shoppers. Shop online with international
            shipping or visit our U.S. showrooms for personalized styling.
          </p>
          <div className={styles.socialRow}>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label={t("profile.instagram")}>
              <FiInstagram />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label={t("profile.facebook")}>
              <FiFacebook />
            </a>
          </div>
        </div>

        <div className={styles.column}>
          <p className={styles.sectionTitle}>Customer Service</p>
          <Link to="/contact">Help & FAQs</Link>
          <Link to="/profile?tab=orders">Order Tracking</Link>
          <Link to="/contact">Shipping & Delivery</Link>
          <Link to="/contact">Returns</Link>
          <Link to="/contact">Contact Us</Link>
        </div>

        <div className={styles.column}>
          <p className={styles.sectionTitle}>Our Stores</p>
          <Link to="/contact">Find a Store</Link>
          <Link to="/contact">Tell Us What You Think</Link>
          <Link to="/about">Timelite Backstage</Link>
          <Link to="/contact">Personal Stylist</Link>
        </div>

        <div className={styles.column}>
          <p className={styles.sectionTitle}>Connect With Us</p>
          <div className={styles.contactRow}>
            <FiMapPin />
            <span>151 W 34th St, New York, NY 10001</span>
          </div>
          <div className={styles.contactRow}>
            <FiPhone />
            <a href="tel:+16692547401">669.254.7401</a>
          </div>
          <div className={styles.contactRow}>
            <FiMail />
            <a href="mailto:tim19092016@gmail.com">tim19092016@gmail.com</a>
          </div>
        </div>
      </div>

      <div className={styles.legal}>
        <p>© {currentYear} Timelite. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link to="/about">Privacy Notice</Link>
          <Link to="/about">Terms & Conditions</Link>
          <Link to="/contact">Accessibility</Link>
          {process.env.NODE_ENV === "development" && (
            <Link to="/404" style={{ color: "#ff6b6b", fontSize: "0.85rem" }}>
              [Dev] Preview 404
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};
