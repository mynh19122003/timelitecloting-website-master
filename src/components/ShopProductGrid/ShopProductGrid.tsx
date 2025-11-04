"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { type Product as UiProduct, type ProductCategory } from "../../data/products";
import ApiService from "../../services/api";
import { getAdminMediaUrlByAny, normalizePossibleMediaUrl } from "../../config/api";
import styles from "./ShopProductGrid.module.css";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const categoryFilters: Array<{ label: string; value: "all" | ProductCategory }> = [
  { label: "All Products", value: "all" },
  { label: "Áo Dài", value: "ao-dai" },
  { label: "Áo Vest", value: "vest" },
  { label: "Đầm Cưới", value: "wedding" },
  { label: "Đầm Dạ Hội", value: "evening" },
];

export default function ShopProductGrid() {
  const [activeFilter, setActiveFilter] = useState<(typeof categoryFilters)[number]["value"]>("all");
  const [allProducts, setAllProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const mapProduct = (p: any): UiProduct => {
      const slug: string | undefined = p.slug ?? undefined;
      const pidLike: string | number | undefined = p.products_id ?? p.product_id ?? p.id ?? p.productId;
      const fromSlug = (s?: string): any => {
        if (!s) return "other";
        if (s.startsWith("ao-dai-")) return "ao-dai";
        if (s.startsWith("vest-")) return "vest";
        if (s.startsWith("wedding-") || s.startsWith("bridal-")) return "wedding";
        if (s.startsWith("evening-")) return "evening";
        return "other";
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
      return {
        id: slug ?? String(p.id),
        name: p.name,
        category: (p.category as any) ?? fromSlug(slug),
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
    ApiService.getProducts({ limit: 100 })
      .then((res) => {
        const list = res?.products ?? [];
        if (isMounted) setAllProducts(list.map(mapProduct));
      })
      .catch(() => {
        if (isMounted) setAllProducts([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return allProducts;
    return allProducts.filter((product) => product.category === activeFilter);
  }, [activeFilter, allProducts]);

  const buildFallbacks = (initial: string): string[] => {
    const variants: string[] = [];
    const add = (u: string) => {
      if (u && !variants.includes(u)) variants.push(u);
    };
    add(initial);
    // Port swap between 3001 and 3002
    if (initial.includes(":3001/")) add(initial.replace(":3001/", ":3002/"));
    if (initial.includes(":3002/")) add(initial.replace(":3002/", ":3001/"));
    // Extension fallbacks
    if (initial.endsWith(".webp")) {
      add(initial.replace(/\.webp$/i, ".jpg"));
      add(initial.replace(/\.webp$/i, ".png"));
    }
    return variants;
  };

  const ImageWithFallback = ({ src, alt }: { src: string; alt: string }) => {
    const fallbacks = useMemo(() => buildFallbacks(src), [src]);
    const [index, setIndex] = useState(0);
    const current = fallbacks[index] ?? src;
    return (
      <Image
        src={current}
        alt={alt}
        fill
        sizes="(min-width: 1200px) 280px, (min-width: 768px) 45vw, 90vw"
        style={{ objectFit: "cover" }}
        unoptimized
        onError={() => {
          if (index + 1 < fallbacks.length) {
            setIndex(index + 1);
          } else {
            // Final local placeholder
            const placeholder = "/images/image_1.png";
            if (current !== placeholder) {
              fallbacks.push(placeholder);
              setIndex(fallbacks.length - 1);
            }
          }
        }}
      />
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.wrapper}>
        <div className={styles.toolbar}>
          <div className={styles.filters} role="tablist" aria-label="Product categories">
            {categoryFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={filter.value === activeFilter}
                onClick={() => setActiveFilter(filter.value)}
                className={`${styles.filterButton} ${
                  filter.value === activeFilter ? styles.filterButtonActive : ""
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span className={styles.resultInfo}>
            Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <article key={product.name} className={styles.card}>
                <div className={styles.imageWrapper}>
                  {product.badge && (
                    <span
                      className={`${styles.badge} ${
                        product.badge.variant === "sale" ? styles.badgeSale : styles.badgeNew
                      }`}
                    >
                      {product.badge.label}
                    </span>
                  )}
                  <ImageWithFallback src={product.image} alt={product.name} />
                </div>
                <div className={styles.content}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <p className={styles.description}>{product.description}</p>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>{currencyFormatter.format(product.price)}</span>
                    {product.oldPrice && (
                      <span className={styles.oldPrice}>
                        {currencyFormatter.format(product.oldPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No products available in this category yet.</div>
        )}
      </div>
    </section>
  );
}
