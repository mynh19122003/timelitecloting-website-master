/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiChevronLeft,
  FiStar,
} from "react-icons/fi";
import { categoryLabels, normalizeCategory, type Category, type Product as UiProduct } from "../../data/products";
import { useCart, type CartItem } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { useI18n } from "../../context/I18nContext";
import { formatCurrency } from "../../utils/currency";
import { ProductCard } from "../../components/ui/ProductCard";
import { ProductSlider } from "../../components/ui/ProductSlider/ProductSlider";
import { ValueProps } from "../../components/ui/ValueProps";
import { ReviewsSection } from "../../components/ui/ReviewsSection/ReviewsSection";
import styles from "./ProductDetailPage.module.css";
import ApiService from "../../services/api";
import { getAdminMediaUrlByAny, normalizePossibleMediaUrl, toProductsPid } from "../../config/api";

type ApiProduct = {
  id?: number | string;
  slug?: string;
  products_id?: string | number;
  product_id?: string | number;
  productId?: string | number;
  image_url?: string;
  gallery?: string[];
  category?: string;
  name?: string;
  short_description?: string;
  description?: string;
  price?: number | string;
  original_price?: number | string | null;
  colors?: string[] | string;
  sizes?: string[] | string;
  tags?: string[] | string;
  is_featured?: boolean;
  is_new?: boolean;
};

