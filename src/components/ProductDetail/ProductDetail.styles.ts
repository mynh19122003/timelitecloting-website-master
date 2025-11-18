export const productDetailStyles = /* css */ `
.product-detail {
  padding: 2rem clamp(1.5rem, 5vw, 4rem) 4rem;
  background: #fff;
  color: #1f1f1f;
  font-family: var(--font-geist-sans, "Inter", system-ui, -apple-system, BlinkMacSystemFont);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.product-detail__breadcrumb {
  display: flex;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #6d6d6d;
  flex-wrap: wrap;
}

.product-detail__breadcrumb-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.product-detail__breadcrumb button {
  border: none;
  background: none;
  padding: 0;
  color: inherit;
  font-weight: 600;
  cursor: pointer;
}

.product-detail__breadcrumb button.is-active {
  color: #1f1f1f;
  font-weight: 700;
}

.product-detail__content {
  display: grid;
  grid-template-columns: 2fr 1.4fr;
  gap: 2.5rem;
}

.product-detail__gallery {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
}

.product-detail__thumbs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-detail__thumb {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  width: 70px;
  height: 100px;
  background: #f8f5f2;
  cursor: pointer;
}

.product-detail__thumb.is-active {
  border-color: #111;
}

.product-detail__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-detail__main-image {
  position: relative;
  background: #faf7f5;
  border-radius: 24px;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-detail__main-image img {
  width: 100%;
  border-radius: 24px;
}

.product-detail__info {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.product-detail__brand {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #6a6a6a;
  font-size: 0.85rem;
}

.product-detail__title {
  margin: 0.25rem 0;
  font-size: 1.8rem;
}

.product-detail__rating {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.product-detail__rating svg {
  color: #dcd7cf;
}

.product-detail__rating svg.is-filled {
  color: #f5a623;
}

.product-detail__rating-count {
  border: none;
  background: none;
  padding: 0;
  color: #6d6d6d;
  margin-left: 0.25rem;
  cursor: pointer;
}

.product-detail__badge {
  border: 1px solid #d9d5cf;
  border-radius: 16px;
  padding: 0.6rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 320px;
}

.product-detail__badge span {
  background: #111;
  color: #fff;
  padding: 0.2rem 0.9rem;
  font-weight: 600;
}

.product-detail__badge button {
  border: none;
  background: none;
  padding: 0;
  font-weight: 600;
  cursor: pointer;
}

.product-detail__pricing {
  display: flex;
  align-items: baseline;
  gap: 1rem;
}

.product-detail__price {
  font-size: 2rem;
  color: #b01812;
  margin: 0;
}

.product-detail__savings {
  color: #b01812;
  font-weight: 600;
}

.product-detail__compare {
  text-decoration: line-through;
  color: #8a837a;
}

.product-detail__option-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  color: #8a837a;
  margin-bottom: 0.2rem;
}

.product-detail__sizes {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0.5rem 0;
}

.product-detail__size {
  min-width: 52px;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #ccc5bb;
  background: #fff;
  cursor: pointer;
}

.product-detail__size-chart {
  border: none;
  background: none;
  color: #6a6a6a;
  font-size: 0.9rem;
  cursor: pointer;
}

.product-detail__cta {
  border: none;
  background: #943423;
  color: #fff;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
}

.product-detail__stats {
  color: #7a746e;
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .product-detail__content {
    grid-template-columns: 1fr;
  }

  .product-detail__gallery {
    grid-template-columns: 1fr;
  }

  .product-detail__thumbs {
    flex-direction: row;
  }

  .product-detail__thumb {
    width: 60px;
    height: 90px;
  }
}
`;
