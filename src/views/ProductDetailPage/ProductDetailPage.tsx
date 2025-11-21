/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiCheck,
  FiChevronLeft,
  FiPackage,
  FiRotateCcw,
  FiStar,
} from "react-icons/fi";
import { categoryLabels, normalizeCategory, type Category, type Product as UiProduct } from "../../data/products";
import { useCart } from "../../context/CartContext";
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
  const [quantity, setQuantity] = useState(1);
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
      let image = fromPid ?? '';
      if (!image) {
        if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) {
          image = raw;
        } else if (/^pid\d+\//i.test(raw)) {
          const [pidPart, filePart] = raw.split('/');
          const built = getAdminMediaUrlByAny(pidPart, filePart || 'main.webp');
          image = built || '';
        }
      }
      image = normalizePossibleMediaUrl(image) || "/images/image_1.png";
      
      const galleryRaw = Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [image];
      const gallery = galleryRaw.map((g) => normalizePossibleMediaUrl(g) || g);
      
      // Normalize category from API (could be label like "Bridal Gowns" or slug like "wedding")
      const apiCategory = p.category ? normalizeCategory(p.category) : fromSlug(slug);
      const finalCategory = apiCategory !== "other" ? apiCategory : fromSlug(slug);
      
      return {
        id: slug ?? String(p.id),
        pid,
        name: p.name ?? "",
        category: finalCategory,
        shortDescription: p.short_description ?? "",
        description: p.description ?? "",
        price: Number(p.price ?? 0),
        originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
        colors: Array.isArray(p.colors) ? p.colors : (safeParseArray(p.colors) || []),
        sizes: Array.isArray(p.sizes) ? p.sizes : (safeParseArray(p.sizes) || ["S", "M", "L"]),
        image,
        gallery,
        rating: Number(p.rating ?? 0),
        reviews: Number(p.reviews ?? 0),
        tags: Array.isArray(p.tags) ? p.tags : [],
        isFeatured: Boolean(p.is_featured ?? false),
        isNew: Boolean(p.is_new ?? false),
      };
    };

    setLoading(true);
    // Use getProduct instead of getProductBySlug to support both PID and slug
    ApiService.getProduct(id)
      .then((res) => {
        const data = (res as { data?: ApiProduct } | ApiProduct).data ?? res;
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
            if (!prevSize || !mapped.sizes.includes(prevSize)) {
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
          error: error?.message || error,
          status: error?.status
        });

        if (isMounted) {
          // If 404 or product not found, redirect to 404 page
          if (error?.status === 404 || error?.message?.toLowerCase().includes('not found')) {
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

  const comparisonSet = useMemo(() => {
    if (!product) {
      return [] as UiProduct[];
    }
    return [product, ...relatedProducts].slice(0, 3);
  }, [product, relatedProducts]);

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

  const handleAddToCart = () => {
    const response = addToCart({
      productId: product.id,
      pid: product.pid,
      name: product.name,
      image: product.image,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    showToast(response.message, response.status);
  };

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
                src={buildFallbacks(selectedImage)[mainImgIndex] || selectedImage}
                alt={product.name}
                className={styles.mainImage}
                onError={() => {
                  const candidates = buildFallbacks(selectedImage);
                  if (mainImgIndex + 1 < candidates.length) {
                    setMainImgIndex(mainImgIndex + 1);
                  } else if (candidates[candidates.length - 1] !== "/images/image_1.png") {
                    setMainImgIndex(candidates.length); // placeholder
                  }
                }}
              />
            </div>
            <div className={styles.thumbnailGrid}>
              {product.gallery.map((image) => {
                const buttonClass = `${styles.thumbnailButton} ${
                  selectedImage === image ? styles.thumbnailActive : ""
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
                    const className = `${styles.colorButton} ${
                      selectedColor === color ? styles.colorButtonActive : ""
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
                    const className = `${styles.sizeButton} ${
                      isActive ? styles.sizeButtonActive : ""
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
                <label className={styles.quantityControl}>
                  {t("product.quantity")}
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Math.max(Number(event.target.value), 1))
                    }
                    className={styles.quantityInput}
                  />
                </label>

                <button onClick={handleAddToCart} className={styles.addToCart}>
                  {t("product.add.to.cart")}
                </button>

                <Link to="/contact" className={styles.fittingLink}>
                  {t("product.book.fitting")}
                </Link>
              </div>
            </div>

            <div className={styles.policies}>
              <div className={styles.policyItem}>
                <FiPackage className={styles.policyIcon} />
                <p>
                  {t("product.shipping.info")} {t("product.shipping.arrives")}
                </p>
              </div>
              <div className={styles.policyItem}>
                <FiRotateCcw className={styles.policyIcon} />
                <p>
                  {t("product.alterations")}
                </p>
              </div>
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

      <section className={styles.compareSection}>
        <h2 className={styles.compareHeading}>{t("product.compare.collection")}</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableHeadCell}>{t("common.model")}</th>
                {comparisonSet.map((item) => (
                  <th key={item.id} className={styles.tableHeadCell}>
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>{t("product.price")}</td>
                {comparisonSet.map((item) => (
                  <td key={item.id} className={styles.tableCell}>
                    {formatCurrency(item.price)}
                  </td>
                ))}
              </tr>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>{t("product.colors")}</td>
                {comparisonSet.map((item) => (
                  <td key={item.id} className={styles.tableCell}>
                    {item.colors.join(", ")}
                  </td>
                ))}
              </tr>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>{t("product.highlights")}</td>
                {comparisonSet.map((item) => (
                  <td key={item.id} className={styles.tableCell}>
                    {item.tags.slice(0, 2).join(" | ")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
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
