export const footerStyles = /* css */ `
.footer {
  background: #fdf8f1;
  padding: 3rem clamp(1.5rem, 6vw, 5rem) 2rem;
  color: #1f1f1f;
  font-family: var(--font-geist-sans, "Inter", system-ui, -apple-system, BlinkMacSystemFont);
  border-top: 1px solid #f0e6d9;
}

.footer__content {
  display: grid;
  grid-template-columns: 2fr 1fr 1.2fr;
  gap: 2rem;
  align-items: flex-start;
}

.footer__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.4em;
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.footer__description {
  margin: 0;
  color: #7a6f64;
  max-width: 420px;
  line-height: 1.5;
}

.footer__social {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.footer__social button {
  width: 40px;
  height: 40px;
  border: 1px solid #dcd2c2;
  border-radius: 999px;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #3c3a36;
}

.footer__heading {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.75rem;
  margin: 0 0 1rem;
  color: #6f675a;
}

.footer__links nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer__links a,
.footer__link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
}

.footer__contact-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer__contact-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin: 0;
  color: #5f564c;
  line-height: 1.4;
}

.footer__contact-item svg {
  margin-top: 0.2rem;
}

.footer__contact-item span {
  white-space: pre-line;
}

.footer__note {
  margin-top: 1rem;
  color: #9a9186;
  font-size: 0.9rem;
}

.footer__legal {
  margin-top: 2.5rem;
  text-align: center;
  color: #8c8276;
  letter-spacing: 0.15em;
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .footer__content {
    grid-template-columns: 1fr;
  }

  .footer__description {
    max-width: none;
  }
}
`;
