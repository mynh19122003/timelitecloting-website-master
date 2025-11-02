/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { ProductCard } from "../../components/ui/ProductCard";
import { ValueProps } from "../../components/ui/ValueProps";
import styles from "./ProductDetailPage.module.css";
import ApiService from "../../services/api";
import { getAdminMediaUrlByAny, normalizePossibleMediaUrl, toProductsPid } from "../../config/api";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<UiProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const buildFallbacks = (initial: string): string[] => {
    const variants: string[] = [];
    const add = (u: string) => {
      if (u && !variants.includes(u)) variants.push(u);
    };
    add(initial);
    if (initial.includes(":3001/")) add(initial.replace(":3001/", ":3002/"));
    if (initial.includes(":3002/")) add(initial.replace(":3002/", ":3001/"));
    if (/\.webp$/i.test(initial)) {
      add(initial.replace(/\.webp$/i, ".jpg"));
      add(initial.replace(/\.webp$/i, ".png"));
    }
    return variants;
  };
  const [mainImgIndex, setMainImgIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const mapProduct = (p: any): UiProduct => {
      const slug: string | undefined = p.slug ?? undefined;
      const pidLike: string | number | undefined = p.products_id ?? p.product_id ?? p.id ?? p.productId;
      
      // Normalize products_id to PID format (e.g., PID00001)
      const pid = pidLike ? toProductsPid(pidLike) : undefined;
      
      const fromSlug = (s?: string): Category | "other" => {
        if (!s) return "other" as any;
        if (s.startsWith("ao-dai-")) return "ao-dai" as any;
        if (s.startsWith("vest-")) return "vest" as any;
        if (s.startsWith("wedding-") || s.startsWith("bridal-")) return "wedding" as any;
        if (s.startsWith("evening-")) return "evening" as any;
        return "other" as any;
      };
      
      const raw = typeof p.image_url === 'string' ? p.image_url.trim() : '';
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
      const gallery = galleryRaw.map((g: string) => normalizePossibleMediaUrl(g) || g);
      
      // Normalize category from API (could be label like "Bridal Gowns" or slug like "wedding")
      const apiCategory = p.category ? normalizeCategory(p.category) : fromSlug(slug);
      const finalCategory = apiCategory !== "other" ? (apiCategory as Category) : (fromSlug(slug) as any);
      
      return {
        id: slug ?? String(p.id),
        pid: pid,
        name: p.name,
        category: finalCategory,
        shortDescription: p.short_description ?? "",
        description: p.description ?? "",
        price: Number(p.price ?? 0),
        originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
        colors: Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? (safeParseArray(p.colors) || []) : []),
        sizes: Array.isArray(p.sizes) ? p.sizes : (typeof p.sizes === 'string' ? (safeParseArray(p.sizes) || ["S", "M", "L"]) : ["S", "M", "L"]),
        image,
        gallery,
        rating: Number(p.rating ?? 0),
        reviews: Number(p.reviews ?? 0),
        tags: Array.isArray(p.tags) ? p.tags : [],
        isFeatured: Boolean(p.is_featured ?? false),
        isNew: Boolean(p.is_new ?? false),
      };
    };

    const safeParseArray = (value: string): string[] | null => {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    };

    setLoading(true);
    // Use getProduct instead of getProductBySlug to support both PID and slug
    ApiService.getProduct(id)
      .then((res) => {
        const data = (res as any).data ?? res;
        const mapped = mapProduct(data);
        if (!isMounted) return;
        setProduct(mapped);
        setSelectedImage(mapped.gallery[0] ?? "");
        setSelectedColor(mapped.colors[0] ?? "");
        setSelectedSize(mapped.sizes[0] ?? "M");
        // Load related
        return ApiService.getProducts({ limit: 10, category: mapped.category });
      })
      .then((listRes) => {
        if (!listRes || !isMounted) return;
        const list = (listRes as any).products ?? [];
        const related = list
          .map((p: any) => mapProduct(p))
          .filter((p: UiProduct) => p.id !== id)
          .slice(0, 3);
        setRelatedProducts(related);
      })
      .catch(() => {
        if (isMounted) {
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
  }, [id]);

  const comparisonSet = useMemo(() => {
    if (!product) {
      return [] as UiProduct[];
    }
    return [product, ...relatedProducts].slice(0, 3);
  }, [product, relatedProducts]);

  if (!loading && !product) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.eyebrow}>Product</p>
        <h1 className={styles.emptyTitle}>Product not found</h1>
        <p className={styles.emptyText}>
          This design may have moved to a new capsule. Please return to the shop to explore the latest Timelite collections.
        </p>
        <Link to="/shop" className={styles.emptyButton}>
          Back to Shop
        </Link>
      </div>
    );
  }

  if (loading || !product) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.eyebrow}>Product</p>
        <h1 className={styles.emptyTitle}>Loading...</h1>
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
          Back to shop
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
                        const current = el.src;
                        if (current.includes(":3001/")) {
                          el.src = current.replace(":3001/", ":3002/");
                        } else if (/\.webp$/i.test(current)) {
                          el.src = current.replace(/\.webp$/i, ".jpg");
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
                  {product.rating.toFixed(1)} ({product.reviews} reviews)
                </p>
              </div>
            </div>

            <div className={styles.options}>
              <div className={styles.optionGroup}>
                <p className={styles.optionLabel}>Colors</p>
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
                <p className={styles.optionLabel}>Sizes</p>
                <div className={styles.optionList}>
                  {product.sizes.map((size) => {
                    const className = `${styles.sizeButton} ${
                      selectedSize === size ? styles.sizeButtonActive : ""
                    }`.trim();
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={className}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <p className={styles.note}>
                  Complimentary alterations within 14 days for U.S. deliveries.
                </p>
              </div>

              <div className={styles.ctaRow}>
                <label className={styles.quantityControl}>
                  Qty
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
                  Add to Cart
                </button>

                <Link to="/contact" className={styles.fittingLink}>
                  Book fitting
                </Link>
              </div>
            </div>

            <div className={styles.policies}>
              <div className={styles.policyItem}>
                <FiPackage className={styles.policyIcon} />
                <p>
                  Complimentary express shipping within the United States on orders above $1,500. Each piece
                  arrives with a garment bag and steaming kit.
                </p>
              </div>
              <div className={styles.policyItem}>
                <FiRotateCcw className={styles.policyIcon} />
                <p>
                  Alterations or remake available within 14 days of delivery. Returns accepted for store
                  credit on unworn garments.
                </p>
              </div>
            </div>

            <div className={styles.detailsSection}>
              <h2 className={styles.detailsHeading}>Detailed description</h2>
              <p className={styles.detailsText}>{product.description}</p>
              <ul className={styles.detailsList}>
                <li>
                  <FiCheck className={styles.checkIcon} />
                  Fabrication: 100% mulberry silk handcrafted in Vietnam.
                </li>
                <li>
                  <FiCheck className={styles.checkIcon} />
                  Complimentary virtual fitting with a Timelite stylist.
                </li>
                <li>
                  <FiCheck className={styles.checkIcon} />
                  Made to order. Production window 14 to 18 days.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.compareSection}>
        <h2 className={styles.compareHeading}>Compare the collection</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.tableHeadCell}>Model</th>
                {comparisonSet.map((item) => (
                  <th key={item.id} className={styles.tableHeadCell}>
                    {item.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>Price</td>
                {comparisonSet.map((item) => (
                  <td key={item.id} className={styles.tableCell}>
                    {formatCurrency(item.price)}
                  </td>
                ))}
              </tr>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>Colors</td>
                {comparisonSet.map((item) => (
                  <td key={item.id} className={styles.tableCell}>
                    {item.colors.join(", ")}
                  </td>
                ))}
              </tr>
              <tr className={styles.tableRow}>
                <td className={styles.tableCell}>Highlights</td>
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

      <section className={styles.relatedSection}>
        <div className={styles.relatedHeader}>
          <h2 className={styles.relatedTitle}>Related pieces</h2>
          <Link to="/shop" className={styles.relatedLink}>
            View all
          </Link>
        </div>
        <div className={styles.relatedGrid}>
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <div className={styles.valueProps}>
        <ValueProps />
      </div>
    </div>
  );
};

  export default ProductDetailPage;
