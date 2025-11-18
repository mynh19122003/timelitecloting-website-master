"use client";

import { FiStar } from "react-icons/fi";
import { Header } from "../Header/header";
import { shopNavMenu } from "../Shop/shop.data";
import { productDetailStyles } from "./ProductDetail.styles";

const navMenu = shopNavMenu;

const galleryImages = [
  "https://images.macysassets.com/is/image/MCY/products/3/optimized/21522093_web.jpg?wid=900&qlt=90",
  "https://images.macysassets.com/is/image/MCY/products/3/optimized/21522093_alt1.jpg?wid=900&qlt=90",
  "https://images.macysassets.com/is/image/MCY/products/3/optimized/21522093_alt2.jpg?wid=900&qlt=90",
  "https://images.macysassets.com/is/image/MCY/products/3/optimized/21522093_alt3.jpg?wid=900&qlt=90",
  "https://images.macysassets.com/is/image/MCY/products/3/optimized/21522093_alt4.jpg?wid=900&qlt=90",
];

export default function ProductDetail() {
  const primaryCategory = shopNavMenu[0];
  const primaryLabel = primaryCategory?.label ?? "Ao Dai";
  const subLabel = primaryCategory?.columns?.[0]?.links?.[0] ?? "Heritage Classics";
  const breadcrumbTrail = ["Home", primaryLabel, subLabel];

  return (
    <>
      <Header navMenu={navMenu} />
      <div className="product-detail">
        <style>{productDetailStyles}</style>

        <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
          {breadcrumbTrail.map((label, index) => {
            const isLast = index === breadcrumbTrail.length - 1;
            return (
              <span key={`${label}-${index}`} className="product-detail__breadcrumb-item">
                <button type="button" className={isLast ? "is-active" : ""}>
                  {label}
                </button>
                {!isLast ? <span aria-hidden="true">/</span> : null}
              </span>
            );
          })}
        </nav>

        <div className="product-detail__content">
          <section className="product-detail__gallery">
            <div className="product-detail__thumbs" role="list">
              {galleryImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`product-detail__thumb${index === 0 ? " is-active" : ""}`}
                >
                  <img src={image} alt={`Gallery thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
            <div className="product-detail__main-image">
              <img src={galleryImages[0]} alt="Anne Klein blazer" />
            </div>
          </section>

          <section className="product-detail__info">
            <header>
              <p className="product-detail__brand">Anne Klein</p>
              <h1 className="product-detail__title">Women&apos;s Triple-Pocket Open-Front Blazer</h1>
              <div className="product-detail__rating">
                <FiStar className="is-filled" />
                <FiStar className="is-filled" />
                <FiStar className="is-filled" />
                <FiStar className="is-filled" />
                <FiStar />
                <button type="button" className="product-detail__rating-count">
                  4.7 (6)
                </button>
              </div>
            </header>

            <div className="product-detail__badge">
              <span>Black Friday Deal</span>
              <button type="button">Details</button>
            </div>

            <div className="product-detail__pricing">
              <div>
                <p className="product-detail__price">$357.19</p>
                <p className="product-detail__savings">(40% off)</p>
              </div>
              <p className="product-detail__compare">$597.89</p>
            </div>

            <div className="product-detail__options">
              <div className="product-detail__option">
                <p className="product-detail__option-label">Color</p>
                <strong>Titan Red</strong>
              </div>

              <div className="product-detail__option">
                <p className="product-detail__option-label">Size</p>
                <div className="product-detail__sizes">
                  {["XXS", "XS", "S", "M", "L", "XL"].map((size) => (
                    <button key={size} type="button" className="product-detail__size">
                      {size}
                    </button>
                  ))}
                </div>
                <button type="button" className="product-detail__size-chart">
                  Size chart
                </button>
              </div>
            </div>

            <button type="button" className="product-detail__cta">
              Add To Bag
            </button>
            <p className="product-detail__stats">732 Customers Purchased</p>
          </section>
        </div>
      </div>
    </>
  );
}
