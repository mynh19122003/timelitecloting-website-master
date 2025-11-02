"use client";

import {
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.column}>
          <p className={styles.brand}>Timelite Couture</p>
          <p className={styles.bodyText}>
            Crafted in Saigon, curated for modern women across the United States. Timelite celebrates the
            artistry of the ao dai with a contemporary point of view.
          </p>
          <div className={styles.socialRow}>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className={styles.socialButton}
            >
              <FiInstagram className={styles.icon} />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className={styles.socialButton}
            >
              <FiFacebook className={styles.icon} />
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className={styles.socialButton}
            >
              <FiLinkedin className={styles.icon} />
            </a>
          </div>
        </div>

        <div className={`${styles.column} ${styles.columnCentered}`}>
          <p className={styles.sectionTitle}>Links</p>
          <ul className={`${styles.linkList} ${styles.linkListCentered}`}>
            <li>
              <Link to="/" className={styles.link}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/shop" className={styles.link}>
                Shop
              </Link>
            </li>
            <li>
              <Link to="/contact" className={styles.link}>
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.column}>
          <p className={styles.sectionTitle}>Contact Us</p>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <FiMapPin className={styles.contactIcon} />
              <span>
                236 N Claremont Ave<br />
                San Jose, CA 95127
              </span>
            </li>
            <li className={styles.contactItem}>
              <FiPhone className={styles.contactIcon} />
              <a href="tel:+16692547401" className={styles.link}>
                669.254.7401
              </a>
            </li>
            <li className={styles.contactItem}>
              <FiMail className={styles.contactIcon} />
              <a href="mailto:tim19092016@gmail.com" className={styles.link}>
                tim19092016@gmail.com
              </a>
            </li>
            <li className={styles.taxInfo}>
              Tax ID: 95127
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.legal}>
        <p className={styles.legalText}>
          © {currentYear} Timelite Couture | All Rights Reserved
        </p>
      </div>
    </footer>
  );
};
