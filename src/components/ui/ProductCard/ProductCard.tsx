/* eslint-disable @next/next/no-img-element */
"use client";

import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useState } from "react";
import { Product, categoryLabels } from "../../../data/products";
import { useCart } from "../../../context/CartContext";
import { useI18n } from "../../../context/I18nContext";
import { formatCurrency } from "../../../utils/currency";
import { normalizePossibleMediaUrl } from "../../../config/api";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { t } = useI18n();
  const [selectedColor] = useState(product.colors[0]);
  const [selectedSize] = useState(product.sizes[0]);
  const [imageSrc, setImageSrc] = useState(() => 
    normalizePossibleMediaUrl(product.image) || product.image
  );

  const handleQuickAdd = () => {
    addToCart({
      productId: product.id,
      pid: product.pid,
      name: product.name,
      image: product.image,
      price: product.price,
      color: selectedColor || product.colors[0] || 'Default',
      size: selectedSize || product.sizes[0] || 'M',
      quantity: 1,
    });
  };

  const handleImageError = () => {
    setImageSrc('/images/image_1.png');
  };

  return (
    <article className={`${styles.card} group`}>
      <div className={styles.media}>
        <img
          src={imageSrc}
          alt={product.name}
          className={styles.productImage}
          onError={handleImageError}
        />

        <div className={styles.badges}>
          {product.isNew && <span className={styles.badgeNew}>{t("product.new")}</span>}
          {product.originalPrice && (
            <span className={styles.badgeDiscount}>
              {t("product.save")}{" "}
              {Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) * 100,
              )}
              %
            </span>
          )}
        </div>

        <button aria-label={t("profile.add.to.wishlist")} className={styles.wishlist}>
          <FiHeart className={styles.wishlistIcon} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.contentGroup}>
          <span className={styles.category}>
            {categoryLabels[product.category]}
          </span>
          <Link to={`/product/${product.pid || product.id}`} className={styles.productLink}>
            {product.name}
          </Link>
          <p className={styles.description}>{product.shortDescription}</p>
        </div>

        <div className={styles.footer}>
          <div>
            <div className={styles.priceGroup}>
              <span className={styles.price}>
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            <p className={styles.rating}>
              {product.rating.toFixed(1)} / 5 ({product.reviews})
            </p>
          </div>

          <div className={styles.actions}>
            <Link to={`/product/${product.pid || product.id}`} className={styles.detailsButton}>
              {t("product.details")}
            </Link>
            <button onClick={handleQuickAdd} className={styles.addButton}>
              <FiShoppingCart className={styles.cartIcon} />
              <span className={styles.addButtonText}>{t("product.add")}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
