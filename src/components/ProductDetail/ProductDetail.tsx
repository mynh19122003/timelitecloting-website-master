"use client";

import { useEffect, useState } from "react";
import { FiStar, FiHeart, FiCheck } from "react-icons/fi";
import { Navbar } from "../layout/Navbar/Navbar";
import { productDetailStyles } from "./ProductDetail.styles";
import { ApiService } from "../../services/api";
import { useI18n } from "../../context/I18nContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../utils/currency";
import { normalizePossibleMediaUrl, getAdminMediaUrl } from "../../config/api";
import { shopNavMenu } from "../Shop/shop.data";

type ProductDetailProps = {
  slug?: string;
};

type ApiProductDetail = {
  id?: number | string;
  products_id?: string | number;
  name?: string;
  description?: string;
  short_description?: string;
  price?: number | string;
  original_price?: number | string | null;
  image_url?: string;
  gallery?: string[];
  category?: string;
  rating?: number | string;
  reviews?: number | string;
  colors?: string[] | string;
  sizes?: string[] | string;
  variant?: string;
  is_new?: boolean;
};

export default function ProductDetail({ slug }: ProductDetailProps) {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await ApiService.getProduct(slug);
        // The API might return { success: true, data: ... } or just the data
        const productData = (data as any).data || data;
        setProduct(productData);

        // Set initial image
        const mainImage = normalizePossibleMediaUrl(productData.image_url) || getAdminMediaUrl(String(productData.products_id));
        setSelectedImage(mainImage || "/images/image_1.png");

      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="product-detail" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Loading product...</p>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="product-detail" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>{error || "Product not found"}</p>
        </div>
      </>
    );
  }

  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0
    ? product.gallery.map(g => normalizePossibleMediaUrl(g) || g)
    : [selectedImage];

  // Ensure main image is in gallery if gallery is empty
  if (gallery.length === 0 && selectedImage) {
    gallery.push(selectedImage);
  }

  const sizes = Array.isArray(product.sizes) ? product.sizes : ["S", "M", "L", "XL"];
  const price = Number(product.price || 0);
  const originalPrice = product.original_price ? Number(product.original_price) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!selectedSize && sizes.length > 0) {
      alert(t("product.select.size") || "Please select a size");
      return;
    }

    addToCart({
      productId: String(product.id || product.products_id),
      pid: product.products_id ? String(product.products_id) : undefined,
      name: product.name || "Product",
      price: price,
      image: selectedImage,
      quantity: quantity,
      size: selectedSize,
      color: Array.isArray(product.colors) ? product.colors[0] : "Default"
    });
  };

  // Breadcrumb logic
  const categorySlug = product.category ? product.category.toLowerCase() : "all";
  const categoryLabel = shopNavMenu.find(item => item.categorySlug === categorySlug)?.label || "Shop";

  return (
    <>
      <Navbar />
      <div className="product-detail">
        <style>{productDetailStyles}</style>

        <nav className="product-detail__breadcrumb" aria-label="Breadcrumb">
          <span className="product-detail__breadcrumb-item">
            <button type="button" onClick={() => window.location.href = "/"}>{t("shop.home")}</button>
            <span aria-hidden="true">/</span>
          </span>
          <span className="product-detail__breadcrumb-item">
            <button type="button" onClick={() => window.location.href = "/shop"}>{categoryLabel}</button>
            <span aria-hidden="true">/</span>
          </span>
          <span className="product-detail__breadcrumb-item">
            <button type="button" className="is-active">{product.name}</button>
          </span>
        </nav>

        <div className="product-detail__content">
          <section className="product-detail__gallery">
            <div className="product-detail__thumbs" role="list">
              {gallery.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  className={`product-detail__thumb${image === selectedImage ? " is-active" : ""}`}
                  onClick={() => setSelectedImage(image)}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
            <div className="product-detail__main-image">
              <img src={selectedImage} alt={product.name} />
            </div>
          </section>

          <section className="product-detail__info">
            <header>
              <p className="product-detail__brand">Timelite</p>
              <h1 className="product-detail__title">{product.name}</h1>
              <div className="product-detail__rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className={star <= Number(product.rating || 5) ? "is-filled" : ""} />
                ))}
                <button type="button" className="product-detail__rating-count">
                  {Number(product.rating || 5).toFixed(1)} ({product.reviews || 0})
                </button>
              </div>
            </header>

            {discount > 0 && (
              <div className="product-detail__badge">
                <span>{discount}% OFF</span>
              </div>
            )}

            <div className="product-detail__pricing">
              <div>
                <p className="product-detail__price">{formatCurrency(price)}</p>
                {originalPrice && <p className="product-detail__savings">Save {formatCurrency(originalPrice - price)}</p>}
              </div>
              {originalPrice && <p className="product-detail__compare">{formatCurrency(originalPrice)}</p>}
            </div>

            <div className="product-detail__description" dangerouslySetInnerHTML={{ __html: product.description || product.short_description || "" }} />

            <div className="product-detail__options">
              {product.variant && (
                <div className="product-detail__option">
                  <p className="product-detail__option-label">Variant</p>
                  <strong>{product.variant}</strong>
                </div>
              )}

              <div className="product-detail__option">
                <p className="product-detail__option-label">{t("product.size") || "Size"}</p>
                <div className="product-detail__sizes">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`product-detail__size ${selectedSize === size ? "is-selected" : ""}`}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        borderColor: selectedSize === size ? "black" : "#e5e5e5",
                        backgroundColor: selectedSize === size ? "black" : "transparent",
                        color: selectedSize === size ? "white" : "black"
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="product-detail__cta"
              onClick={handleAddToCart}
            >
              {t("product.add.to.bag") || "Add To Bag"}
            </button>

            <div className="product-detail__features">
              <p><FiCheck /> Free shipping on orders over $200</p>
              <p><FiCheck /> 30-day return policy</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