const safeParseArray = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v));
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map((v) => String(v)) : null;
    } catch {
      return null;
    }
  }
  return null;
};

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UiProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRelated, setLoadingRelated] = useState<boolean>(false);
  const previousProductIdRef = useRef<string | undefined>(undefined);
  const buildFallbacks = (initial: string): string[] => {
    const normalized = normalizePossibleMediaUrl(initial) || initial || "";
    const variants: string[] = [];
    const add = (u?: string) => {
      if (u && !variants.includes(u)) variants.push(u);
    };
    add(normalized);
    if (/\.webp$/i.test(normalized)) {
      add(normalized.replace(/\.webp$/i, ".jpg"));
      add(normalized.replace(/\.webp$/i, ".png"));
    }
    return variants.length ? variants : ["/images/image_1.png"];
  };
  const [mainImgIndex, setMainImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const mapProduct = (p: ApiProduct): UiProduct => {
      const slug: string | undefined = p.slug ?? undefined;
      const pidLike: string | number | undefined = p.products_id ?? p.product_id ?? p.id ?? p.productId;

      // Normalize products_id to PID format (e.g., PID00001)
      const pid = pidLike ? toProductsPid(pidLike) : undefined;

      const fromSlug = (s?: string): Category | "other" => {
        if (!s) return "other";
        if (s.startsWith("ao-dai-")) return "ao-dai";
        if (s.startsWith("vest-")) return "vest";
        if (s.startsWith("wedding-") || s.startsWith("bridal-")) return "wedding";
        if (s.startsWith("evening-")) return "evening";
        return "other";
      };

      const raw = typeof p.image_url === "string" ? p.image_url.trim() : "";
      const fromPid = getAdminMediaUrlByAny(pidLike);
      let image = fromPid ?? "";
      if (!image) {
        if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) {
          image = raw;
        } else if (/^pid\d+\//i.test(raw)) {
          const [pidPart, filePart] = raw.split("/");
          const built = getAdminMediaUrlByAny(pidPart, filePart || "main.webp");
          image = built || "";
        }
      }
      image = normalizePossibleMediaUrl(image) || "/images/image_1.png";

      // Build gallery URLs from DB values (PID/file or absolute URLs)
      const galleryRaw = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [image];
      const gallery = galleryRaw.map((g) => {
        if (!g) return image;
        const value = String(g).trim();
        // Absolute URL or already admin/media → just normalize host
        if (/^https?:\/\//i.test(value) || value.startsWith("/admin/media/")) {
          return normalizePossibleMediaUrl(value) || value;
        }
        // Pattern like PID00001/main_2.webp or pid00001/gallery_1.webp
        if (/^pid\d+\//i.test(value)) {
          const [pidPart, filePart] = value.split("/");
          const built = getAdminMediaUrlByAny(pidPart, filePart || "main.webp");
          return normalizePossibleMediaUrl(built || "") || built || image;
        }
        // Fallback: if it looks like just a file under this product PID
        if (pidLike && /^[\w.-]+\.(webp|jpg|jpeg|png)$/i.test(value)) {
          const built = getAdminMediaUrlByAny(pidLike, value);
          return normalizePossibleMediaUrl(built || "") || built || image;
        }
        return image;
      });

      // Normalize category from API (could be label like "Bridal Gowns" or slug like "wedding")
      const apiCategory = p.category ? normalizeCategory(p.category) : fromSlug(slug);
      const finalCategory = apiCategory !== "other" ? apiCategory : fromSlug(slug);

      const rawSizes = Array.isArray(p.sizes) ? p.sizes : (safeParseArray(p.sizes) || [])
      const normalizedSizes = rawSizes
        .map((size) => (typeof size === "string" ? size.trim() : String(size ?? "")))
        .filter((size) => size.length > 0)
      const safeSizes = normalizedSizes.length > 0 ? normalizedSizes : ["One Size"]

      return {
        id: slug ?? String(p.id),
        pid,
        name: p.name ?? "",
        category: finalCategory as Category,
        shortDescription: p.short_description ?? "",
        description: p.description ?? "",
        price: Number(p.price ?? 0),
        originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
        colors: Array.isArray(p.colors) ? p.colors : (safeParseArray(p.colors) || []),
        sizes: safeSizes as Array<"XS" | "S" | "M" | "L" | "XL">,
        image,
        gallery,
        rating: Number((p as ApiProduct & { rating?: number | string }).rating ?? 0),
        reviews: Number((p as ApiProduct & { reviews?: number | string }).reviews ?? 0),
        tags: Array.isArray(p.tags) ? p.tags : [],
        isFeatured: Boolean(p.is_featured ?? false),
        isNew: Boolean(p.is_new ?? false),
      };
    };

    setLoading(true);
    // Use getProduct instead of getProductBySlug to support both PID and slug
    ApiService.getProduct(id)
      .then((res) => {
        const data = ((res as { data?: ApiProduct } | ApiProduct) as { data?: ApiProduct }).data ?? res as ApiProduct;
        const mapped = mapProduct(data);
        if (!isMounted) return;
        setProduct(mapped);
        setSelectedImage(mapped.gallery[0] ?? "");
        setSelectedColor(mapped.colors[0] ?? "");
        // Only reset size when product id actually changes
        if (previousProductIdRef.current !== id) {
          setSelectedSize(mapped.sizes[0] ?? "");
          previousProductIdRef.current = id;
        } else {
          // If current selection is not available in new product, reset to first size
          setSelectedSize((prevSize) => {
            if (!prevSize || !mapped.sizes.includes(prevSize as "XS" | "S" | "M" | "L" | "XL")) {
              return mapped.sizes[0] ?? "";
            }
            return prevSize;
          });
        }

        // Load related products separately - load 15 products for slider
        if (isMounted) {
          setLoadingRelated(true);
          ApiService.getRelatedProducts(mapped.category, id, 15)
            .then((relatedList) => {
              if (!isMounted) return;
              const related = (Array.isArray(relatedList) ? relatedList : [])
                .map((p) => mapProduct(p as ApiProduct))
                .filter((p: UiProduct) => p.id !== id);
              setRelatedProducts(related);
            })
            .catch((relatedError) => {
              console.error('[ProductDetailPage] Error loading related products:', relatedError);
              if (isMounted) {
                setRelatedProducts([]);
              }
            })
            .finally(() => {
              if (isMounted) {
                setLoadingRelated(false);
              }
            });
        }
      })
      .catch((error: unknown) => {
        // Log error to console
        console.error('[ProductDetailPage] Error loading product:', {
          id,
          error: (error as { message?: string })?.message || String(error),
          status: (error as { status?: number })?.status
        });

        if (isMounted) {
          // If 404 or product not found, redirect to 404 page
          if ((error as { status?: number })?.status === 404 || (error as { message?: string })?.message?.toLowerCase().includes('not found')) {
            navigate('/404', { replace: true });
            return;
          }
          setProduct(null);
          setRelatedProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  // Redirect to 404 page if product not found after loading
  useEffect(() => {
    if (!loading && !product && id) {
      console.error('[ProductDetailPage] Product not found, redirecting to 404:', id);
      navigate('/404', { replace: true });
    }
  }, [loading, product, id, navigate]);

  if (!loading && !product) {
    return null; // Will redirect via useEffect
  }

  if (loading || !product) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.eyebrow}>{t("common.product")}</p>
        <h1 className={styles.emptyTitle}>{t("common.loading")}</h1>
      </div>
    );
  }

  const addItemToCart = () => {
    const response = addToCart({
      productId: product.id,
      pid: product.pid,
      name: product.name,
      image: product.image,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
    });
    showToast(response.message, response.status);
    return response.status === "success";
  };

  const buildDirectPurchaseItem = (): CartItem => ({
    id: `direct::${String(product.id)}::${selectedColor || "any"}::${selectedSize || "any"}`,
    productId: product.id,
    pid: product.pid,
    name: product.name,
    image: product.image,
    price: product.price,
    color: selectedColor,
    size: selectedSize,
    quantity: 1,
  });

  const handleAddToBag = () => {
    addItemToCart();
  };

  const handleBuyNow = () => {
    const directItem = buildDirectPurchaseItem();
    navigate("/checkout", { state: { directPurchase: directItem } });
  };

  const shippingNotes = [
    t("product.shipping.info"),
    t("product.alterations"),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.backLinkWrapper}>
        <Link to="/shop" className={styles.backLink}>
          <FiChevronLeft className={styles.iconSmall} />
          {t("common.back.to.shop")}
        </Link>
      </div>

      <section className={styles.contentSection}>
        <div className={styles.contentGrid}>
          <div className={styles.galleryMain}>
            <div className={styles.mainImageWrapper}>
              <img
                src={selectedImage || product.gallery[0] || product.image}
                alt={product.name}
                className={styles.mainImage}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (el.dataset.failedOnce === "1") {
                    el.src = "/images/image_1.png";
                    return;
                  }
                  el.dataset.failedOnce = "1";
                  el.src = "/images/image_1.png";
                }}
              />
            </div>
            <div className={styles.thumbnailGrid}>
              {product.gallery.map((image) => {
                const buttonClass = `${styles.thumbnailButton} ${selectedImage === image ? styles.thumbnailActive : ""
                  }`.trim();
                return (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={buttonClass}
                  >
                    <img
                      src={image}
                      alt={`${product.name} preview`}
                      className={styles.thumbnailImage}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement;
                        if (el.dataset.failedOnce === "1") {
                          el.src = "/images/image_1.png";
                          return;
                        }
                        el.dataset.failedOnce = "1";
                        if (/\.webp$/i.test(el.src)) {
                          el.src = el.src.replace(/\.webp$/i, ".jpg");
                        } else {
                          el.src = "/images/image_1.png";
                        }
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.detailsColumn}>
            <div className={styles.productMeta}>
              <span className={styles.eyebrow}>
                {categoryLabels[product.category]}
              </span>
              <h1 className={styles.title}>{product.name}</h1>
              <p className={styles.subtitle}>{product.shortDescription}</p>

              <div className={styles.priceRow}>
                <p className={styles.price}>{formatCurrency(product.price)}</p>
                {product.originalPrice && (
                  <p className={styles.comparePrice}>
                    {formatCurrency(product.originalPrice)}
                  </p>
                )}
                <p className={styles.rating}>
                  <FiStar className={styles.iconInlineGold} />
                  {product.rating.toFixed(1)} ({product.reviews} {t("common.reviews")})
                </p>
              </div>
            </div>

            <div className={styles.options}>
              <div className={styles.optionGroup}>
                <p className={styles.optionLabel}>{t("product.color")}</p>
                <div className={styles.optionList}>
                  {product.colors.map((color) => {
                    const className = `${styles.colorButton} ${selectedColor === color ? styles.colorButtonActive : ""
                      }`.trim();
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={className}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.optionGroup}>
                <p className={styles.optionLabel}>{t("product.size")}</p>
                <div className={styles.optionList}>
                  {product.sizes.map((size) => {
                    const isActive = selectedSize === size;
                    const className = `${styles.sizeButton} ${isActive ? styles.sizeButtonActive : ""
                      }`.trim();
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                        }}
                        className={className}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <p className={styles.availableSizes}>
                  {t("product.available.sizes")}: {product.sizes.join(", ")}
                </p>
              </div>

              <div className={styles.ctaRow}>
                <button onClick={handleAddToBag} className={styles.addToCart}>
                  {t("product.add.to.cart")}
                </button>

                <button onClick={handleBuyNow} className={styles.buyNowButton}>
                  {t("product.book.fitting")}
                </button>
              </div>
            </div>

            <div className={styles.policies}>
              <ul className={styles.policyList}>
                {shippingNotes.map((note) => (
                  <li key={note} className={styles.policyLine}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.detailsSection}>
              <h2 className={styles.detailsHeading}>{t("product.detailed.description")}</h2>
              <p className={styles.detailsText}>{product.description}</p>
              <ul className={styles.detailsList}>
                <li>
                  <FiCheck className={styles.checkIcon} />
                  {t("product.fabrication")}
                </li>
                <li>
                  <FiCheck className={styles.checkIcon} />
                  {t("product.complimentary.fitting")}
                </li>
                <li>
                  <FiCheck className={styles.checkIcon} />
                  {t("product.made.to.order")}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection
        productId={product.id}
        productRating={product.rating}
        productReviewsCount={product.reviews}
      />

      <section className={styles.relatedSection}>
        <div className={styles.relatedHeader}>
          <h2 className={styles.relatedTitle}>{t("product.related.pieces")}</h2>
          <Link to="/shop" className={styles.relatedLink}>
            {t("common.view.all")}
          </Link>
        </div>
        <div className={styles.relatedSlider}>
          <ProductSlider
            products={relatedProducts}
            itemsPerView={5}
            loading={loadingRelated}
          />
        </div>
      </section>

      <div className={styles.valueProps}>
        <ValueProps />
      </div>
    </div>
  );
};

export default ProductDetailPage;
