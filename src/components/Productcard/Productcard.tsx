"use client";

import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";
import { useI18n } from "../../context/I18nContext";
import type { ProductCardData } from "../../data/product-card";
import { sampleProductCard } from "../../data/product-card";
import { productCardStyles } from "./Productcard.styles";

export { productCardMocks } from "../../data/product-card";

type ProductCardProps = {
  product?: ProductCardData;
};

export default function ProductCard({ product = sampleProductCard }: ProductCardProps) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const clampedIndex = useMemo(() => Math.min(product.images.length - 1, Math.max(0, index)), [index, product.images]);
  const hasMultipleImages = product.images.length > 1;
  const visibleColors = product.colors.slice(0, 4);
  const extraColorCount = Math.max(product.colors.length - visibleColors.length, 0);

  const goTo = (direction: "next" | "prev") => {
    setIndex((current) => {
      if (direction === "next") {
        return current + 1 >= product.images.length ? 0 : current + 1;
      }
      return current - 1 < 0 ? product.images.length - 1 : current - 1;
    });
  };

  const stars = Array.from({ length: 5 });

  return (
    <article className="product-card">
      <style>{productCardStyles}</style>
      <div className="product-card__gallery">
        {hasMultipleImages ? (
          <button type="button" className="product-card__arrow" aria-label={t("profile.previous.image")} onClick={() => goTo("prev")}>
            <FiChevronLeft size={20} />
          </button>
        ) : null}
        <img
          src={product.images[clampedIndex].url}
          alt={product.images[clampedIndex].alt}
          className="product-card__image"
        />
        {hasMultipleImages ? (
          <button type="button" className="product-card__arrow" aria-label={t("profile.next.image")} onClick={() => goTo("next")}>
            <FiChevronRight size={20} />
          </button>
        ) : null}
        {product.badge ? <span className="product-card__badge">{product.badge}</span> : null}
      </div>

      <div className="product-card__details">
        <h3>{product.brand}</h3>
        <p className="product-card__name">{product.name}</p>
        {product.exclusiveLabel ? <p className="product-card__exclusive">{product.exclusiveLabel}</p> : null}
        <p className="product-card__price">
          <span>{product.price}</span> <strong>{product.savingsLabel}</strong>
        </p>
        <p className="product-card__compare">{product.compareAt}</p>

        <div className="product-card__rating" aria-label={`${product.rating} out of 5 stars`}>
          {stars.map((_, i) => (
            <FiStar key={i} className={`product-card__star${i + 1 <= Math.round(product.rating) ? " is-filled" : ""}`} />
          ))}
          <span className="product-card__reviews">({product.reviews})</span>
        </div>

        <div className="product-card__swatches" role="list">
          {visibleColors.map((color) => (
            <button
              key={color.name}
              type="button"
              className={`product-card__swatch${color.isSelected ? " is-selected" : ""}`}
              style={{ background: color.hex }}
              aria-label={color.name}
            />
          ))}
          {extraColorCount > 0 ? <span className="product-card__swatch-count">+{extraColorCount}</span> : null}
        </div>
      </div>
    </article>
  );
}
