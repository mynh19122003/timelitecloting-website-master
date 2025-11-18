export const productCardStyles = /* css */ `
.product-card {
  width: 100%;
  background: #fff;
  border: 1px solid #e4e2dd;
  border-radius: 18px;
  overflow: hidden;
  font-family: var(--font-geist-sans, "Inter", system-ui, -apple-system, BlinkMacSystemFont);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1.5rem;
  height: 100%;
}

.product-card__gallery {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #f7f4f1;
}

.product-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-card__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1f1f1f;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.product-card__arrow:first-of-type {
  left: 0.85rem;
}

.product-card__arrow:last-of-type {
  right: 0.85rem;
}

.product-card__badge {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  background: #111;
  color: #fff;
  padding: 0.3rem 0.85rem;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 6px;
}

.product-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0 1.5rem;
}

.product-card__details h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.product-card__name {
  margin: 0;
  color: #3a3a3a;
  font-weight: 500;
}

.product-card__exclusive {
  margin: 0;
  color: #8b8179;
  font-size: 0.9rem;
}

.product-card__price {
  margin: 0.25rem 0 0;
  color: #ba1415;
  font-weight: 700;
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.product-card__price strong {
  font-weight: 600;
  font-size: 0.9rem;
}

.product-card__compare {
  margin: 0;
  color: #6d6d6d;
  text-decoration: line-through;
  font-size: 0.95rem;
}

.product-card__rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #1f1f1f;
}

.product-card__star {
  color: #d3cfc9;
}

.product-card__star.is-filled {
  color: #ffad33;
}

.product-card__reviews {
  color: #6a6a6a;
  font-size: 0.9rem;
}

.product-card__swatches {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.product-card__swatch {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  padding: 0;
  cursor: pointer;
}

.product-card__swatch.is-selected {
  border-color: #111;
}

.product-card__swatch-count {
  font-size: 0.9rem;
  color: #4f4b46;
  font-weight: 600;
}
`;
