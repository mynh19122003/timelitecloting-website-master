"use client";

import Link from "next/link";
import { FiFacebook, FiInstagram, FiLinkedin, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { footerStyles } from "./Footer..styles";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/suiting" },
  { label: "Contact", href: "/contact" },
];

const contactDetails = [
  {
    icon: FiMapPin,
    label: "236 N Claremont Ave\nSan Jose, CA 95127",
  },
  {
    icon: FiPhone,
    label: "669.254.7401",
  },
  {
    icon: FiMail,
    label: "tim19092016@gmail.com",
  },
];

const socialLinks = [
  { icon: FiInstagram, label: "Instagram" },
  { icon: FiFacebook, label: "Facebook" },
  { icon: FiLinkedin, label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="footer">
      <style jsx global>{footerStyles}</style>
      <div className="footer__content">
        <section className="footer__about">
          <p className="footer__eyebrow">Timelite Couture</p>
          <p className="footer__description">
            Crafted in Saigon, curated for modern women across the United States. Timelite celebrates the artistry of
            the ao dai with a contemporary point of view.
          </p>
          <div className="footer__social" role="list">
            {socialLinks.map(({ icon: Icon, label }) => (
              <button key={label} type="button" aria-label={label}>
                <Icon size={18} />
              </button>
            ))}
          </div>
        </section>

        <section className="footer__links">
          <p className="footer__heading">Links</p>
          <nav aria-label="Footer links">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="footer__link">
                {link.label}
              </Link>
            ))}
          </nav>
        </section>

        <section className="footer__contact">
          <p className="footer__heading">Contact Us</p>
          <div className="footer__contact-items">
            {contactDetails.map(({ icon: Icon, label }) => (
              <p key={label} className="footer__contact-item">
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </p>
            ))}
          </div>
          <p className="footer__note">Tax ID: 95127</p>
        </section>
      </div>
      <p className="footer__legal">© 2025 Timelite Couture | All rights reserved</p>
    </footer>
  );
}
